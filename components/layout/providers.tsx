'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toaster } from 'sonner';

interface SessionState {
  sessionId: string;
  resumeText: string;
  jobDescription: string;
}

interface AppContextType {
  session: SessionState;
  updateSession: (updates: Partial<SessionState>) => void;
  resetSession: () => void;
}

const defaultSession: SessionState = {
  sessionId: '',
  resumeText: '',
  jobDescription: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProviders({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(defaultSession);

  const updateSession = (updates: Partial<SessionState>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  };

  const resetSession = () => {
    setSession(defaultSession);
  };

  return (
    <AppContext.Provider value={{ session, updateSession, resetSession }}>
      {children}
      <Toaster theme="dark" position="top-right" />
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProviders');
  }
  return context;
}
