'use client';

import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Waveform } from './waveform';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceInterfaceProps {
  state: VoiceState;
  onToggleListen: () => void;
  transcript: string;
  response: string;
  silenceCountdown?: number | null;
}

export function VoiceInterface({ state, onToggleListen, transcript, response, silenceCountdown }: VoiceInterfaceProps) {
  const getStatusText = () => {
    switch (state) {
      case 'idle': return 'Tap to start speaking';
      case 'listening': 
        return silenceCountdown 
          ? `Listening... Auto-submitting in ${silenceCountdown}s of silence` 
          : 'Listening... (Speak your answer)';
      case 'processing': return 'Analyzing your response...';
      case 'speaking': return 'AI Coach is speaking...';
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'idle': return 'text-zinc-400';
      case 'listening': return 'text-blue-400';
      case 'processing': return 'text-amber-400';
      case 'speaking': return 'text-emerald-400';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-black/20 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
      {/* Background gradients */}
      <div className={cn(
        "absolute inset-0 opacity-20 transition-all duration-1000 blur-[100px]",
        state === 'listening' ? 'bg-blue-500' : '',
        state === 'processing' ? 'bg-amber-500' : '',
        state === 'speaking' ? 'bg-emerald-500' : 'bg-transparent'
      )} />

      <div className="z-10 flex flex-col items-center w-full max-w-lg mx-auto">
        
        {/* Central Mic Button */}
        <div className="relative mb-12">
          {state === 'listening' && (
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500/20"
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          
          <button
            onClick={onToggleListen}
            disabled={state === 'processing'}
            className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
              "shadow-lg border-2",
              state === 'idle' ? "bg-white/5 border-white/10 hover:bg-white/10" : "",
              state === 'listening' ? "bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]" : "",
              state === 'processing' ? "bg-amber-600/50 border-amber-500/50 cursor-not-allowed" : "",
              state === 'speaking' ? "bg-emerald-600/50 border-emerald-500/50 hover:bg-emerald-600/70" : ""
            )}
          >
            {state === 'listening' || state === 'speaking' ? (
              <Square className="w-8 h-8 text-white fill-current" />
            ) : state === 'processing' ? (
              <Loader2 className="w-8 h-8 text-amber-200 animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Waveform Visualization */}
        <div className="h-16 mb-8 w-full max-w-xs">
          <Waveform isActive={state === 'listening' || state === 'speaking'} color={state === 'speaking' ? 'emerald' : 'blue'} />
        </div>

        {/* Status Text */}
        <motion.p 
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-lg font-medium tracking-wide mb-8", getStatusColor())}
        >
          {getStatusText()}
        </motion.p>

        {/* Text Display */}
        <div className="w-full space-y-4">
          <div className="h-[80px] w-full text-center px-4">
            <motion.p 
              className="text-zinc-300 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {state === 'listening' ? transcript : state === 'speaking' ? response : ''}
            </motion.p>
          </div>
        </div>

      </div>
    </div>
  );
}
