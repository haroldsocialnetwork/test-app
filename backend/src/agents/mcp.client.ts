export interface MCPClientOptions {
    serverUrl?: string;
    auth_type?: 'none' | 'bearer' | 'api-key' | 'basic';
    auth_token?: string;
    transportType?: 'http' | 'sse';
}

export class MCPClient {
    constructor(private options: MCPClientOptions = {}) {}

    async connect(): Promise<void> {}

    async disconnect(): Promise<void> {}

    async callTool(_name: string, _args: Record<string, unknown> = {}): Promise<any> {
        throw new Error('MCPClient is not configured in this environment');
    }

    isConnected(): boolean {
        return false;
    }
}
