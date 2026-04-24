import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { RecruitmentModule } from './recruitment/recruitment.module';

@Module({
  imports: [HelloModule, RecruitmentModule],
})
export class AppModule {}
