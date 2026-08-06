'use client';

import { useState, useCallback } from 'react';
import { AgentState, AgentTraceEntry, AnalysisOutput, FeedbackResult, RAGContextItem } from '@/lib/agents/state';
import { agentAnalyze, agentGenerateQuestions, agentEvaluateAnswer } from '@/lib/api';

export interface UseAgentReturn {
  isLoading: boolean;
  error: string | null;
  analysisResult: AnalysisOutput | null;
  interviewQuestions: string[];
  feedback: FeedbackResult | null;
  agentTrace: AgentTraceEntry[];
  ragContext: RAGContextItem[];
  
  analyzeResume: (file: File, jobDescription?: string) => Promise<void>;
  generateQuestions: (resumeText: string, jobDescription?: string) => Promise<void>;
  evaluateAnswer: (question: string, answer: string) => Promise<void>;
  reset: () => void;
}

export function useAgent(): UseAgentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisOutput | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [agentTrace, setAgentTrace] = useState<AgentTraceEntry[]>([]);
  const [ragContext, setRagContext] = useState<RAGContextItem[]>([]);

  const analyzeResume = useCallback(async (file: File, jobDescription?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await agentAnalyze(file, jobDescription);
      if (res.analysisResult) setAnalysisResult(res.analysisResult);
      if (res.agentTrace) setAgentTrace(res.agentTrace);
      if (res.ragContext) setRagContext(res.ragContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateQuestions = useCallback(async (resumeText: string, jobDescription?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await agentGenerateQuestions(resumeText, jobDescription);
      if (res.interviewQuestions) setInterviewQuestions(res.interviewQuestions);
      if (res.agentTrace) setAgentTrace(prev => [...prev, ...res.agentTrace]);
      if (res.ragContext) setRagContext(res.ragContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const evaluateAnswer = useCallback(async (question: string, answer: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await agentEvaluateAnswer(question, answer);
      if (res.feedback) setFeedback(res.feedback);
      if (res.agentTrace) setAgentTrace(prev => [...prev, ...res.agentTrace]);
      if (res.ragContext) setRagContext(res.ragContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate answer');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setAnalysisResult(null);
    setInterviewQuestions([]);
    setFeedback(null);
    setAgentTrace([]);
    setRagContext([]);
  }, []);

  return {
    isLoading,
    error,
    analysisResult,
    interviewQuestions,
    feedback,
    agentTrace,
    ragContext,
    analyzeResume,
    generateQuestions,
    evaluateAnswer,
    reset
  };
}
