import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { HrService } from './hr.service';

@Controller('api/hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('dashboard')
  getDashboard() {
    return this.hrService.getDashboard();
  }

  @Get('candidates')
  getCandidates(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.hrService.getCandidates(page, limit);
  }

  @Get('grouped')
  getGroupedData() {
    return this.hrService.getGroupedData();
  }

  @Post('chat')
  chat(
    @Body()
    body: {
      candidateId: number;
      message: string;
      conversationHistory: Array<{ role: string; content: string }>;
    },
  ) {
    return this.hrService.chat(
      body.candidateId,
      body.message,
      body.conversationHistory ?? [],
    );
  }
}
