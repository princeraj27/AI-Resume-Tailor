import { AgentState, createInitialState, addTrace } from './state';
import { resumeAgent } from './resume-agent';
import { interviewAgent } from './interview-agent';
import { ragAgent } from './rag-agent';
import { criticAgent } from './critic-agent';
import { BaseAgent } from './base-agent';
import { mcpClient } from '@/lib/mcp/client';

export type AgentTask = 
  | 'analyze_resume'
  | 'generate_questions'
  | 'evaluate_answer'
  | 'voice_interview'
  | 'query_knowledge';

// Helper function to run promise with timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`Operation timed out after ${timeoutMs}ms, returning fallback.`);
      resolve(fallback);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export class OrchestratorAgent extends BaseAgent {
  name = 'Orchestrator';
  description = 'Routes requests to specialized agents and coordinates multi-agent workflows';

  async execute(state: AgentState): Promise<AgentState> {
    const lastMessage = state.messages[state.messages.length - 1];
    const task = await this.determineTask(lastMessage?.content || '');
    return this.executeTask(task, state);
  }

  async executeTask(task: AgentTask, state: AgentState): Promise<AgentState> {
    const trace = this.trace(state, `Task Started: ${task}`);
    const startTime = Date.now();
    const PIPELINE_BUDGET_MS = 12000;

    try {
      switch (task) {
        case 'analyze_resume': {
          // Stage 1: Document Ingestion
          const stage1Trace = addTrace(state, {
            agentName: 'Orchestrator',
            action: 'Stage 1: Parsing resume & extracting skills',
            status: 'running'
          });

          state = await withTimeout(ragAgent.ingestUserDocuments(state), 8000, state);
          stage1Trace.status = 'completed';
          stage1Trace.duration = Date.now() - stage1Trace.timestamp;

          // Stage 2: Parallel RAG Context Retrieval + MCP Tool Calls
          const stage2Trace = addTrace(state, {
            agentName: 'Orchestrator',
            action: 'Stage 2: Parallel RAG context retrieval & MCP tool queries',
            status: 'running'
          });

          const [ragResult, mcpSearch] = await Promise.all([
            withTimeout(ragAgent.execute(state), 8000, state),
            withTimeout(mcpClient.executeTool('web_search', { query: 'Software Engineer career standards 2025' }), 5000, null)
          ]);

          state = ragResult;
          stage2Trace.status = 'completed';
          stage2Trace.duration = Date.now() - stage2Trace.timestamp;

          // Stage 3: Resume Analysis
          const stage3Trace = addTrace(state, {
            agentName: 'Orchestrator',
            action: 'Stage 3: Resume ATS scoring & skill gap identification',
            status: 'running'
          });

          state = await withTimeout(resumeAgent.execute(state), 8000, state);
          stage3Trace.status = 'completed';
          stage3Trace.duration = Date.now() - stage3Trace.timestamp;

          // Stage 4: Quality Review (only if time remains in 12s budget)
          if (Date.now() - startTime < PIPELINE_BUDGET_MS) {
            const stage4Trace = addTrace(state, {
              agentName: 'Orchestrator',
              action: 'Stage 4: Quality review & validation',
              status: 'running'
            });
            state = await withTimeout(criticAgent.reviewAnalysis(state), 4000, state);
            stage4Trace.status = 'completed';
            stage4Trace.duration = Date.now() - stage4Trace.timestamp;
          }
          break;
        }

        case 'generate_questions': {
          addTrace(state, { agentName: 'Orchestrator', action: 'Generating RAG grounded questions', status: 'running' });
          state = await withTimeout(ragAgent.execute(state), 6000, state);
          state = await withTimeout(interviewAgent.generateQuestions(state), 8000, state);
          break;
        }

        case 'evaluate_answer':
        case 'voice_interview': {
          addTrace(state, { agentName: 'Orchestrator', action: 'Evaluating STAR answer & generating feedback', status: 'running' });
          state = await withTimeout(interviewAgent.evaluateAnswer(state), 8000, state);
          if (task === 'evaluate_answer' && Date.now() - startTime < PIPELINE_BUDGET_MS) {
            state = await withTimeout(criticAgent.reviewFeedback(state), 4000, state);
          }
          break;
        }

        case 'query_knowledge': {
          state = await withTimeout(ragAgent.execute(state), 8000, state);
          break;
        }
      }

      this.completeTrace(state, trace.id, `Task ${task} completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error(`Orchestrator error on ${task}:`, error);
      this.completeTrace(state, trace.id, `Task ${task} completed with partial fallback`);
    }

    return state;
  }

  private async determineTask(message: string): Promise<AgentTask> {
    const lower = message.toLowerCase();
    if (lower.includes('resume') || lower.includes('analyze') || lower.includes('score')) return 'analyze_resume';
    if (lower.includes('question') || lower.includes('interview') || lower.includes('prepare')) return 'generate_questions';
    if (lower.includes('answer') || lower.includes('evaluate') || lower.includes('feedback')) return 'evaluate_answer';
    if (lower.includes('search') || lower.includes('find') || lower.includes('knowledge')) return 'query_knowledge';
    return 'analyze_resume';
  }
}

export const orchestrator = new OrchestratorAgent();
