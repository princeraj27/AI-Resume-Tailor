import { NextRequest } from 'next/server';
import { llmService } from '../lib/llm';

export async function POST(request: NextRequest) {
  const { transcript, question, context } = await request.json();
  
  // Build the prompt for voice interview coaching
  const systemPrompt = `You are an expert interview coach conducting a mock interview. 
You are evaluating the candidate's answer to the question below.
Be conversational, encouraging, but honest. Keep your response concise (2-3 sentences for feedback, then ask a follow-up or move to next question).
Do NOT use markdown formatting - speak naturally as this will be read aloud.`;

  const prompt = `Question: ${question}\nCandidate's Answer: ${transcript}\n${context ? `Context: ${context}` : ''}`;

  // Create a streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of llmService.streamText(prompt, systemPrompt)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
