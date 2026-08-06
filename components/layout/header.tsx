'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/interview': return 'Interview Coach';
      case '/voice':
      case '/voice-lab': return 'Voice Lab';
      case '/knowledge':
      case '/knowledge-base': return 'Knowledge Base';
      default: return 'AI Career Intelligence';
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/20 backdrop-blur-xl relative z-10">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <div className="flex items-center">
        <h1 className="text-xl font-medium tracking-tight text-white/90">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Session Active
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-white/10 text-zinc-400"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] gap-2">
          <PlusCircle className="w-4 h-4" />
          New Session
        </Button>
      </div>
    </header>
  );
}
