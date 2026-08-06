'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { RAGContextItem } from '@/lib/agents/state';

interface GroundingCitationProps {
  source?: string;
  category?: string;
  score?: number;
  content?: string;
  item?: RAGContextItem;
}

export function GroundingCitation({ source, category, score, content, item }: GroundingCitationProps) {
  const [expanded, setExpanded] = useState(false);

  const displaySource = source || item?.source || 'Knowledge Base';
  const displayCategory = category || item?.category || 'general';
  const displayScore = score ?? item?.score ?? 0.95;
  const displayContent = content || item?.content || '';

  return (
    <div className="inline-block mt-1">
      <Badge 
        variant="outline" 
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer hover:bg-muted text-xs gap-1.5 border-primary/30 text-primary py-0.5 px-2 select-none"
      >
        <BookOpen className="w-3 h-3 text-cyan-500" />
        <span>Grounded in: <strong className="font-semibold">{displaySource}</strong></span>
        <span className="opacity-75">({Math.round(displayScore * 100)}%)</span>
        {displayContent && (
          expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </Badge>

      {expanded && displayContent && (
        <div className="mt-2 p-3 rounded-md bg-muted/50 border text-xs text-muted-foreground space-y-1.5 animate-in fade-in-50 duration-150 max-w-xl">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Source Context
            </span>
            <Badge variant="secondary" className="text-[10px] capitalize">{displayCategory}</Badge>
          </div>
          <p className="leading-relaxed whitespace-pre-wrap">{displayContent}</p>
        </div>
      )}
    </div>
  );
}
