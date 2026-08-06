'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ThinkingIndicatorProps {
  active: boolean;
  text?: string;
  agentName?: string;
}

export function ThinkingIndicator({ active, text = "Thinking", agentName }: ThinkingIndicatorProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"
        >
          <div className="flex gap-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span className="text-sm font-medium text-white/80">
            {agentName ? (
              <>
                <span className="text-cyan-400">{agentName}</span> is {text.toLowerCase()}...
              </>
            ) : (
              `${text}...`
            )}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
