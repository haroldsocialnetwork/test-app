import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BaseAIAgent } from './BaseAIAgent';
import { AgentMessageDto } from './dto/agent-message.dto';
import { GetAgentConfig } from '../utils/db_helper';

@Injectable()
export class AgentsService {
    async handleMessage(dto: AgentMessageDto): Promise<{ reply: string }> {
        const { message, agent = 'main', session_id, user_details } = dto;

        const agentConfig = await GetAgentConfig(agent);

        const agentInstance = new BaseAIAgent({
            handle: agent,
            responsibilities: agentConfig?.responsibilities ?? 'You are a helpful assistant. Answer the user\'s questions clearly and concisely.',
            gpt_model: agentConfig?.gpt_model,
            role: agentConfig?.role,
            tools: agentConfig?.tools ?? [],
            agent_tools: agentConfig?.agent_tools ?? [],
        });

        const messages = [{ role: 'user', content: message }];

        try {
            const result = await agentInstance.handleMessage(messages, {
                session_id,
                user_details,
            });

            const reply = typeof result === 'string'
                ? result
                : result != null
                    ? JSON.stringify(result)
                    : '';

            return { reply };
        } catch (err: any) {
            throw new HttpException(
                { success: false, data: null, error: err?.message ?? 'Agent error' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
