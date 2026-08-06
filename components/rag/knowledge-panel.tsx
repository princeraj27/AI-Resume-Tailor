'use client';

import { useState } from 'react';
import { Search, Database, FileText, Brain, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SourceCard } from './source-cards';

export interface RAGContextItem {
  content: string;
  source: string;
  category: string;
  score: number;
}

const categories = ['All', 'Resume', 'Job Description', 'STAR Rules', 'Skills'];

export function KnowledgePanel() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Mock data for UI demonstration
  const mockItems: RAGContextItem[] = [
    { content: "Led a team of 5 engineers to deliver the new authentication system 2 weeks ahead of schedule.", source: "Resume: Experience", category: "Resume", score: 0.95 },
    { content: "Requires 5+ years of React/Next.js experience and strong understanding of state management.", source: "Job Description: Requirements", category: "Job Description", score: 0.88 },
    { content: "Result should quantify the business impact (e.g., increased revenue by X%, saved Y hours).", source: "STAR Methodology Guide", category: "STAR Rules", score: 0.92 }
  ];

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Database className="w-5 h-5" />
          <h3 className="font-medium">RAG Knowledge Base</h3>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input 
            placeholder="Search context..." 
            className="pl-9 bg-black/40 border-white/10 focus-visible:ring-emerald-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap",
                activeCategory === cat ? "bg-emerald-600 hover:bg-emerald-500" : "text-zinc-400 border-white/10 hover:text-white"
              )}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mockItems.map((item, i) => (
            <SourceCard key={i} item={item} />
          ))}
          
          {mockItems.length === 0 && (
            <div className="text-center p-8 text-zinc-500">
              <Database className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No knowledge chunks found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
