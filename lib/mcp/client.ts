export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (params: Record<string, unknown>) => Promise<MCPToolResult>;
}

export interface MCPToolResult {
  success: boolean;
  data: unknown;
  error?: string;
}

export interface MCPToolCall {
  toolName: string;
  params: Record<string, unknown>;
  result: MCPToolResult;
  timestamp: number;
  duration: number;
}

export class MCPClient {
  private tools: Map<string, MCPTool> = new Map();
  private callHistory: MCPToolCall[] = [];

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<MCPToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Tool ${name} not found`, data: null };
    }

    const start = Date.now();
    try {
      const result = await tool.execute(params);
      const duration = Date.now() - start;
      
      this.callHistory.push({
        toolName: name,
        params,
        result,
        timestamp: start,
        duration
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      const result = { success: false, error: (error as Error).message, data: null };
      
      this.callHistory.push({
        toolName: name,
        params,
        result,
        timestamp: start,
        duration
      });
      
      return result;
    }
  }

  getAvailableTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  getCallHistory(): MCPToolCall[] {
    return [...this.callHistory];
  }

  getToolDescriptions(): string {
    const tools = this.getAvailableTools();
    return tools.map(tool => {
      const params = Object.entries(tool.parameters)
        .map(([key, val]) => `  - ${key} (${val.type}): ${val.description}${val.required ? ' (required)' : ''}`)
        .join('\n');
      return `Tool: ${tool.name}\nDescription: ${tool.description}\nParameters:\n${params}`;
    }).join('\n\n');
  }
}

export const mcpClient = new MCPClient();
