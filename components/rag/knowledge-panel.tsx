'use client';

import { useState } from 'react';
import { Search, Database, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SourceCard } from './source-cards';
import { RAGContextItem } from '@/lib/agents/state';

const categories = ['All', 'Interview Questions', 'STAR Examples', 'Bullet Rewrites', 'Skills Taxonomy'];

export function KnowledgePanel() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const mockItems: RAGContextItem[] = [
    { 
      content: "Demonstrates strong technical leadership by coordinating 5 senior engineers during a high-stress production outage.", 
      source: "STAR Knowledge Base: Leadership", 
      category: "STAR Examples", 
      score: 0.95 
    },
    { 
      content: "Quantify impact by adding measurable numbers (e.g., 'Reduced query latency by 45% using Redis caching').", 
      source: "Bullet Optimization Taxonomy", 
      category: "Bullet Rewrites", 
      score: 0.92 
    },
    { 
      content: "Tell me about a time you resolved a architectural conflict between frontend and backend engineers.", 
      source: "Interview Question Bank", 
      category: "Interview Questions", 
      score: 0.89 
    }
  ];

  const filteredItems = mockItems.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !search || item.content.toLowerCase().includes(search.toLowerCase()) || item.source.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden space-y-4 p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-500" />
          <h3 className="font-bold text-base">RAG Knowledge Explorer</h3>
        </div>
        <Badge variant="outline" className="text-xs">{filteredItems.length} Entries</Badge>
      </div>
      
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search vector knowledge base..." 
          className="pl-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <Badge 
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap text-xs"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="space-y-3 pr-2">
          {filteredItems.map((item, i) => (
            <SourceCard key={i} item={item} />
          ))}
          
          {filteredItems.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No matching knowledge entries found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
