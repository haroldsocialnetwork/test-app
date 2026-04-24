import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentMessageDto } from './dto/agent-message.dto';

@Controller('api/agents')
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) {}

    @Post('message')
    async message(@Body() dto: AgentMessageDto) {
        try {
            const data = await this.agentsService.handleMessage(dto);
            return { success: true, data, error: null };
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(
                { success: false, data: null, error: 'An unexpected error occurred.' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
