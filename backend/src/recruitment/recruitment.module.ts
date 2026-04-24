import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { PrismaService } from '../prisma.service';
import { AgentsModule } from '../agents/agents.module';
import { EmailService } from './email.service';

@Module({
  imports: [AgentsModule],
  controllers: [RecruitmentController],
  providers: [RecruitmentService, PrismaService, EmailService],
})
export class RecruitmentModule {}
