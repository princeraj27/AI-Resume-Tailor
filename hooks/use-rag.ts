'use client';

import { useState, useCallback } from 'react';
import { ragQuery, ragIngest } from '@/lib/api';

export interface RAGResult {
  content: string;
  source: string;
  category: string;
  score: number;
}

export function useRAG() {
  const [results, setResults] = useState<RAGResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, category?: string) => {
    setIsSearching(true);
    setError(null);
    try {
      const res = await ragQuery(query, category);
      setResults(res.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query RAG');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const ingestDocument = useCallback(async (text: string, metadata: Record<string, string>) => {
    setIsSearching(true);
    setError(null);
    try {
      await ragIngest(text, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest document');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    ingestDocument,
    clearResults
  };
}
