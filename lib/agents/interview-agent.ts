import { BaseAgent } from './base-agent';
import { AgentState, FeedbackResult } from './state';
import { retrieveInterviewQuestions, retrieveStarExamples } from '@/lib/rag/retriever';

export class InterviewAgent extends BaseAgent {
  name = 'Interview Coach';
  description = 'Generates tailored interview questions and evaluates answers using STAR method';

  async generateQuestions(state: AgentState): Promise<AgentState> {
    const trace = this.trace(state, 'Generating interview questions');
    
    const context = (state.resumeText || '') + ' ' + (state.jobDescription || '');
    let ragQuestions: any[] = [];
    
    try {
      ragQuestions = await retrieveInterviewQuestions(context, 10);
    } catch (e) {
      console.warn('RAG retrieval failed in InterviewAgent (questions)', e);
    }
    
    const systemPrompt = `You are an expert Interview Coach.
Generate 7 tailored interview questions based on the candidate's resume and job description.
Use the provided RAG examples as inspiration.
Return ONLY valid JSON:
{
  "questions": ["q1", "q2", ...]
}

RAG Examples:
${JSON.stringify(ragQuestions, null, 2)}
`;

    const userPrompt = `
Resume:
${state.resumeText || 'N/A'}

Job Description:
${state.jobDescription || 'N/A'}
`;

    const result = await this.chatJSON<{ questions: string[] }>(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { questions: ["Tell me about yourself."] }
    );
    
    state.interviewQuestions = result.questions;
    this.completeTrace(state, trace.id, `Generated ${result.questions.length} questions`);
    return state;
  }

  async evaluateAnswer(state: AgentState): Promise<AgentState> {
    const trace = this.trace(state, 'Evaluating answer with STAR method');
    
    let starExamples: any[] = [];
    try {
      starExamples = await retrieveStarExamples(state.currentQuestion || '', 3);
    } catch (e) {
      console.warn('RAG retrieval failed in InterviewAgent (STAR)', e);
    }
    
    const systemPrompt = `You are an expert Interview Coach evaluating a candidate's answer using the STAR method.
Return ONLY valid JSON matching this structure:
{
  "score": number (0-100),
  "starBreakdown": { "situation": number, "task": number, "action": number, "result": number },
  "feedback": ["point 1", ...],
  "improvedAnswer": "string",
  "strengths": ["string", ...],
  "weaknesses": ["string", ...]
}

Here are some exemplary STAR examples for reference:
${JSON.stringify(starExamples, null, 2)}
`;

    const userPrompt = `
Question: ${state.currentQuestion}
Candidate Answer: ${state.userAnswer}
`;

    const fallback: FeedbackResult = {
      score: 0,
      starBreakdown: { situation: 0, task: 0, action: 0, result: 0 },
      feedback: ["Failed to evaluate answer."],
      improvedAnswer: "",
      strengths: [],
      weaknesses: []
    };

    const feedback = await this.chatJSON<FeedbackResult>(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      fallback
    );
    
    state.feedback = feedback;
    this.completeTrace(state, trace.id, `Evaluated answer. Score: ${feedback.score}`);
    return state;
  }

  async execute(state: AgentState): Promise<AgentState> {
    if (state.userAnswer && state.currentQuestion) {
      return this.evaluateAnswer(state);
    }
    return this.generateQuestions(state);
  }
}

export const interviewAgent = new InterviewAgent();
