import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { vectorStoreManager } from './vector-store';

export async function ingestText(text: string, metadata: Record<string, any>): Promise<number> {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
  const docs = await splitter.createDocuments([text], [metadata]);
  await vectorStoreManager.addDocuments(docs);
  return docs.length;
}

export async function ingestResume(resumeText: string, sessionId: string): Promise<number> {
  return ingestText(resumeText, { type: 'resume', sessionId });
}

export async function ingestJobDescription(jdText: string, sessionId: string): Promise<number> {
  return ingestText(jdText, { type: 'job_description', sessionId });
}
