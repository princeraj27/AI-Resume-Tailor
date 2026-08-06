import { NextRequest, NextResponse } from 'next/server';
import { orchestrator, AgentTask } from '@/lib/agents/orchestrator';
import { createInitialState } from '@/lib/agents/state';
import { extractTextFromPDF } from '../lib/pdf';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let task: AgentTask;
    let state = createInitialState(uuidv4());
    
    if (contentType.includes('multipart/form-data')) {
      // Handle resume upload (analyze_resume task)
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const jobDescription = formData.get('job_description') as string | null;
      
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        state.resumeText = await extractTextFromPDF(buffer);
      }
      state.jobDescription = jobDescription || undefined;
      task = 'analyze_resume';
    } else {
      // Handle JSON requests
      const body = await request.json();
      task = body.task as AgentTask;
      state.resumeText = body.resumeText;
      state.jobDescription = body.jobDescription;
      state.currentQuestion = body.question;
      state.userAnswer = body.answer;
      state.messages = body.messages || [];
    }
    
    // Execute the agent pipeline
    const result = await orchestrator.executeTask(task, state);
    
    // Return the full state including agent trace
    return NextResponse.json({
      analysisResult: result.analysisResult,
      interviewQuestions: result.interviewQuestions,
      feedback: result.feedback,
      agentTrace: result.agentTrace,
      ragContext: result.ragContext,
      mcpToolCalls: result.mcpToolCalls,
    });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent execution failed' },
      { status: 500 }
    );
  }
}
