import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return application;
  }
}
