import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RecruitmentService } from '../recruitment/recruitment.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recruitment: RecruitmentService,
  ) {}

  async createApplication(
    jobId: number | string,
    resumeText?: string,
    resumePdfBuffer?: Buffer,
  ) {
    const parsedJobId = typeof jobId === 'string' ? parseInt(jobId, 10) : jobId;
    if (!parsedJobId || isNaN(parsedJobId)) {
      throw new BadRequestException('A valid jobId is required.');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: parsedJobId },
    });
    if (!job) {
      throw new NotFoundException(`Job with id ${parsedJobId} not found.`);
    }

    const hasText = resumeText && resumeText.trim().length > 0;
    const hasPdf = resumePdfBuffer && resumePdfBuffer.length > 0;

    if (!hasText && !hasPdf) {
      throw new BadRequestException(
        'Please upload a PDF or paste your resume text.',
      );
    }

    const application = await this.prisma.application.create({
      data: {
        jobId: parsedJobId,
        resumeText: hasText ? resumeText!.trim() : null,
        resumePdf: hasPdf ? resumePdfBuffer : null,
      },
      select: { id: true, jobId: true, createdAt: true },
    });

    const resolvedResumeText = hasText ? resumeText!.trim() : null;
    this.triggerAnalysis(job, resolvedResumeText, hasPdf ? resumePdfBuffer! : null);

    return application;
  }

  private triggerAnalysis(
    job: { title: string; description: string },
    resumeText: string | null,
    resumePdfBuffer: Buffer | null,
  ): void {
    const run = async () => {
      let text = resumeText;
      if (!text && resumePdfBuffer) {
        text = await this.recruitment.extractPdfText(resumePdfBuffer);
      }
      if (!text) return;
      await this.recruitment.analyzeApplication({
        resumeText: text,
        jobTitle: job.title,
        jobDescription: job.description,
      });
    };
    run().catch((err) =>
      console.error('[ApplicationsService] Background analysis failed:', err),
    );
  }
}
