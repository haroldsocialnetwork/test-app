import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async getJobs() {
    return this.prisma.job.findMany({ orderBy: { createdAt: 'asc' } });
  }
}
