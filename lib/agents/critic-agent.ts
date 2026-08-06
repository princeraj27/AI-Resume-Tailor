import { BaseAgent } from './base-agent';
import { AgentState } from './state';

export class CriticAgent extends BaseAgent {
  name = 'Quality Reviewer';
  description = 'Reviews and improves other agents output for quality, consistency, and completeness';

  constructor() {
    super('llama-3.1-8b-instant'); // Use faster model for speed
  }

  async execute(state: AgentState): Promise<AgentState> {
    // General review loop if needed
    return state;
  }

  async reviewAnalysis(state: AgentState): Promise<AgentState> {
    if (!state.analysisResult) return state;
    const trace = this.trace(state, 'Reviewing output quality (Analysis)');
    
    const prompt = `Review this resume analysis JSON for consistency, completeness, and actionability.
Return ONLY valid JSON with improvements or a quality seal:
{
  "qualitySeal": boolean,
  "improvementNotes": ["note1", ...],
  "correctedScore": number, // optional
  "additionalInsights": ["insight1", ...]
}

Analysis:
${JSON.stringify(state.analysisResult)}
`;

    const review = await this.chatJSON<any>([
      { role: 'system', content: 'You are a critical quality reviewer for AI outputs.' },
      { role: 'user', content: prompt }
    ], { qualitySeal: true, improvementNotes: [], additionalInsights: [] });
    
    if (!review.qualitySeal) {
      state.analysisResult.insights.push(...(review.improvementNotes || []));
      state.analysisResult.insights.push(...(review.additionalInsights || []));
      if (review.correctedScore) state.analysisResult.score = review.correctedScore;
    }
    
    this.completeTrace(state, trace.id, `Analysis reviewed. Quality seal: ${review.qualitySeal}`);
    return state;
  }

  async reviewFeedback(state: AgentState): Promise<AgentState> {
    if (!state.feedback) return state;
    const trace = this.trace(state, 'Reviewing output quality (Feedback)');
    
    const prompt = `Review this interview feedback JSON for consistency, completeness, and actionability.
Return ONLY valid JSON:
{
  "qualitySeal": boolean,
  "improvementNotes": ["note1", ...],
  "refinedImprovedAnswer": "better text" // optional
}

Feedback:
${JSON.stringify(state.feedback)}
`;

    const review = await this.chatJSON<any>([
      { role: 'system', content: 'You are a critical quality reviewer for AI outputs.' },
      { role: 'user', content: prompt }
    ], { qualitySeal: true, improvementNotes: [] });
    
    if (!review.qualitySeal) {
      state.feedback.feedback.push(...(review.improvementNotes || []));
      if (review.refinedImprovedAnswer) {
        state.feedback.improvedAnswer = review.refinedImprovedAnswer;
      }
    }
    
    this.completeTrace(state, trace.id, `Feedback reviewed. Quality seal: ${review.qualitySeal}`);
    return state;
  }
}

export const criticAgent = new CriticAgent();
