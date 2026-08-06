'use client';

import { useState, useCallback } from 'react';
import { AgentTraceEntry, AnalysisOutput, FeedbackResult, RAGContextItem } from '@/lib/agents/state';
import { agentAnalyze, agentGenerateQuestions, agentEvaluateAnswer } from '@/lib/api';
import { useAppContext } from '@/components/layout/providers';

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
  const { session, updateSession } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);

  const analyzeResume = useCallback(async (file: File, jobDescription?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await agentAnalyze(file, jobDescription);
      updateSession({
        resumeText: res.resumeText || session.resumeText,
        jobDescription: jobDescription || session.jobDescription,
        analysisResult: res.analysisResult || null,
        agentTrace: res.agentTrace || [],
        ragContext: res.ragContext || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
    }
  }, [session.jobDescription, updateSession]);

  const generateQuestions = useCallback(async (resumeText: string, jobDescription?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await agentGenerateQuestions(resumeText || session.resumeText, jobDescription || session.jobDescription);
      const newQuestions = res.interviewQuestions || [];
      const newItems = newQuestions.map((q: string, idx: number) => ({
        id: `q-${idx}`,
        question: q,
        answer: '',
        feedback: null,
        isEvaluated: false,
      }));

      updateSession({
        interviewQuestions: newQuestions,
        practiceItems: newItems,
        agentTrace: [...session.agentTrace, ...(res.agentTrace || [])],
        ragContext: res.ragContext || session.ragContext,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  }, [session.resumeText, session.jobDescription, session.agentTrace, session.ragContext, updateSession]);

  const evaluateAnswer = useCallback(async (question: string, answer: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await agentEvaluateAnswer(question, answer);
      if (res.feedback) {
        setFeedback(res.feedback);
      }
      updateSession({
        agentTrace: [...session.agentTrace, ...(res.agentTrace || [])],
        ragContext: res.ragContext || session.ragContext,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate answer');
    } finally {
      setIsLoading(false);
    }
  }, [session.agentTrace, session.ragContext, updateSession]);

  const reset = useCallback(() => {
    setError(null);
    setFeedback(null);
  }, []);

  return {
    isLoading,
    error,
    analysisResult: session.analysisResult,
    interviewQuestions: session.interviewQuestions,
    feedback,
    agentTrace: session.agentTrace,
    ragContext: session.ragContext,
    analyzeResume,
    generateQuestions,
    evaluateAnswer,
    reset
  };
}
