import { BaseAgent } from './base-agent';
import { AgentState, AnalysisOutput } from './state';
import { retrieveContext, retrieveBulletRewrites } from '@/lib/rag/retriever';

export class ResumeAgent extends BaseAgent {
  name = 'Resume Analyst';
  description = 'Analyzes resumes, scores ATS compatibility, identifies skill gaps, and suggests improvements';

  async execute(state: AgentState): Promise<AgentState> {
    const trace = this.trace(state, 'Analyzing resume content');
    
    const resumeText = state.resumeText || '';
    const jobDescription = state.jobDescription || '';
    
    // 1. Get RAG context for skill matching and bullet improvements
    let bulletExamples: any[] = [];
    let skillContext: any[] = [];
    
    try {
      bulletExamples = await retrieveBulletRewrites(resumeText, 5);
      skillContext = await retrieveContext(jobDescription || resumeText, { category: 'industry_keywords', k: 10 });
    } catch (e) {
      console.warn('RAG retrieval failed in ResumeAgent, proceeding without it', e);
    }
    
    // 2. Build a comprehensive prompt
    const systemPrompt = `You are an expert AI Resume Analyst.
Your task is to analyze the provided resume against the job description (if any) and provide a comprehensive JSON output.
Return ONLY valid JSON matching the following structure:
{
  "score": number (0-100),
  "matchingSkills": ["skill1", ...],
  "missingSkills": ["skill1", ...],
  "resumeSkills": ["skill1", ...],
  "sectionScores": { "summary": number, "experience": number, "education": number },
  "scoreBreakdown": { "skillsMatch": number, "contentImpact": number, "formattingScore": number },
  "bulletAnalysis": [ { "text": "original text", "score": number, "suggestion": "improved text" } ],
  "insights": ["insight1", ...]
}

Use these RAG examples for bullet improvements if relevant:
${JSON.stringify(bulletExamples, null, 2)}

Use this skill taxonomy context if relevant:
${JSON.stringify(skillContext, null, 2)}
`;

    const userPrompt = `
Resume Text:
${resumeText}

Job Description:
${jobDescription || 'Software Engineer role with focus on web development and cloud technologies.'}
`;

    const fallback: AnalysisOutput = {
      score: 0,
      matchingSkills: [],
      missingSkills: [],
      resumeSkills: [],
      insights: ["Analysis failed to generate valid results."]
    };

    // 3. Ask the LLM to analyze and return structured JSON
    const analysis = await this.chatJSON<AnalysisOutput>(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      fallback
    );

    // 4. Store results in state.analysisResult
    state.analysisResult = analysis;
    
    // 5. Store RAG sources in state.ragContext
    if (skillContext.length > 0) {
      state.ragContext = [
        ...(state.ragContext || []),
        ...skillContext
      ];
    }
    
    // 6. Complete trace
    this.completeTrace(state, trace.id, 'Resume analysis completed');
    
    return state;
  }
}

export const resumeAgent = new ResumeAgent();
