import { vectorStoreManager } from './vector-store';
import { Document } from '@langchain/core/documents';

export interface RetrievalResult {
  content: string;
  metadata: Record<string, any>;
  score?: number;
}

export async function retrieveContext(
  query: string,
  options?: { k?: number; category?: string; type?: string; minScore?: number }
): Promise<RetrievalResult[]> {
  const k = options?.k || 4;
  const filter: Record<string, any> = {};
  
  if (options?.type) filter.type = options.type;
  if (options?.category) filter.category = options.category;
  
  // Note: MemoryVectorStore's similaritySearch doesn't return scores by default
  // We would use similaritySearchWithScore if we needed them, but we'll adapt for standard
  const docs = await vectorStoreManager.search(query, k, Object.keys(filter).length > 0 ? filter : undefined);
  
  return docs.map(doc => ({
    content: doc.pageContent,
    metadata: doc.metadata,
    score: 1.0 // Mock score since simple similaritySearch doesn't return it
  }));
}

export async function retrieveInterviewQuestions(query: string, k?: number): Promise<RetrievalResult[]> {
  return retrieveContext(query, { k, type: 'interview_question' });
}

export async function retrieveBulletRewrites(query: string, k?: number): Promise<RetrievalResult[]> {
  return retrieveContext(query, { k, type: 'bullet_rewrite' });
}

export async function retrieveStarExamples(query: string, k?: number): Promise<RetrievalResult[]> {
  return retrieveContext(query, { k, type: 'star_example' });
}
