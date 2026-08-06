'use client';

import { motion } from 'framer-motion';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Waveform } from './waveform';
import { Badge } from '@/components/ui/badge';

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
      case 'idle': return 'Tap microphone to start speaking';
      case 'listening': 
        return silenceCountdown 
          ? `Listening... Auto-submitting in ${silenceCountdown}s of silence` 
          : 'Listening... (Speak your STAR answer)';
      case 'processing': return 'Evaluating your STAR response...';
      case 'speaking': return 'AI Interviewer is speaking feedback...';
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'idle': return 'text-muted-foreground';
      case 'listening': return 'text-cyan-500 font-semibold';
      case 'processing': return 'text-amber-500 font-semibold';
      case 'speaking': return 'text-emerald-500 font-semibold';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[360px] bg-card border border-border rounded-2xl p-6 relative overflow-hidden text-card-foreground">
      {/* Background radial glow */}
      <div className={cn(
        "absolute inset-0 opacity-15 transition-all duration-700 blur-[80px]",
        state === 'listening' ? 'bg-cyan-500' : '',
        state === 'processing' ? 'bg-amber-500' : '',
        state === 'speaking' ? 'bg-emerald-500' : 'bg-transparent'
      )} />

      <div className="z-10 flex flex-col items-center w-full max-w-xl mx-auto space-y-6">
        
        {/* Central Mic Button */}
        <div className="relative">
          {state === 'listening' && (
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-500/20"
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}
          
          <button
            onClick={onToggleListen}
            disabled={state === 'processing'}
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-2",
              state === 'idle' ? "bg-muted border-border hover:bg-accent text-foreground" : "",
              state === 'listening' ? "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]" : "",
              state === 'processing' ? "bg-amber-600/50 border-amber-500/50 text-amber-200 cursor-not-allowed" : "",
              state === 'speaking' ? "bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500" : ""
            )}
            title={state === 'listening' ? "Stop Listening & Submit" : "Start Listening"}
          >
            {state === 'listening' || state === 'speaking' ? (
              <Square className="w-7 h-7 fill-current" />
            ) : state === 'processing' ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Waveform Visualization */}
        <div className="h-12 w-full max-w-xs">
          <Waveform isActive={state === 'listening' || state === 'speaking'} color={state === 'speaking' ? 'emerald' : 'blue'} />
        </div>

        {/* Status Badge & Text */}
        <div className="text-center space-y-1">
          {state === 'listening' && silenceCountdown && (
            <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-500 border-cyan-500/20 px-3 py-1 font-bold animate-pulse mb-1">
              Auto-submitting in {silenceCountdown}s of silence
            </Badge>
          )}
          <p className={cn("text-sm sm:text-base tracking-tight", getStatusColor())}>
            {getStatusText()}
          </p>
        </div>

        {/* LIVE TRANSCRIPT DISPLAY CONTAINER */}
        <div className="w-full min-h-[90px] max-h-[140px] overflow-y-auto p-4 rounded-xl border border-border bg-muted/30 text-center flex items-center justify-center">
          {state === 'listening' ? (
            transcript ? (
              <p className="text-foreground font-medium text-sm sm:text-base leading-relaxed animate-in fade-in-50">
                &quot;{transcript}&quot;
              </p>
            ) : (
              <p className="text-muted-foreground italic text-xs sm:text-sm animate-pulse">
                🎙️ Speak your answer now... Live transcript will appear here...
              </p>
            )
          ) : state === 'speaking' ? (
            <div className="flex items-center gap-2 text-emerald-500 text-xs sm:text-sm font-semibold">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>AI Coach is reading evaluation feedback aloud...</span>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">
              Tap the microphone icon above to begin your spoken response.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
