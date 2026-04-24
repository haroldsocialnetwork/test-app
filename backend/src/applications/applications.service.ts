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
    applicantEmail?: string,
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
        applicantEmail: applicantEmail?.trim() || null,
        analyzed: false,
      },
      include: { job: { select: { title: true, description: true } } },
    });

    return {
      id: application.id,
      jobId: application.jobId,
      jobTitle: application.job.title,
      jobDescription: application.job.description,
      applicantEmail: application.applicantEmail,
      resumeText: hasText ? resumeText!.trim() : null,
      resumePdf: hasPdf ? resumePdfBuffer : null,
      createdAt: application.createdAt,
    };
  }

  async getPendingApplications() {
    const apps = await this.prisma.application.findMany({
      where: { analyzed: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobId: true,
        applicantEmail: true,
        resumeText: true,
        resumePdf: true,
        createdAt: true,
        analyzed: true,
        job: { select: { title: true, description: true } },
      },
    });

    return apps.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.job.title,
      jobDescription: a.job.description,
      applicantEmail: a.applicantEmail,
      hasResumePdf: a.resumePdf !== null && (a.resumePdf as Buffer).length > 0,
      hasResumeText: !!a.resumeText,
      resumeText: a.resumeText,
      createdAt: a.createdAt,
    }));
  }

  async markAnalyzed(applicationId: number) {
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { analyzed: true },
    });
  }

  async getApplicationById(id: number) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: { job: { select: { title: true, description: true } } },
    });
    if (!app) throw new NotFoundException(`Application ${id} not found.`);
    return app;
  }
}
