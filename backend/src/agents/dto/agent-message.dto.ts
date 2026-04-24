import { IsOptional, IsString, MinLength } from 'class-validator';

export class AgentMessageDto {
    @IsString()
    @MinLength(1)
    message: string;

    @IsOptional()
    @IsString()
    agent?: string;

    @IsOptional()
    @IsString()
    session_id?: string;

    @IsOptional()
    user_details?: Record<string, any>;
}
