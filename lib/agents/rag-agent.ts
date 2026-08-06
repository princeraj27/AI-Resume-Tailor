import { BaseAgent } from './base-agent';
import { AgentState, RAGContextItem } from './state';
import { retrieveContext } from '@/lib/rag/retriever';
import { ingestResume, ingestJobDescription } from '@/lib/rag/ingest';

export class RAGAgent extends BaseAgent {
  name = 'RAG Grounding';
  description = 'Retrieves relevant context from the knowledge base to ground other agents responses';

  async execute(state: AgentState): Promise<AgentState> {
    const trace = this.trace(state, 'Retrieving grounding context');
    
    let query = '';
    let category = 'general';
    
    if (state.userAnswer && state.currentQuestion) {
      query = state.currentQuestion;
      category = 'interview_star';
    } else if (state.resumeText && !state.interviewQuestions) {
      query = state.resumeText + ' ' + (state.jobDescription || '');
      category = 'industry_keywords';
    } else {
      query = state.resumeText?.substring(0, 500) || '';
      category = 'interview_qa';
    }
    
    try {
      const results = await retrieveContext(query, { category, k: 5 });
      
      const systemPrompt = `Synthesize the following retrieved context into a coherent grounding summary for another AI agent. Keep it concise.`;
      const synthesis = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(results) }
      ]);
      
      const mappedResults: RAGContextItem[] = results.map(r => ({
        content: r.content,
        source: r.metadata?.source || r.metadata?.type || 'knowledge_base',
        category: r.metadata?.category || category || 'general',
        score: r.score ?? 1.0,
      }));

      state.ragContext = [
        ...(state.ragContext || []),
        ...mappedResults,
        {
          content: synthesis,
          source: 'rag_synthesis',
          category: 'summary',
          score: 1.0
        }
      ];
      this.completeTrace(state, trace.id, 'Retrieved and synthesized context');
    } catch (error) {
      console.warn('RAGAgent execute failed', error);
      this.completeTrace(state, trace.id, 'Failed to retrieve context');
    }
    
    return state;
  }

  async ingestUserDocuments(state: AgentState): Promise<AgentState> {
    const trace = this.trace(state, 'Ingesting user documents into knowledge base');
    
    try {
      if (state.resumeText) {
        await ingestResume(state.resumeText, state.sessionId);
      }
      if (state.jobDescription) {
        await ingestJobDescription(state.jobDescription, state.sessionId);
      }
      this.completeTrace(state, trace.id, 'Documents ingested');
    } catch (error) {
      console.warn('RAGAgent ingest failed', error);
      this.completeTrace(state, trace.id, 'Failed to ingest documents');
    }
    
    return state;
  }
}

export const ragAgent = new RAGAgent();
