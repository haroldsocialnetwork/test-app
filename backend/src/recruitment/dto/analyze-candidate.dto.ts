import { IsOptional, IsString, IsIn, MinLength } from 'class-validator';

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
}
