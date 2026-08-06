'use client';

import { useState } from 'react';
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
  GitMerge,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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

const getAgentBadgeVariant = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('resume')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  if (n.includes('interview')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
  if (n.includes('rag') || n.includes('knowledge')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (n.includes('critic') || n.includes('feedback')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (n.includes('orchestrator')) return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
  return 'bg-secondary text-secondary-foreground border-border';
};

const getAgentIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('resume')) return FileText;
  if (n.includes('interview')) return MessageSquare;
  if (n.includes('rag') || n.includes('knowledge')) return BookOpen;
  if (n.includes('critic') || n.includes('feedback')) return Scale;
  if (n.includes('orchestrator')) return GitMerge;
  return Brain;
};

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

  const isAnyRunning = traces.some(t => t.status === 'running');

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden">
      <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="w-4 h-4 text-primary" />
          <span>Agent Activity Timeline ({traces.length})</span>
        </div>
        {isAnyRunning && (
          <Badge variant="outline" className="text-xs gap-1.5 bg-cyan-500/10 text-cyan-500 border-cyan-500/20 animate-pulse">
            <CircleDashed className="w-3 h-3 animate-spin" />
            Executing Agents...
          </Badge>
        )}
      </div>

      <ScrollArea className="max-h-[360px] p-4">
        {traces.length === 0 ? (
          <div className="text-center p-6 text-xs text-muted-foreground">
            No active agent traces recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {traces.map((trace, index) => {
              const isExpanded = expandedIds.has(trace.id);
              const badgeClass = getAgentBadgeVariant(trace.agentName);
              const Icon = getAgentIcon(trace.agentName);

              return (
                <div
                  key={trace.id || index}
                  className="rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors p-3 space-y-2 text-xs"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => toggleExpand(trace.id)}
                  >
                    <div className="flex items-center gap-2">
                      {trace.status === 'running' ? (
                        <CircleDashed className="w-4 h-4 text-cyan-500 animate-spin flex-shrink-0" />
                      ) : trace.status === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                      
                      <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase gap-1", badgeClass)}>
                        <Icon className="w-3 h-3" />
                        {trace.agentName}
                      </Badge>

                      <span className="font-medium text-foreground text-xs">{trace.action}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      {trace.duration && (
                        <span className="font-mono text-[10px]">{trace.duration}ms</span>
                      )}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {isExpanded && (trace.input || trace.output) && (
                    <div className="pt-2 border-t border-border space-y-2 font-mono text-[11px]">
                      {trace.input && (
                        <div>
                          <span className="text-muted-foreground font-semibold block mb-0.5">Input:</span>
                          <div className="p-2 rounded bg-muted/60 text-foreground whitespace-pre-wrap">
                            {trace.input}
                          </div>
                        </div>
                      )}
                      {trace.output && (
                        <div>
                          <span className="text-muted-foreground font-semibold block mb-0.5">Output:</span>
                          <div className="p-2 rounded bg-muted/60 text-foreground whitespace-pre-wrap">
                            {trace.output}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
