import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Message classification ────────────────────────────────────────────────────

type ClassifiedMsg =
    | { kind: 'system'; text: string }
    | { kind: 'user'; text: string }
    | { kind: 'assistant_text'; text: string }
    | { kind: 'tool_use'; id: string; name: string; input: any }
    | { kind: 'tool_result'; tool_use_id: string; content: string };

function classifyMsg(msg: any): ClassifiedMsg {
    if (msg.role === 'system') {
        return { kind: 'system', text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) };
    }

    const raw = msg.content;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (parsed?.type === 'tool_use') {
                return { kind: 'tool_use', id: parsed.id, name: parsed.name, input: parsed.input };
            }
            if (parsed?.type === 'tool_result') {
                const content = typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content);
                return { kind: 'tool_result', tool_use_id: parsed.tool_use_id, content };
            }
        } catch {
            // not JSON — fall through to plain text
        }
    }

    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
    return msg.role === 'user' ? { kind: 'user', text } : { kind: 'assistant_text', text };
}

// ── Message conversion ────────────────────────────────────────────────────────

function convertMessages(rawMessages: any[]): { system: string; messages: Anthropic.MessageParam[] } {
    const classified = rawMessages.map(classifyMsg);

    const systemText = classified
        .filter(m => m.kind === 'system')
        .map(m => (m as { kind: 'system'; text: string }).text)
        .join('\n\n');

    const nonSystem = classified.filter(m => m.kind !== 'system');

    const result: Anthropic.MessageParam[] = [];
    let currentRole: 'user' | 'assistant' | null = null;
    let currentBlocks: any[] = [];

    function flush() {
        if (!currentRole || currentBlocks.length === 0) return;
        // Collapse to plain string when there is only one text block
        if (currentBlocks.length === 1 && currentBlocks[0].type === 'text') {
            result.push({ role: currentRole, content: currentBlocks[0].text });
        } else {
            result.push({ role: currentRole, content: currentBlocks });
        }
        currentRole = null;
        currentBlocks = [];
    }

    function ensureRole(role: 'user' | 'assistant') {
        if (currentRole !== role) {
            flush();
            currentRole = role;
        }
    }

    for (const msg of nonSystem) {
        if (msg.kind === 'user') {
            ensureRole('user');
            currentBlocks.push({ type: 'text', text: msg.text });
        } else if (msg.kind === 'assistant_text') {
            ensureRole('assistant');
            currentBlocks.push({ type: 'text', text: msg.text });
        } else if (msg.kind === 'tool_use') {
            ensureRole('assistant');
            currentBlocks.push({ type: 'tool_use', id: msg.id, name: msg.name, input: msg.input });
        } else if (msg.kind === 'tool_result') {
            ensureRole('user');
            currentBlocks.push({ type: 'tool_result', tool_use_id: msg.tool_use_id, content: msg.content });
        }
    }
    flush();

    // Anthropic requires the first message to be from the user
    if (result.length === 0 || result[0].role !== 'user') {
        result.unshift({ role: 'user', content: '' });
    }

    return { system: systemText, messages: result };
}

// ── Tool conversion ───────────────────────────────────────────────────────────

function convertTools(tools: any[]): Anthropic.Tool[] {
    return tools.filter(Boolean).map(t => {
        const fn = t.function || t;
        return {
            name: fn.name,
            description: fn.description || '',
            input_schema: (fn.parameters || fn.input_schema || {
                type: 'object',
                properties: {},
            }) as Anthropic.Tool['input_schema'],
        };
    });
}

// ── Response conversion ───────────────────────────────────────────────────────

function toOpenAIFormat(response: Anthropic.Message): any {
    const textParts = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text);

    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[];

    const tool_calls = toolUseBlocks.length > 0
        ? toolUseBlocks.map(b => ({
            id: b.id,
            type: 'function' as const,
            function: { name: b.name, arguments: JSON.stringify(b.input) },
        }))
        : undefined;

    return {
        choices: [{
            message: {
                role: 'assistant',
                content: textParts.join('') || null,
                tool_calls,
            },
            finish_reason: response.stop_reason,
        }],
        usage: response.usage,
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function ExecuteGPTPrompt({ prompt, gpt_options, request_id: _req, session_id: _sess, prompt_key: _key }: {
    prompt: any[];
    gpt_options?: any;
    request_id?: string;
    session_id?: string;
    prompt_key?: string;
}) {
    const { system, messages } = convertMessages(prompt);
    const tools = gpt_options?.tools?.length ? convertTools(gpt_options.tools) : undefined;
    const model = process.env.AGENT_MODEL || 'claude-sonnet-4-6';

    const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        ...(system ? { system } : {}),
        messages,
        ...(tools ? { tools } : {}),
    });

    return toOpenAIFormat(response);
}
