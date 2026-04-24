import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma.service';
import { RecruitmentService } from '../recruitment/recruitment.service';
import { EmailService } from '../recruitment/email.service';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [AgentsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, PrismaService, RecruitmentService, EmailService],
})
export class ApplicationsModule {}
