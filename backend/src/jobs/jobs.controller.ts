import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getJobs() {
    try {
      const jobs = await this.jobsService.getJobs();
      return { success: true, data: jobs, error: null };
    } catch {
      throw new HttpException(
        { success: false, data: null, error: 'Failed to fetch jobs.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
