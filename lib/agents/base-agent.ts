import OpenAI from 'openai';
import { AgentState, AgentTraceEntry, addTrace } from './state';

export abstract class BaseAgent {
  abstract name: string;
  abstract description: string;
  protected client: OpenAI;
  protected model: string;

  constructor(model?: string) {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY || '',
    });
    this.model = model || 'llama-3.3-70b-versatile';
  }

  abstract execute(state: AgentState): Promise<AgentState>;

  protected async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[], options?: { json?: boolean; tools?: any[] }): Promise<string> {
    const params: any = {
      model: this.model,
      messages,
      temperature: 0.1,
    };

    if (options?.json) {
      params.response_format = { type: 'json_object' };
    }
    if (options?.tools) {
      params.tools = options.tools;
    }

    const completion = await this.client.chat.completions.create(params);
    return completion.choices[0]?.message?.content || '';
  }

  protected async chatJSON<T>(messages: { role: 'system' | 'user' | 'assistant'; content: string }[], fallback: T): Promise<T> {
    try {
      const response = await this.chat(messages, { json: true });
      return JSON.parse(response) as T;
    } catch (error) {
      console.error(`[${this.name}] Error parsing JSON response:`, error);
      return fallback;
    }
  }

  protected trace(state: AgentState, action: string, input?: string): AgentTraceEntry {
    return addTrace(state, { agentName: this.name, action, input, status: 'running' });
  }

  protected completeTrace(state: AgentState, traceId: string, output?: string): void {
    const entry = state.agentTrace.find(t => t.id === traceId);
    if (entry) {
      entry.status = 'completed';
      entry.output = output;
      entry.duration = Date.now() - entry.timestamp;
    }
  }

  isAvailable(): boolean {
    return !!process.env.GROQ_API_KEY;
  }
}
