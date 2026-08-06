import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '../lib/pdf';
import { orchestrator } from '@/lib/agents/orchestrator';
import { createInitialState } from '@/lib/agents/state';
import { extractSkills } from '../lib/skills';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const jobDescription = formData.get('job_description') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fullText = await extractTextFromPDF(buffer);

    // Create agent state and run through orchestrator
    const state = createInitialState(uuidv4());
    state.resumeText = fullText;
    state.jobDescription = jobDescription || undefined;
    
    const result = await orchestrator.executeTask('analyze_resume', state);
    const analysis = result.analysisResult;
    const skills = extractSkills(fullText);

    // Return backward-compatible response + new agent data
    return NextResponse.json({
      full_text: fullText,
      analysis: {
        score: analysis?.score || 0,
        matching_skills: analysis?.matchingSkills || skills,
        missing_skills: analysis?.missingSkills || [],
        resume_skills: analysis?.resumeSkills || skills,
        section_scores: analysis?.sectionScores || {},
        score_breakdown: analysis?.scoreBreakdown || {},
        bullet_analysis: analysis?.bulletAnalysis || [],
        insights: analysis?.insights || [],
      },
      // New agent-enhanced data
      agentTrace: result.agentTrace,
      ragContext: result.ragContext,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: `Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
