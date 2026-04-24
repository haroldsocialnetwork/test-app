export const TERMINATE_LOOP = 'terminate_loop';

export const GPT_TOOLS: Record<string, any> = {
    terminate_loop: {
        name: 'terminate_loop',
        description: 'Call this tool when you have finished your work and want to exit the agentic loop.',
        parameters: {
            type: 'object',
            properties: {
                reason: {
                    type: 'string',
                    description: 'Optional. A brief explanation of why the loop is being terminated.',
                },
            },
        },
    },
};

export function ToGPTToolsParam(...args: any[]) {
    return args.filter(Boolean).map((arg) => ({
        type: 'function',
        function: arg,
    }));
}
