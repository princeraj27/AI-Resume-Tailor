'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechRecognitionService } from '@/lib/voice/speech-recognition';
import { SpeechSynthesisService } from '@/lib/voice/speech-synthesis';

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  silenceCountdown: number | null; // 5..1 seconds remaining before auto-submit
  conversation: { role: 'user' | 'ai'; text: string; timestamp: number }[];
  error: string | null;
  isSupported: boolean;
}

export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
    silenceCountdown: null,
    conversation: [],
    error: null,
    isSupported: true,
  });

  const recognitionRef = useRef<SpeechRecognitionService | null>(null);
  const synthesisRef = useRef<SpeechSynthesisService | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const onSilenceAutoSubmitRef = useRef<((transcript: string) => void) | null>(null);

  useEffect(() => {
    recognitionRef.current = new SpeechRecognitionService();
    synthesisRef.current = new SpeechSynthesisService();
    
    setState(s => ({
      ...s,
      isSupported: recognitionRef.current?.isSupported() ?? false
    }));

    return () => {
      clearSilenceTimers();
    };
  }, []);

  const updateState = (updates: Partial<VoiceState>) => {
    setState(s => ({ ...s, ...updates }));
  };

  const clearSilenceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    updateState({ silenceCountdown: null });
  };

  const resetSilenceTimer = (currentText: string) => {
    clearSilenceTimers();
    if (!currentText.trim()) return; // Don't start timer if no text spoken yet

    let secondsLeft = 5;
    updateState({ silenceCountdown: secondsLeft });

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        updateState({ silenceCountdown: secondsLeft });
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    silenceTimerRef.current = setTimeout(() => {
      clearSilenceTimers();
      const textToSubmit = latestTranscriptRef.current.trim();
      if (textToSubmit && onSilenceAutoSubmitRef.current) {
        stopListening();
        onSilenceAutoSubmitRef.current(textToSubmit);
      }
    }, 5000);
  };

  const startListening = useCallback((options?: { onSilenceAutoSubmit?: (transcript: string) => void }) => {
    if (!recognitionRef.current) return;
    
    clearSilenceTimers();
    latestTranscriptRef.current = '';
    onSilenceAutoSubmitRef.current = options?.onSilenceAutoSubmit || null;
    
    updateState({ error: null, transcript: '', interimTranscript: '', silenceCountdown: null });
    
    recognitionRef.current.start({
      continuous: true,
      interimResults: true,
      onResult: (text, isFinal) => {
        const fullText = text.trim();
        latestTranscriptRef.current = fullText;
        if (isFinal) {
          updateState({ transcript: fullText, interimTranscript: '' });
        } else {
          updateState({ interimTranscript: fullText });
        }
        // User spoke something: reset silence auto-submit timer (5s)
        resetSilenceTimer(fullText);
      },
      onEnd: () => {
        updateState({ isListening: false });
        clearSilenceTimers();
      },
      onError: (error: string) => {
        updateState({ error, isListening: false });
        clearSilenceTimers();
      }
    });
    
    updateState({ isListening: true });
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimers();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      updateState({ isListening: false });
    }
  }, []);

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!synthesisRef.current) {
      if (onEnd) onEnd();
      return;
    }

    updateState({ isSpeaking: true });
    synthesisRef.current.speak(text, {
      onStart: () => updateState({ isSpeaking: true }),
      onEnd: () => {
        updateState({ isSpeaking: false });
        if (onEnd) onEnd();
      }
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.stop();
      updateState({ isSpeaking: false });
    }
  }, []);

  const processTranscript = useCallback(async (text: string, question: string) => {
    updateState({ 
      isProcessing: true,
      conversation: [...state.conversation, { role: 'user', text, timestamp: Date.now() }] 
    });

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, question })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to process voice request');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAiResponse = '';

      async function* generateStream() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullAiResponse += chunk;
          yield chunk;
        }
      }

      if (synthesisRef.current) {
        await synthesisRef.current.speakStreaming(generateStream(), {
          onStart: () => updateState({ isSpeaking: true, isProcessing: false }),
          onEnd: () => {
            updateState({ 
              isSpeaking: false,
              conversation: [
                ...state.conversation,
                { role: 'user', text, timestamp: Date.now() },
                { role: 'ai', text: fullAiResponse, timestamp: Date.now() }
              ]
            });
          }
        });
      }
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isProcessing: false 
      });
    }
  }, [state.conversation]);

  const clearConversation = useCallback(() => {
    updateState({ conversation: [] });
  }, []);

  return {
    state,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    processTranscript,
    clearConversation
  };
}
