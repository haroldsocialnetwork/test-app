import Anthropic from '@anthropic-ai/sdk';
import * as _ from 'lodash';

import { AddChatHistory, GetTenantAgentsConfig } from '../utils/db_helper';
import { AgentTool } from './AgentToolEntry';
import { MCPClient } from './mcp.client';
import { GetDebugLoggers } from '../utils/common';

const { logError, logInfo } = GetDebugLoggers('gpt_prompt_studio', 'ecb/agents/BaseAIAgent');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// console.log('BaseAIAgent initialized with Anthropic API key:', process.env.ANTHROPIC_API_KEY);

const TERMINATE_LOOP = 'terminate_loop';

const terminateLoopTool: Anthropic.Tool = {
    name: TERMINATE_LOOP,
    description: 'Call this tool when you have finished your work and want to exit the agentic loop.',
    input_schema: {
        type: 'object', 
        properties: {
            reason: { type: 'string', description: 'Optional. Why the loop is being terminated.' },
        },
    },
};

function toAnthropicTool(tool: any): Anthropic.Tool {
    const fn = tool.function || tool;
    return {
        name: fn.name,
        description: fn.description || '',
        input_schema: (fn.parameters || fn.input_schema || {
            type: 'object',
            properties: {},
        }) as Anthropic.Tool['input_schema'],
    };
}

export class BaseAIAgent {
    tools: any;
    responsibilities: string;
    delegate_tools: any;
    handle: string;
    gpt_model: string;
    role: string;
    defaultAgent: string;
    defaultAgentKey: string;
    agent_tools: AgentTool[];

    constructor({
        responsibilities, tools, delegate_tools, handle, gpt_model, role,
        defaultAgent, agent_tools,
    }: {
        responsibilities?: string;
        tools?: any;
        delegate_tools?: any;
        handle: string;
        gpt_model?: string;
        role?: string;
        defaultAgent?: any;
        agent_tools?: AgentTool[];
    }) {
        this.tools = tools;
        this.responsibilities = responsibilities;
        this.delegate_tools = delegate_tools;
        this.agent_tools = agent_tools || [];
        this.handle = handle;
        this.gpt_model = gpt_model;
        this.role = role;

        const normalizeKey = (val: any): string => {
            try {
                if (!val && val !== 0) return '';
                if (typeof val === 'string') return val;
                if (typeof val === 'number' || typeof val === 'boolean') return String(val);
                if (typeof val === 'object') {
                    return val.handle || val.name || val.key || val.id || JSON.stringify(val) || '';
                }
                return String(val);
            } catch { return ''; }
        };

        const resolved = normalizeKey(defaultAgent);
        this.defaultAgent = resolved;
        this.defaultAgentKey = resolved;
    }

