import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { embeddingsInstance } from './embeddings';
import { Document } from '@langchain/core/documents';

// Note: In a real app, these would be read from the file system.
// For browser/edge compatibility in Next.js, we might need to import them directly
// or fetch them during initialization.
import interviewQuestions from './knowledge-base/interview-questions.json';
import bulletRewrites from './knowledge-base/bullet-rewrites.json';
import starExamples from './knowledge-base/star-examples.json';

class VectorStoreManager {
  private store: MemoryVectorStore | null = null;
  private initialized = false;

  async getStore(): Promise<MemoryVectorStore> {
    if (!this.store) {
      this.store = new MemoryVectorStore(embeddingsInstance);
    }
    if (!this.initialized) {
      await this.loadKnowledgeBase();
      this.initialized = true;
    }
    return this.store;
  }

  private async loadKnowledgeBase() {
    if (!this.store) return;
    
    const docs: Document[] = [];
    
    // Load Interview Questions
    for (const q of interviewQuestions) {
      docs.push(new Document({
        pageContent: `${q.question} ${q.followUp} ${q.evaluationCriteria.join(' ')}`,
        metadata: { type: 'interview_question', category: q.category, id: q.id }
      }));
    }
    
    // Load Bullet Rewrites
    for (const b of bulletRewrites) {
      docs.push(new Document({
        pageContent: `${b.weak} ${b.strong} ${b.principle} ${b.tags.join(' ')}`,
        metadata: { type: 'bullet_rewrite', category: b.category, id: b.id }
      }));
    }
    
    // Load STAR Examples
    for (const s of starExamples) {
      const content = `${s.question} ${s.answer.situation} ${s.answer.task} ${s.answer.action} ${s.answer.result}`;
      docs.push(new Document({
        pageContent: content,
        metadata: { type: 'star_example', category: s.category, id: s.id }
      }));
    }
    
    await this.store.addDocuments(docs);
  }

  async addDocuments(docs: Document[]) {
    const store = await this.getStore();
    await store.addDocuments(docs);
  }

  async search(query: string, k: number = 4, filter?: Record<string, any>): Promise<Document[]> {
    const store = await this.getStore();
    
    // In LangChain MemoryVectorStore, we can pass a filter function
    let filterFunc;
    if (filter) {
      filterFunc = (doc: Document) => {
        for (const key in filter) {
          if (doc.metadata[key] !== filter[key]) return false;
        }
        return true;
      };
    }
    
    return await store.similaritySearch(query, k, filterFunc);
  }
}

export const vectorStoreManager = new VectorStoreManager();
