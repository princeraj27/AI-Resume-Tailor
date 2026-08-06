'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { 
  SessionData, 
  createEmptySession, 
  loadSessionFromStorage, 
  saveSessionToStorage, 
  clearSessionFromStorage 
} from '@/lib/session';

interface AppContextType {
  session: SessionData;
  updateSession: (updates: Partial<SessionData>) => void;
  resetSession: () => void;
  hasActiveSession: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProviders({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData>(createEmptySession);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSessionFromStorage();
    setSession(loaded);
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  const updateSession = (updates: Partial<SessionData>) => {
    setSession((prev) => {
      const next = { ...prev, ...updates, updatedAt: Date.now() };
      saveSessionToStorage(next);
      return next;
    });
  };

  const resetSession = () => {
    clearSessionFromStorage();
    const fresh = createEmptySession();
    setSession(fresh);
  };

  const hasActiveSession = Boolean(session.analysisResult || session.resumeText);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppContext.Provider value={{ session, updateSession, resetSession, hasActiveSession }}>
        {children}
        <Toaster position="top-right" />
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProviders');
  }
  return context;
}
