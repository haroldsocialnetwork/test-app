import * as fs from 'fs';
import * as path from 'path';

// Stub implementations — wire to real persistence when needed.

export async function AddChatHistory(chat_history: any): Promise<any> {
    return chat_history;
}

let _agentsConfigCache: any = null;

export async function GetTenantAgentsConfig(_tenant_code: string): Promise<any> {
    if (_agentsConfigCache) return _agentsConfigCache;

    const configPath = path.resolve(__dirname, '../agents/agents.json');
    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        _agentsConfigCache = JSON.parse(raw);
        return _agentsConfigCache;
    } catch {
        return { agents: [], mcp_servers: [] };
    }
}

export async function GetAgentConfig(handle: string): Promise<any | null> {
    const config = await GetTenantAgentsConfig('default');
    const agents = config.agents;
    if (!agents) return null;
    // Support both array format and object-keyed format
    if (Array.isArray(agents)) {
        return agents.find((a: any) => a.handle === handle) ?? null;
    }
    // Object format: key is the handle (case-insensitive lookup)
    const key = Object.keys(agents).find(
        (k) => k.toUpperCase() === handle.toUpperCase()
    );
    return key ? agents[key] : null;
}
