export interface AgentState {
  sessionId: string;
  messages: AgentMessage[];
  resumeText?: string;
  jobDescription?: string;
  analysisResult?: AnalysisOutput;
  interviewQuestions?: string[];
  currentQuestion?: string;
  userAnswer?: string;
  feedback?: FeedbackResult;
  ragContext?: RAGContextItem[];
  agentTrace: AgentTraceEntry[];
  mcpToolCalls?: MCPToolCallEntry[];
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentName?: string;
  timestamp: number;
}

export interface AgentTraceEntry {
  id: string;
  agentName: string;
  action: string;
  input?: string;
  output?: string;
  timestamp: number;
  duration?: number;
  status: 'running' | 'completed' | 'error';
}

export interface RAGContextItem {
  content: string;
  source: string;
  category: string;
  score: number;
}

export interface MCPToolCallEntry {
  toolName: string;
  params: Record<string, unknown>;
  result: unknown;
  timestamp: number;
  duration: number;
}

export interface FeedbackResult {
  score: number;
  grade?: string;
  starBreakdown: { situation: number; task: number; action: number; result: number };
  feedback: string[];
  improvedAnswer: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AnalysisOutput {
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  resumeSkills: string[];
  sectionScores?: Record<string, number>;
  scoreBreakdown?: { skillsMatch: number; contentImpact: number; formattingScore: number };
  bulletAnalysis?: { text: string; score: number; suggestion: string }[];
  insights: string[];
  ragSources?: RAGContextItem[];
}

export function createInitialState(sessionId: string): AgentState {
  return {
    sessionId,
    messages: [],
    agentTrace: [],
  };
}

export function addTrace(state: AgentState, entry: Omit<AgentTraceEntry, 'id' | 'timestamp'>): AgentTraceEntry {
  const newEntry: AgentTraceEntry = {
    ...entry,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  state.agentTrace.push(newEntry);
  return newEntry;
}
