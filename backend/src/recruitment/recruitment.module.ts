import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { PrismaService } from '../prisma.service';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [AgentsModule],
  controllers: [RecruitmentController],
  providers: [RecruitmentService, PrismaService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
