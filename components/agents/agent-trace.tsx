'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  CircleDashed, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Brain,
  MessageSquare,
  BookOpen,
  Scale,
  GitMerge
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AgentTraceEntry {
  id: string;
  agentName: string;
  action: string;
  input?: string;
  output?: string;
  timestamp: number;
  duration?: number;
  status: 'running' | 'completed' | 'error';
}

interface AgentTraceProps {
  traces: AgentTraceEntry[];
}

const getAgentColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('resume')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (n.includes('interview')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  if (n.includes('rag') || n.includes('knowledge')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (n.includes('critic') || n.includes('feedback')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (n.includes('orchestrator')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  if (n.includes('voice')) return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
  return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
};

const getAgentIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('resume')) return FileTextIcon;
  if (n.includes('interview')) return MessageSquare;
  if (n.includes('rag') || n.includes('knowledge')) return BookOpen;
  if (n.includes('critic') || n.includes('feedback')) return Scale;
  if (n.includes('orchestrator')) return GitMerge;
  return Brain;
};

// Simple Fallback icon
const FileTextIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);

export function AgentTrace({ traces }: AgentTraceProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-black/20 border border-white/5 rounded-xl backdrop-blur-md overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2 text-white/90">
          <Brain className="w-4 h-4 text-cyan-400" />
          Agent Reasoning Trace
        </h3>
        {traces.some(t => t.status === 'running') && (
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Processing...
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {traces.map((trace, index) => {
              const isExpanded = expandedIds.has(trace.id);
              const colorClass = getAgentColor(trace.agentName);
              const Icon = getAgentIcon(trace.agentName);

              return (
                <motion.div
                  key={trace.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-6"
                >
                  {/* Timeline connector */}
                  {index < traces.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-[-16px] w-px bg-white/10" />
                  )}

                  <div className={cn(
                    "rounded-lg border p-3 transition-all duration-200",
                    colorClass,
                    trace.status === 'running' ? 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''
                  )}>
                    <div 
                      className="flex items-start gap-3 cursor-pointer select-none"
                      onClick={() => toggleExpand(trace.id)}
                    >
                      <div className="mt-0.5">
                        {trace.status === 'running' ? (
                          <CircleDashed className="w-4 h-4 animate-spin opacity-75" />
                        ) : trace.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 opacity-75" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 opacity-75" />
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                              {trace.agentName}
                            </span>
                          </div>
                          {trace.duration && (
                            <span className="text-[10px] opacity-60 font-mono">
                              {trace.duration}ms
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1 opacity-90">{trace.action}</p>
                      </div>

                      <div className="opacity-50">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (trace.input || trace.output) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-current/10 space-y-2 overflow-hidden text-xs font-mono"
                        >
                          {trace.input && (
                            <div>
                              <span className="opacity-50 block mb-1">Input:</span>
                              <div className="bg-black/20 p-2 rounded text-current/80 whitespace-pre-wrap">
                                {trace.input}
                              </div>
                            </div>
                          )}
                          {trace.output && (
                            <div>
                              <span className="opacity-50 block mb-1">Output:</span>
                              <div className="bg-black/20 p-2 rounded text-current/80 whitespace-pre-wrap">
                                {trace.output}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
            
            {traces.length === 0 && (
              <div className="text-center p-8 text-white/30 text-sm">
                No agent activity yet.
              </div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
