import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
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
  async createApplication(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateApplicationDto,
  ) {
    try {
      const result = await this.applicationsService.createApplication(
        dto.jobId,
        dto.resumeText,
        file?.buffer,
      );
      return { success: true, data: result, error: null };
    } catch (err) {
      if (err instanceof HttpException) {
        const status = err.getStatus();
        const message =
          typeof err.getResponse() === 'string'
            ? (err.getResponse() as string)
            : ((err.getResponse() as { message?: string }).message ??
              'An unexpected error occurred. Please try again.');
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
