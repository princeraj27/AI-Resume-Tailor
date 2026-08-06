'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Briefcase, BookOpen, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RAGContextItem } from '@/lib/agents/state';

interface SourceCardProps {
  item: RAGContextItem;
}

export function SourceCard({ item }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getIcon = () => {
    switch (item.category) {
      case 'Resume': return <FileText className="w-3.5 h-3.5" />;
      case 'Job Description': return <Briefcase className="w-3.5 h-3.5" />;
      case 'STAR Rules': return <BookOpen className="w-3.5 h-3.5" />;
      default: return <Brain className="w-3.5 h-3.5" />;
    }
  };

  const getScoreColor = () => {
    if (item.score >= 0.9) return 'text-emerald-400';
    if (item.score >= 0.7) return 'text-amber-400';
    return 'text-zinc-400';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-colors hover:border-emerald-500/30">
      <div 
        className="p-3 flex items-start justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex gap-3">
          <div className="mt-0.5 text-emerald-500/70 p-1.5 bg-emerald-500/10 rounded-md">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-400/80 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
                {item.category}
              </span>
              <span className="text-xs text-zinc-400">{item.source}</span>
            </div>
            {!expanded && (
              <p className="text-sm text-zinc-300 mt-1.5 line-clamp-1">{item.content}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-medium ${getScoreColor()}`}>
            {(item.score * 100).toFixed(0)}%
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 border-t border-white/5 mt-1 bg-black/20">
              <p className="text-sm text-zinc-300 leading-relaxed pt-2">
                {item.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
