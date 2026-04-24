export class SuperBot {
    ecbRequest: { bot_owner: string };
    chatbot_minilm: string | null;
    user_details: { user_id: string };

    constructor({ tenant_code = 'default', user_id = 'anonymous' }: { tenant_code?: string; user_id?: string } = {}) {
        this.ecbRequest = { bot_owner: tenant_code };
        this.chatbot_minilm = null;
        this.user_details = { user_id };
    }

    async LoadAgent(handle: string): Promise<any> {
        // Lazy import to avoid circular dep
        const { BaseAIAgent } = await import('./BaseAIAgent');
        return new BaseAIAgent({ handle });
    }
}
