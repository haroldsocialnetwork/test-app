export interface JSONSchemaProperty {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description?: string;
    items?: JSONSchemaProperty;
    properties?: Record<string, JSONSchemaProperty>;
}

export interface AgentToolInputSchema {
    type: 'object';
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
}

export interface AgentTool {
    name: string;
    description: string;
    parameters: AgentToolInputSchema;
    _target_handle: string;
}
