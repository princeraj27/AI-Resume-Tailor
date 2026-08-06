'use client';

import { motion } from 'framer-motion';

interface WaveformProps {
  isActive: boolean;
  color?: 'blue' | 'emerald';
}

export function Waveform({ isActive, color = 'blue' }: WaveformProps) {
  const bars = 16;
  
  const getColorClass = () => {
    return color === 'emerald' ? 'bg-emerald-400' : 'bg-blue-400';
  };

  return (
    <div className="flex items-center justify-center gap-1.5 h-full w-full">
      {Array.from({ length: bars }).map((_, i) => {
        // Create a wave pattern
        const minHeight = 4;
        const maxHeight = isActive ? 24 + Math.random() * 32 : 8;
        
        return (
          <motion.div
            key={i}
            className={`w-1.5 rounded-full ${getColorClass()}`}
            animate={{
              height: isActive ? [minHeight, maxHeight, minHeight] : minHeight,
              opacity: isActive ? [0.5, 1, 0.5] : 0.2
            }}
            transition={{
              duration: isActive ? 0.5 + Math.random() * 0.5 : 0.2,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut",
              delay: isActive ? i * 0.05 : 0
            }}
            style={{ height: minHeight }}
          />
        );
      })}
    </div>
  );
}
