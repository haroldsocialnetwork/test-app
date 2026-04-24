import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { RecruitmentService } from '../recruitment/recruitment.service';

@Controller('api/applications')
export class ApplicationsController {
  private readonly logger = new Logger(ApplicationsController.name);

  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly recruitmentService: RecruitmentService,
  ) {}

  @Get('pending')
  async getPending() {
    try {
      const data = await this.applicationsService.getPendingApplications();
      return { success: true, data, error: null };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        { success: false, data: null, error: 'Failed to fetch pending applications.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        dto.applicantEmail,
      );

      // Fire-and-forget: run AI analysis after resume is received
      this.recruitmentService
        .analyze(
          {
            jobDescription: result.jobDescription,
            resumeText: result.resumeText ?? undefined,
            applicantEmail: result.applicantEmail ?? undefined,
            applicationId: result.id,
          },
          file,
        )
        .catch((err) =>
          this.logger.error(`Auto-analysis failed for application ${result.id}:`, err),
        );

      return { success: true, data: { id: result.id, jobId: result.jobId, createdAt: result.createdAt }, error: null };
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
