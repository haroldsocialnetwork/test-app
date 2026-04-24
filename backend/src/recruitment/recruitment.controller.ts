import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RecruitmentService } from './recruitment.service';
import { AnalyzeCandidateDto } from './dto/analyze-candidate.dto';

@Controller('api/recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('resumeFile', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(
            new HttpException(
              'Only PDF files are accepted.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AnalyzeCandidateDto,
  ) {
    try {
      const result = await this.recruitmentService.analyze(dto, file);
      return { success: true, data: result, error: null };
    } catch (err) {
      if (err instanceof HttpException) {
        const status = err.getStatus();
        const message =
          typeof err.getResponse() === 'string'
            ? err.getResponse()
            : (err.getResponse() as { message?: string }).message ??
              'An unexpected error occurred. Please try again.';
        throw new HttpException(
          { success: false, data: null, error: message },
          status,
        );
      }
      throw new HttpException(
        {
          success: false,
          data: null,
          error: 'An unexpected error occurred. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
