import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;
import { AnalyzeCandidateDto } from './dto/analyze-candidate.dto';
import { PrismaService } from '../prisma.service';
import { EmailService } from './email.service';

export interface MissingInformation {
  missingSkills: string[];
  unclearExperience: string[];
  qualificationGaps: string[];
}

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  relevanceSummary: string;
  missingInformation: MissingInformation;
  followUpMessage: string;
  tone: string;
  emailSent: boolean;
  emailSentTo: string | null;
}

@Injectable()
export class RecruitmentService {
  private readonly anthropic: Anthropic;
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text?.trim();
      if (!text) {
        throw new HttpException(
          'Could not extract text from the uploaded PDF. Please paste your resume text directly instead.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return text;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        'Could not extract text from the uploaded PDF. Please paste your resume text directly instead.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async analyze(
    dto: AnalyzeCandidateDto,
    resumeFile?: Express.Multer.File,
  ): Promise<AnalysisResult> {
    let resumeText: string;

    if (resumeFile) {
      resumeText = await this.extractPdfText(resumeFile.buffer);
    } else if (dto.resumeText?.trim()) {
      resumeText = dto.resumeText.trim();
    } else {
      throw new HttpException(
        'Please provide a resume — either upload a PDF or paste resume text.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tone = dto.tone ?? 'friendly';
    const jobDescription = dto.jobDescription.trim();

    const systemPrompt = `You are a recruitment AI assistant. Your task is to analyze candidate resumes against job descriptions.
Always respond with valid JSON only — no markdown fences, no prose, no explanation outside the JSON object.
Follow the exact schema provided in the user message.`;

    const userPrompt = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

TONE: ${tone}

Analyze the resume against the job description and return JSON with EXACTLY this structure (no other text):
{
  "matchScore": <integer between 0 and 100>,
  "strengths": [<string describing a specific strength that aligns with the JD>, ...],
  "relevanceSummary": "<2-4 sentence narrative explaining the match score and overall fit>",
  "missingInformation": {
    "missingSkills": [<string for each skill in JD not evidenced in resume>, ...],
    "unclearExperience": [<string for each experience entry that lacks dates, scope, or outcomes>, ...],
    "qualificationGaps": [<string for each degree/certification/requirement not met or mentioned>, ...]
  },
  "followUpMessage": "<personalized professional message to the candidate requesting the specific missing information, using ${tone} tone>"
}`;

    try {
      const response = await Promise.race([
        this.anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('TIMEOUT')),
            28000,
          ),
        ),
      ]);

      const rawText =
        response.content[0].type === 'text' ? response.content[0].text : '';

      let parsed: AnalysisResult;
      try {
        parsed = JSON.parse(rawText) as AnalysisResult;
      } catch {
        throw new HttpException(
          'An unexpected error occurred. Please try again.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      parsed.tone = tone;

      try {
        await this.prisma.candidateAnalysis.create({
          data: {
            jobDescription,
            matchScore: parsed.matchScore,
            strengths: JSON.stringify(parsed.strengths),
            relevanceSummary: parsed.relevanceSummary,
            missingSkills: JSON.stringify(parsed.missingInformation.missingSkills),
            unclearExperience: JSON.stringify(parsed.missingInformation.unclearExperience),
            qualificationGaps: JSON.stringify(parsed.missingInformation.qualificationGaps),
            followUpMessage: parsed.followUpMessage,
            tone,
          },
        });
      } catch (err) {
        console.error('[RecruitmentService] Failed to persist analysis:', err);
      }

      // Auto-send email if missing info detected and applicant email is available
      const hasMissingInfo =
        parsed.missingInformation.missingSkills.length > 0 ||
        parsed.missingInformation.unclearExperience.length > 0 ||
        parsed.missingInformation.qualificationGaps.length > 0;

      // Resolve email: prefer explicitly passed email, else look up from applicationId
      let resolvedEmail = dto.applicantEmail?.trim() || null;
      if (!resolvedEmail && dto.applicationId) {
        try {
          const app = await this.prisma.application.findUnique({ where: { id: dto.applicationId } });
          resolvedEmail = app?.applicantEmail ?? null;
        } catch {
          this.logger.warn(`Could not find application ${dto.applicationId} for email lookup.`);
        }
      }

      let emailSent = false;
      if (hasMissingInfo && resolvedEmail) {
        try {
          await this.emailService.sendMissingInfoEmail({
            toEmail: resolvedEmail,
            candidateName: parsed.followUpMessage.match(/Dear ([^,]+),/)?.[1] ?? 'Applicant',
            jobTitle: dto.jobDescription.slice(0, 60),
            followUpMessage: parsed.followUpMessage,
          });
          emailSent = true;

          // Mark application as analyzed if applicationId provided
          if (dto.applicationId) {
            await this.prisma.application.update({ where: { id: dto.applicationId }, data: { analyzed: true } });
          }
        } catch (emailErr) {
          this.logger.error('Failed to send follow-up email:', emailErr);
        }
      } else if (dto.applicationId) {
        await this.prisma.application.update({ where: { id: dto.applicationId }, data: { analyzed: true } });
      }

      return { ...parsed, emailSent, emailSentTo: emailSent ? resolvedEmail : null };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      if (err instanceof Error && err.message === 'TIMEOUT') {
        throw new HttpException(
          'The analysis took too long to complete. Please try again.',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      throw new HttpException(
        'An unexpected error occurred. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
