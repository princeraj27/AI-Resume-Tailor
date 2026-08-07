import { BaseAgent } from './base-agent';
import { AgentState, FeedbackResult } from './state';
import { retrieveInterviewQuestions, retrieveStarExamples } from '@/lib/rag/retriever';

export function getGradeFromScore(score: number): string {
  if (score >= 90) return "Strong Hire (A+)";
  if (score >= 80) return "Hire (A)";
  if (score >= 70) return "Leaning Hire (B)";
  if (score >= 60) return "Needs Work (C)";
  return "No Hire (D)";
}

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
Generate 5 tailored interview questions based on the candidate's resume and job description.
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
      { questions: ["Tell me about a technical project where you took ownership."] }
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
    
    const systemPrompt = `You are an expert Interview Coach evaluating a candidate's answer using the rigorous 100-Point STAR Grading Matrix:

SCORING METHODOLOGY (CRITICAL - MUST BE CONSISTENT):
Evaluate each of the 4 STAR components on an exact 0-25 point scale:
1. situation (0-25 pts): Context clarity, complexity, and background setup.
2. task (0-25 pts): Specific challenge definition, goal setting, and personal responsibility.
3. action (0-25 pts): Technical depth, specific personal initiatives, tools used, and problem-solving steps.
4. result (0-25 pts): Quantified metrics, business impact, and key takeaways.

Total Score (0-100) = situation + task + action + result.

GRADE MAPPING:
- 90-100: "Strong Hire (A+)"
- 80-89: "Hire (A)"
- 70-79: "Leaning Hire (B)"
- 60-69: "Needs Work (C)"
- <60: "No Hire (D)"

AUDIO SUGGESTION INSTRUCTION:
If the candidate's response is not perfect (score < 95), provide a clear, concise 2-sentence model response in "improvedAnswer" demonstrating how to reframe their answer with STAR metrics.

Return ONLY valid JSON matching this structure:
{
  "starBreakdown": { "situation": 22, "task": 20, "action": 22, "result": 21 },
  "score": 85,
  "grade": "Hire (A)",
  "feedback": ["Great technical depth in action phase", "Add more quantifiable metrics to result phase"],
  "improvedAnswer": "In my previous role as tech lead, I spearheaded our backend database refactoring which reduced p99 query latency by 45% and saved 120 server compute hours monthly.",
  "strengths": ["Clear communication", "Technical depth"],
  "weaknesses": ["Needs more quantifiable metrics"]
}

RAG Exemplary STAR Answers for Reference:
${JSON.stringify(starExamples, null, 2)}
`;

    // Normalize answer: capitalize sentences, add punctuation, clean STT artifacts
    // This ensures voice transcripts are evaluated identically to typed text
    const rawAnswer = (state.userAnswer || '').trim();
    const normalizedAnswer = rawAnswer
      // Capitalize first letter of each sentence
      .replace(/(^|\.\s+|!\s+|\?\s+)([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase())
      // Capitalize the very first character
      .replace(/^[a-z]/, ch => ch.toUpperCase())
      // Collapse multiple spaces into one
      .replace(/\s{2,}/g, ' ')
      // Add trailing period if missing
      .replace(/([^.!?])$/, '$1.');

    const userPrompt = `
Question: ${state.currentQuestion}
Candidate Answer: ${normalizedAnswer}
`;

    const fallback: FeedbackResult = {
      score: 75,
      grade: "Leaning Hire (B)",
      starBreakdown: { situation: 20, task: 18, action: 20, result: 17 },
      feedback: ["Answer addressed the prompt well. Quantify results for a higher score."],
      improvedAnswer: "",
      strengths: ["Clear communication"],
      weaknesses: ["Needs more specific metrics"]
    };

    const feedback = await this.chatJSON<FeedbackResult>(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      fallback
    );

    // Guaranteed Mathematical Consistency Enforcement
    const sit = Math.max(0, Math.min(25, Number(feedback?.starBreakdown?.situation ?? 20)));
    const task = Math.max(0, Math.min(25, Number(feedback?.starBreakdown?.task ?? 18)));
    const act = Math.max(0, Math.min(25, Number(feedback?.starBreakdown?.action ?? 20)));
    const res = Math.max(0, Math.min(25, Number(feedback?.starBreakdown?.result ?? 17)));

    const exactScore = sit + task + act + res;
    const exactGrade = getGradeFromScore(exactScore);

    feedback.starBreakdown = { situation: sit, task, action: act, result: res };
    feedback.score = exactScore;
    feedback.grade = exactGrade;
    
    state.feedback = feedback;
    this.completeTrace(state, trace.id, `Evaluated answer. Score: ${exactScore}/100 Grade: ${exactGrade}`);
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
