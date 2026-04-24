import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RecruitmentService } from './recruitment.service';
import { AnalyzeCandidateDto } from './dto/analyze-candidate.dto';
import { AgentsService } from '../agents/agents.service';

@Controller('api/recruitment')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly agentsService: AgentsService,
  ) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('resumeFile', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(
            new HttpException(
              'Only PDF files are accepted.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AnalyzeCandidateDto,
  ) {
    try {
      const result = await this.recruitmentService.analyze(dto, file);
      return { success: true, data: result, error: null };
    } catch (err) {
      if (err instanceof HttpException) {
        const status = err.getStatus();
        const raw = err.getResponse();
        const message =
          typeof raw === 'string'
            ? raw
            : (raw as any).message ?? (raw as any).error ?? 'An unexpected error occurred.';
        throw new HttpException({ success: false, data: null, error: message }, status);
      }
      throw new HttpException(
        { success: false, data: null, error: 'An unexpected error occurred.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze-agent')
  async analyzeWithAgent(@Body() dto: AnalyzeCandidateDto) {
    try {
      if (!dto.resumeText?.trim()) {
        throw new HttpException('Please provide resume text.', HttpStatus.BAD_REQUEST);
      }

      const tone = dto.tone ?? 'friendly';
      const promptParts = [
        'RESUME:',
        dto.resumeText.trim(),
        '',
        'JOB DESCRIPTION:',
        dto.jobDescription.trim(),
        '',
        'TONE: ' + tone,
        '',
        'Analyze the resume against the job description.',
        'Return JSON with EXACTLY this structure (no other text):',
        '{',
        '  "matchScore": <integer 0-100>,',
        '  "strengths": [<string>, ...],',
        '  "relevanceSummary": "<2-4 sentence narrative>",',
        '  "missingInformation": {',
        '    "missingSkills": [<string>, ...],',
        '    "unclearExperience": [<string>, ...],',
        '    "qualificationGaps": [<string>, ...]',
        '  },',
        '  "followUpMessage": "<personalized message using ' + tone + ' tone>"',
        '}',
      ];

      const result = await this.agentsService.handleMessage({
        message: promptParts.join('\n'),
        agent: 'recruitment',
      });

      let parsedData: unknown;
      try {
        parsedData = JSON.parse(result.reply);
      } catch {
        parsedData = result.reply;
      }

      return { success: true, data: parsedData, error: null };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      throw new HttpException(
        { success: false, data: null, error: message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
