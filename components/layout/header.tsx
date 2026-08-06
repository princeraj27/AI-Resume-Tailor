'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAppContext } from '@/components/layout/providers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { hasActiveSession, resetSession } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/practice': return 'Practice Hub';
      default: return 'AI Career Intelligence';
    }
  };

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card text-card-foreground relative z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {hasActiveSession && (
          <Badge variant="outline" className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Session Active
          </Badge>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </Button>

        <Button 
          variant="outline"
          size="sm"
          onClick={resetSession}
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Session
        </Button>
      </div>
    </header>
  );
}
