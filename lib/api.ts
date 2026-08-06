import axios from 'axios';
import { AnalysisOutput, FeedbackResult, AgentTraceEntry, RAGContextItem } from '@/lib/agents/state';

const API_URL = '/api';
export const api = axios.create({ baseURL: API_URL });

// Keep existing interfaces for backward compatibility
export interface GenericAnalysis {
  score: number;
  matching_skills: string[];
  missing_skills: string[];
  resume_skills: string[];
  section_scores?: Record<string, number>;
  score_breakdown?: { skills_match: number; content_impact: number; formatting_score: number };
  bullet_analysis?: { text: string; score: number; suggestion: string }[];
  insights?: string[];
}

export interface AnalysisResponse {
  full_text: string;
  analysis: GenericAnalysis;
  agentTrace?: AgentTraceEntry[];
  ragContext?: RAGContextItem[];
}

export interface FeedbackResponse {
  score: number;
  star_breakdown: { situation: number; task: number; action: number; result: number };
  feedback: string[];
  improved_answer: string;
}

export interface AgentResponse {
  analysisResult?: AnalysisOutput;
  interviewQuestions?: string[];
  feedback?: FeedbackResult;
  agentTrace: AgentTraceEntry[];
  ragContext?: RAGContextItem[];
  mcpToolCalls?: any[];
}

// Existing endpoints (backward compatible)
export const uploadResume = async (file: File, jobDescription?: string): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (jobDescription) formData.append('job_description', jobDescription);
  const response = await api.post<AnalysisResponse>('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// New agent-based endpoints
export const agentAnalyze = async (file: File, jobDescription?: string): Promise<AgentResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (jobDescription) formData.append('job_description', jobDescription);
  const response = await api.post<AgentResponse>('/agent', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const agentGenerateQuestions = async (resumeText: string, jobDescription?: string): Promise<AgentResponse> => {
  const response = await api.post<AgentResponse>('/agent', {
    task: 'generate_questions',
    resumeText,
    jobDescription,
  });
  return response.data;
};

export const agentEvaluateAnswer = async (question: string, answer: string, resumeText?: string): Promise<AgentResponse> => {
  const response = await api.post<AgentResponse>('/agent', {
    task: 'evaluate_answer',
    question,
    answer,
    resumeText,
  });
  return response.data;
};

export const ragQuery = async (query: string, category?: string, k?: number) => {
  const response = await api.post('/rag/query', { query, category, k });
  return response.data;
};

export const ragIngest = async (text: string, metadata?: Record<string, string>) => {
  const response = await api.post('/rag/ingest', { text, metadata });
  return response.data;
};

export const generateQuestions = async (resumeText: string, jobDescription?: string) => {
  const response = await api.post<{ questions: string[] }>('/interview-questions', {
    resume_text: resumeText,
    job_description: jobDescription,
  });
  return response.data;
};

export const interviewFeedback = async (question: string, answer: string) => {
  const response = await api.post<FeedbackResponse>('/interview-feedback', {
    question, answer,
  });
  return response.data;
};
