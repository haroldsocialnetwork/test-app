import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { HrModule } from './hr/hr.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [HelloModule, RecruitmentModule, HrModule, JobsModule, ApplicationsModule],
})
export class AppModule {}
