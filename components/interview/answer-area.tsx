'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Eraser, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnswerAreaProps {
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
}

export function AnswerArea({ question, onSubmit, isSubmitting = false }: AnswerAreaProps) {
  const [answer, setAnswer] = useState('');

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden">
      <div className="p-6 bg-gradient-to-b from-blue-900/20 to-transparent border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-medium text-cyan-400">Current Question</h3>
        </div>
        <p className="text-lg font-medium text-white/90 leading-relaxed">
          {question || "Select a question to begin"}
        </p>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-zinc-500">Format your answer using the STAR method:</span>
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">Situation</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/20">Task</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">Action</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20">Result</span>
          </div>
        </div>

        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="flex-1 resize-none bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-cyan-500/50 p-4 text-base"
          disabled={isSubmitting || !question}
        />

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs text-zinc-500">
            {answer.length} characters
          </span>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white"
              onClick={() => setAnswer('')}
              disabled={isSubmitting || answer.length === 0}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              onClick={() => onSubmit(answer)}
              disabled={isSubmitting || answer.length < 50 || !question}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Send className="w-4 h-4" />
                </motion.div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Analyzing...' : 'Get Feedback'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
