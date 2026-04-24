import { IsEmail, IsInt, IsOptional, IsString, IsIn, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnalyzeCandidateDto {
  @IsOptional()
  @IsString()
  resumeText?: string;

  @IsString()
  @MinLength(10)
  jobDescription: string;

  @IsOptional()
  @IsIn(['formal', 'friendly', 'concise'])
  tone?: 'formal' | 'friendly' | 'concise';

  @IsOptional()
  @IsEmail()
  applicantEmail?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  applicationId?: number;
}