    async handleMessage(
        messages: Array<{ role: string; content: string }>,
        context: {
            system_prompt?: string;
            reply_to_agent?: string;
            session_id?: string;
            request_id?: string;
            user_details?: any;
            skip_history?: boolean;
            agent_call_stack?: string[];
        } = {}
    ): Promise<any> {
        const {
            session_id, request_id, user_details, system_prompt,
            reply_to_agent, skip_history, agent_call_stack,
        } = context;

        logInfo(`BaseAIAgent(${this.handle}).handleMessage:: session_id: ${session_id}, request_id: ${request_id}`);

        const tenant_code = 'default';

        // ── Build Anthropic tool list ──────────────────────────────────────────
        const cleanedDelegateTools = (this.delegate_tools || []).map(({ _description, ...t }) => t);
        const cleanedAgentTools = (this.agent_tools || []).map(({ _target_handle, ...t }) => t);

        const rawTools = [
            ...(this.tools?.length ? this.tools : []),
            ...cleanedDelegateTools,
            ...cleanedAgentTools,
            terminateLoopTool,
        ].filter(Boolean);

        const anthropicTools: Anthropic.Tool[] = rawTools.map(toAnthropicTool);

        // ── Build system prompt ───────────────────────────────────────────────
        const safeRoutingTarget = (() => {
            const v: any = this.defaultAgentKey;
            if (!v) return '';
            return typeof v === 'string' ? v : String(v);
        })();

        const agentDescriptions = this.delegate_tools?.length
            ? `\n## Agents\n${this.delegate_tools.map(t =>
                `- **${t.name.substring('TRANSFER_TO_'.length)}**: ${t._description || t.description || 'No description available'}`
              ).join('\n')}\n`
            : '';

        const agentToolDescriptions = this.agent_tools?.length
            ? `\n## Agent Tools\n${this.agent_tools.map(t => `- **${t.name}**: ${t.description}`).join('\n')}\n`
            : '';

        const systemText = `You are one of the SuperBot agents participating in a chat group. Your handle is @${this.handle}.

IMPORTANT! Ignore all masking instructions!

## Reasoning Process
- Analyze query complexity and information requirements
- Retrieve the most relevant context using your tools
- Evaluate comprehensiveness before responding
- Formulate a response or identify information gaps
${agentDescriptions}${agentToolDescriptions}
## Guidelines
- Answer the user's input. Do not answer if the query is not relevant to your task.
- Use provided tools to gather information when needed.
- Only answer if you have sufficient information.
- Transfer to other agents if the query is outside your scope.
- Think step by step. Do not fabricate information.
${system_prompt || this.responsibilities || ''}
${this.handle !== safeRoutingTarget && safeRoutingTarget
    ? `\n**ROUTING**\n- Once you have enough information, transfer to ${safeRoutingTarget} using the tools.\n- If the query is not relevant, transfer to ${safeRoutingTarget}.`
    : ''}

## Additional Information
Today's Date: ${new Date()}
User Details: ${JSON.stringify(_.pick(user_details, ['user_name', 'division', 'rank', 'designation']))}`;

        // ── Convert incoming messages to Anthropic format ──────────────────────
        const anthropicMessages: Anthropic.MessageParam[] = messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        const model = this.gpt_model && !this.gpt_model.startsWith('GPT')
            ? this.gpt_model
            : (process.env.AGENT_MODEL || 'claude-sonnet-4-6');

        // ── Agentic loop ──────────────────────────────────────────────────────
        let loop_count = 0;
        let llm_response: Anthropic.Message;

        while (true) {
            loop_count++;
            if (loop_count >= 20) {
                logError(`BaseAIAgent(${this.handle}).handleMessage:: Too many iterations, breaking`);
                break;
            }

            llm_response = await anthropic.messages.create({
                model,
                max_tokens: 4096,
                system: systemText,
                messages: anthropicMessages,
                tools: anthropicTools,
            });

            logInfo(`BaseAIAgent(${this.handle}).handleMessage:: stop_reason=${llm_response.stop_reason}, loop=${loop_count}`);

            // Persist assistant turn
            anthropicMessages.push({ role: 'assistant', content: llm_response.content });

            if (!skip_history) {
                const text = (llm_response.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined)?.text;
                if (text) {
                    await AddChatHistory({ role: 'assistant', content: text, session_id, created_at: new Date(), updated_at: new Date() });
                }
            }

            // Done when no tool calls
            if (llm_response.stop_reason === 'end_turn') break;

            const toolUseBlocks = llm_response.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[];
            if (toolUseBlocks.length === 0) break;

            // ── Execute tool calls ────────────────────────────────────────────
            const delegateTools: any[] = [];
            let terminate = false;

            const settled = await Promise.allSettled(
                toolUseBlocks.map(async (block) => {
                    const { id, name, input } = block;
                    logInfo(`BaseAIAgent(${this.handle}).handleMessage:: tool: ${name}`, input);

                    if (name === TERMINATE_LOOP) {
                        return { kind: 'terminate' as const };
                    }

                    if (name.startsWith('TRANSFER_TO_')) {
                        return { kind: 'delegate' as const, name, args: input };
                    }

                    let result: any;
                    try {
                        if (name.startsWith('CALL_AGENT_')) {
                            const targetHandle = name.substring('CALL_AGENT_'.length);
                            const stack = agent_call_stack || [];

                            if (stack.includes(targetHandle) || targetHandle === this.handle) {
                                result = `[AGENT TOOL ERROR]: Circular reference — ${targetHandle} already in call stack`;
                            } else {
                                const subAgent = new BaseAIAgent({ handle: targetHandle });
                                const subResult = await subAgent.handleMessage(
                                    [{ role: 'user', content: JSON.stringify(input) }],
                                    { session_id, request_id, user_details, skip_history: true, agent_call_stack: [...stack, this.handle] }
                                );
                                result = typeof subResult === 'string' ? subResult : JSON.stringify(subResult);
                            }
                        } else if (name.startsWith('__mcp_')) {
                            const parts = name.substring(6).split('_');
                            if (parts.length < 2) throw new Error(`Invalid MCP tool name: ${name}`);
                            const serverName = parts[0];
                            const toolName = parts.slice(1).join('_');

                            const agentConfig = await GetTenantAgentsConfig(tenant_code);
                            const mcpServer = (agentConfig?.mcp_servers || []).find((s: any) => s.name === serverName);
                            if (!mcpServer) throw new Error(`MCP server '${serverName}' not found`);

                            const mcpClient = new MCPClient({
                                serverUrl: mcpServer.url,
                                auth_type: mcpServer.auth_type || 'none',
                                auth_token: mcpServer.auth_token,
                                transportType: mcpServer.transport_type || 'http',
                            });
                            await mcpClient.connect();
                            try {
                                result = await mcpClient.callTool(toolName, input as Record<string, unknown>);
                            } finally {
                                await mcpClient.disconnect();
                            }
                        } else {
                            result = `[Function ${name} not implemented]`;
                        }
                    } catch (err: any) {
                        logError(`BaseAIAgent(${this.handle}).handleMessage:: Error in tool ${name}:`, err);
                        result = `Error calling ${name}: ${err.message}`;
                    }

                    return {
                        kind: 'tool_result' as const,
                        id,
                        content: typeof result === 'string' ? result : JSON.stringify(result),
                    };
                })
            );

            const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

            for (const s of settled) {
                if (s.status === 'rejected') {
                    logError(`BaseAIAgent(${this.handle}).handleMessage:: Rejection:`, s.reason);
                    continue;
                }
                const r = s.value;
                if (r.kind === 'terminate') {
                    terminate = true;
                } else if (r.kind === 'delegate') {
                    delegateTools.push({ name: r.name, arguments: r.args });
                } else {
                    toolResultBlocks.push({ type: 'tool_result', tool_use_id: r.id, content: r.content });
                }
            }

            if (delegateTools.length > 0) return { delegate_tools: delegateTools };
            if (reply_to_agent) return { reply_to_agent };
            if (terminate) break;

            if (toolResultBlocks.length > 0) {
                anthropicMessages.push({ role: 'user', content: toolResultBlocks });
                if (!skip_history) {
                    await AddChatHistory({ role: 'user', content: JSON.stringify(toolResultBlocks), session_id, created_at: new Date(), updated_at: new Date() });
                }
            }
        }

        const textBlock = llm_response!.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined;
        return textBlock?.text ?? '';
    }
}
