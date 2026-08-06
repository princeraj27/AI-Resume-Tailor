'use client';

import { cn } from "@/lib/utils";

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

interface AgentStatusBadgeProps {
  name: string;
  status: AgentStatus;
  type: 'resume' | 'interview' | 'rag' | 'critic' | 'orchestrator' | 'voice';
}

export function AgentStatusBadge({ name, status, type }: AgentStatusBadgeProps) {
  const getColors = () => {
    switch (type) {
      case 'resume': return 'bg-blue-500';
      case 'interview': return 'bg-purple-500';
      case 'rag': return 'bg-emerald-500';
      case 'critic': return 'bg-amber-500';
      case 'orchestrator': return 'bg-cyan-500';
      case 'voice': return 'bg-pink-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div 
      title={`${name} (${status})`}
      className={cn(
        "w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300",
        getColors(),
        status === 'idle' ? 'opacity-30' : '',
        status === 'running' ? 'animate-pulse shadow-[0_0_8px_currentColor] ring-2 ring-current ring-offset-1 ring-offset-black' : '',
        status === 'completed' ? 'opacity-100' : '',
        status === 'error' ? 'bg-red-500 ring-2 ring-red-500 ring-offset-1 ring-offset-black' : ''
      )} 
    />
  );
}

export function AgentStatusRow() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-full bg-white/5 border border-white/5 w-fit">
      <AgentStatusBadge name="Orchestrator" type="orchestrator" status="idle" />
      <AgentStatusBadge name="Resume Parser" type="resume" status="idle" />
      <AgentStatusBadge name="RAG Engine" type="rag" status="idle" />
      <AgentStatusBadge name="Interview Coach" type="interview" status="idle" />
      <AgentStatusBadge name="Critic" type="critic" status="idle" />
    </div>
  );
}
