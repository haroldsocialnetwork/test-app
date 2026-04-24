import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { HrModule } from './hr/hr.module';

@Module({
  imports: [HelloModule, RecruitmentModule, HrModule],
})
export class AppModule {}
