import { AgentState, createInitialState, addTrace } from './state';
import { resumeAgent } from './resume-agent';
import { interviewAgent } from './interview-agent';
import { ragAgent } from './rag-agent';
import { criticAgent } from './critic-agent';
import { BaseAgent } from './base-agent';

export type AgentTask = 
  | 'analyze_resume'
  | 'generate_questions'
  | 'evaluate_answer'
  | 'voice_interview'
  | 'query_knowledge';

export class OrchestratorAgent extends BaseAgent {
  name = 'Orchestrator';
  description = 'Routes requests to specialized agents and coordinates multi-agent workflows';

  async execute(state: AgentState): Promise<AgentState> {
    const lastMessage = state.messages[state.messages.length - 1];
    const task = await this.determineTask(lastMessage?.content || '');
    return this.executeTask(task, state);
  }

  async executeTask(task: AgentTask, state: AgentState): Promise<AgentState> {
    const trace = this.trace(state, `Routing to task: ${task}`);
    
    try {
      switch (task) {
        case 'analyze_resume':
          state = await ragAgent.ingestUserDocuments(state);
          state = await ragAgent.execute(state);
          state = await resumeAgent.execute(state);
          state = await criticAgent.reviewAnalysis(state);
          break;
          
        case 'generate_questions':
          state = await ragAgent.execute(state);
          state = await interviewAgent.generateQuestions(state);
          break;
          
        case 'evaluate_answer':
          state = await ragAgent.execute(state);
          state = await interviewAgent.evaluateAnswer(state);
          state = await criticAgent.reviewFeedback(state);
          break;
          
        case 'voice_interview':
          state = await interviewAgent.evaluateAnswer(state);
          break;
          
        case 'query_knowledge':
          state = await ragAgent.execute(state);
          break;
      }
      this.completeTrace(state, trace.id, `Task ${task} completed successfully`);
    } catch (error) {
      this.completeTrace(state, trace.id, `Task ${task} failed with error: ${String(error)}`);
    }
    
    return state;
  }

  private async determineTask(message: string): Promise<AgentTask> {
    // Simple keyword-based routing (fast, no LLM call needed)
    const lower = message.toLowerCase();
    if (lower.includes('resume') || lower.includes('analyze') || lower.includes('score')) return 'analyze_resume';
    if (lower.includes('question') || lower.includes('interview') || lower.includes('prepare')) return 'generate_questions';
    if (lower.includes('answer') || lower.includes('evaluate') || lower.includes('feedback')) return 'evaluate_answer';
    if (lower.includes('search') || lower.includes('find') || lower.includes('knowledge')) return 'query_knowledge';
    return 'analyze_resume'; // default
  }
}

export const orchestrator = new OrchestratorAgent();
