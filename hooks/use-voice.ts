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
  silenceCountdown: number | null;
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
  const hasSubmittedRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);

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

  const updateState = useCallback((updates: Partial<VoiceState>) => {
    setState(s => ({ ...s, ...updates }));
  }, []);

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setState(s => ({ ...s, silenceCountdown: null }));
  }, []);

  // Fire the auto-submit callback exactly once
  const fireAutoSubmit = useCallback((text: string) => {
    if (hasSubmittedRef.current) return; // prevent double-submit
    const cb = onSilenceAutoSubmitRef.current;
    if (!text.trim() || !cb) return;
    hasSubmittedRef.current = true;
    onSilenceAutoSubmitRef.current = null;
    cb(text);
  }, []);

  const resetSilenceTimer = useCallback((currentText: string) => {
    clearSilenceTimers();
    if (!currentText.trim()) return;

    let secondsLeft = 5;
    setState(s => ({ ...s, silenceCountdown: secondsLeft }));

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        setState(s => ({ ...s, silenceCountdown: secondsLeft }));
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    silenceTimerRef.current = setTimeout(() => {
      clearSilenceTimers();
      const textToSubmit = latestTranscriptRef.current.trim();
      if (textToSubmit) {
        // Stop recognition first, then submit
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        isListeningRef.current = false;
        setState(s => ({ ...s, isListening: false }));
        fireAutoSubmit(textToSubmit);
      }
    }, 5000);
  }, [clearSilenceTimers, fireAutoSubmit]);

  const startListening = useCallback((options?: { onSilenceAutoSubmit?: (transcript: string) => void }) => {
    if (!recognitionRef.current) return;
    
    clearSilenceTimers();
    latestTranscriptRef.current = '';
    hasSubmittedRef.current = false; // reset submit guard
    onSilenceAutoSubmitRef.current = options?.onSilenceAutoSubmit || null;
    
    setState(s => ({ ...s, error: null, transcript: '', interimTranscript: '', silenceCountdown: null, isListening: true }));
    isListeningRef.current = true;
    
    recognitionRef.current.start({
      continuous: true,
      interimResults: true,
      onResult: (text, isFinal) => {
        const fullText = text.trim();
        latestTranscriptRef.current = fullText;
        setState(s => ({ 
          ...s, 
          transcript: fullText, 
          interimTranscript: fullText 
        }));
        // Reset silence timer on every speech event
        resetSilenceTimer(fullText);
      },
      onEnd: () => {
        clearSilenceTimers();
        isListeningRef.current = false;
        setState(s => ({ ...s, isListening: false }));
        // If recognition ended naturally (browser timeout etc.) and we have text, auto-submit
        const textToSubmit = latestTranscriptRef.current.trim();
        if (textToSubmit) {
          fireAutoSubmit(textToSubmit);
        }
      },
      onError: (error: string) => {
        // 'no-speech' is not a real error, just means user hasn't spoken yet
        if (error === 'no-speech') return;
        clearSilenceTimers();
        isListeningRef.current = false;
        setState(s => ({ ...s, error, isListening: false }));
      }
    });
  }, [clearSilenceTimers, resetSilenceTimer, fireAutoSubmit]);

  const stopListening = useCallback(() => {
    clearSilenceTimers();
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState(s => ({ ...s, isListening: false }));
  }, [clearSilenceTimers]);

  // Get the latest transcript (always from ref, never stale React state)
  const getLatestTranscript = useCallback(() => {
    return latestTranscriptRef.current.trim();
  }, []);

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!synthesisRef.current) {
      if (onEnd) onEnd();
      return;
    }

    setState(s => ({ ...s, isSpeaking: true }));
    synthesisRef.current.speak(text, {
      onStart: () => setState(s => ({ ...s, isSpeaking: true })),
      onEnd: () => {
        setState(s => ({ ...s, isSpeaking: false }));
        if (onEnd) onEnd();
      }
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.stop();
      setState(s => ({ ...s, isSpeaking: false }));
    }
  }, []);

  const processTranscript = useCallback(async (text: string, question: string) => {
    setState(s => ({ 
      ...s,
      isProcessing: true,
      conversation: [...s.conversation, { role: 'user', text, timestamp: Date.now() }] 
    }));

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
          onStart: () => setState(s => ({ ...s, isSpeaking: true, isProcessing: false })),
          onEnd: () => {
            setState(s => ({ 
              ...s,
              isSpeaking: false,
              conversation: [
                ...s.conversation,
                { role: 'ai', text: fullAiResponse, timestamp: Date.now() }
              ]
            }));
          }
        });
      }
    } catch (error) {
      setState(s => ({ 
        ...s,
        error: error instanceof Error ? error.message : 'Unknown error',
        isProcessing: false 
      }));
    }
  }, []);

  const clearConversation = useCallback(() => {
    setState(s => ({ ...s, conversation: [] }));
  }, []);

  return {
    state,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    processTranscript,
    clearConversation,
    getLatestTranscript,
  };
}
