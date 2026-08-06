import { AnalysisOutput, AgentTraceEntry, RAGContextItem } from './agents/state';

export interface PracticeItem {
  id: string;
  question: string;
  answer: string;
  feedback: any | null;
  isEvaluated: boolean;
}

export interface SessionData {
  id: string;
  createdAt: number;
  updatedAt: number;
  resumeText: string;
  jobDescription: string;
  analysisResult: AnalysisOutput | null;
  interviewQuestions: string[];
  practiceItems: PracticeItem[];
  agentTrace: AgentTraceEntry[];
  ragContext: RAGContextItem[];
}

const STORAGE_KEY = 'ai_career_session_v2';

export const createEmptySession = (): SessionData => ({
  id: `session-${Date.now()}`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  resumeText: '',
  jobDescription: '',
  analysisResult: null,
  interviewQuestions: [],
  practiceItems: [],
  agentTrace: [],
  ragContext: [],
});

export function loadSessionFromStorage(): SessionData {
  if (typeof window === 'undefined') return createEmptySession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptySession();
    return JSON.parse(raw) as SessionData;
  } catch (e) {
    console.warn('Failed to load session from storage:', e);
    return createEmptySession();
  }
}

export function saveSessionToStorage(session: SessionData): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = { ...session, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save session to storage:', e);
  }
}

export function clearSessionFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear session storage:', e);
  }
}
