import OpenAI from 'openai';

class LLMService {
  private client: OpenAI | null = null;
  private model = 'llama-3.3-70b-versatile';
  private fastModel = 'llama-3.1-8b-instant';

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: GROQ_API_KEY not found. LLM features will be disabled.');
    } else {
      this.client = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey,
      });
    }
  }

  isAvailable(): boolean { 
    return this.client !== null; 
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.client) throw new Error('LLM not available');
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]
    });
    return completion.choices[0]?.message?.content || '';
  }

  async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    if (!this.client) throw new Error('LLM not available');
    const completion = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant. Output JSON.' },
        { role: 'user', content: prompt }
      ]
    });
    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as T;
  }
  
  async *streamText(prompt: string, systemPrompt?: string, modelOverride?: string): AsyncGenerator<string> {
    if (!this.client) { 
      yield 'LLM unavailable'; 
      return; 
    }
    const stream = await this.client.chat.completions.create({
      model: modelOverride || this.model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful AI career coach.' },
        { role: 'user', content: prompt },
      ],
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }

  async generateFast(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.client) throw new Error('LLM not available');
    const completion = await this.client.chat.completions.create({
      model: this.fastModel,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]
    });
    return completion.choices[0]?.message?.content || '';
  }
}

export const llmService = new LLMService();
