import { NextRequest, NextResponse } from 'next/server';
import { interviewAgent } from '@/lib/agents/interview-agent';
import { createInitialState } from '@/lib/agents/state';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, resumeText } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Both question and answer are required' },
        { status: 400 }
      );
    }

    const state = createInitialState(`session-${Date.now()}`);
    state.currentQuestion = question;
    state.userAnswer = answer;
    if (resumeText) state.resumeText = resumeText;

    const updatedState = await interviewAgent.evaluateAnswer(state);
    const fb = updatedState.feedback;

    return NextResponse.json({
      score: fb?.score ?? 75,
      grade: fb?.grade ?? "Leaning Hire (B)",
      star_breakdown: fb?.starBreakdown ?? { situation: 20, task: 18, action: 20, result: 17 },
      feedback: fb?.feedback ?? ["Good response context."],
      improved_answer: fb?.improvedAnswer ?? "",
      strengths: fb?.strengths ?? [],
      weaknesses: fb?.weaknesses ?? [],
    });
  } catch (error) {
    console.error('Interview feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
