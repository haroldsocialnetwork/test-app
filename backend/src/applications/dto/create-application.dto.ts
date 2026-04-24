import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateApplicationDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  jobId: number;

  @IsOptional()
  @IsString()
  resumeText?: string;

  @IsOptional()
  @IsEmail()
  applicantEmail?: string;
}
