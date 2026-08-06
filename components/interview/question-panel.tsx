'use client';

import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface QuestionPanelProps {
  questions: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function QuestionPanel({ questions, selectedIndex, onSelect }: QuestionPanelProps) {
  if (questions.length === 0) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-black/20 border border-white/10 rounded-xl backdrop-blur-md">
        <Brain className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-lg font-medium text-white/80">No Questions Yet</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-[250px]">
          Generate interview questions to start practicing your answers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white/90">Interview Questions</h3>
        <p className="text-xs text-zinc-400 mt-1">{questions.length} questions generated</p>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {questions.map((question, i) => {
            const isSelected = selectedIndex === i;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={i}
                onClick={() => onSelect(i)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all duration-200 group relative",
                  isSelected 
                    ? "bg-blue-500/10 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
                )}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="active-question"
                    className="absolute inset-0 rounded-lg border-2 border-blue-500" 
                  />
                )}
                <div className="flex gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 z-10",
                    isSelected ? "bg-blue-500 text-white" : "bg-white/10 text-zinc-400 group-hover:bg-white/20"
                  )}>
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed z-10 relative">{question}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
