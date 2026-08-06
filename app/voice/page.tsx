"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { VoiceInterface, VoiceState } from "@/components/voice/voice-interface";
import { ConversationLog } from "@/components/voice/conversation-log";
import { useVoice } from "@/hooks/use-voice";
import { useAgent } from "@/hooks/use-agent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mic, Square, SkipForward, Play, Volume2, RotateCcw, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function VoiceInterviewContent() {
  const searchParams = useSearchParams();
  const autoStartParam = searchParams.get('autoStart');

  const { state, startListening, stopListening, speakText, stopSpeaking, processTranscript, clearConversation } = useVoice();
  const { interviewQuestions, generateQuestions } = useAgent();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAutoLoopActive, setIsAutoLoopActive] = useState(false);
  const hasSpokenQuestionRef = useRef(false);

  const fallbackQuestions = [
    "Tell me about a time you led a challenging technical project under tight deadlines.",
    "How do you approach debugging complex issues in a production system?",
    "Describe a situation where you had a conflict with a teammate and how you resolved it.",
    "What strategies do you use to ensure software quality and high performance?",
    "Where do you see your technical skills evolving over the next 3 years?"
  ];

  const questions = (interviewQuestions && interviewQuestions.length > 0) 
    ? interviewQuestions 
    : fallbackQuestions;
    
  const currentQuestion = questions[currentQuestionIndex];

  // Derive VoiceState for VoiceInterface
  const voiceState: VoiceState = state.isListening 
    ? 'listening' 
    : state.isProcessing 
    ? 'processing' 
    : state.isSpeaking 
    ? 'speaking' 
    : 'idle';

  // Handle Auto-Submit when 5 seconds of silence detected
  const handleAutoSubmitAnswer = useCallback(async (transcriptText: string) => {
    if (!transcriptText.trim()) return;
    
    // Process transcript with AI evaluation
    await processTranscript(transcriptText, currentQuestion);

    // Auto-advance to next question if auto-loop is active
    if (isAutoLoopActive && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        hasSpokenQuestionRef.current = false;
      }, 1500);
    }
  }, [currentQuestion, isAutoLoopActive, currentQuestionIndex, questions.length, processTranscript]);

  // Start listening with 5-second silence auto-submit enabled
  const handleStartListening = useCallback(() => {
    startListening({
      onSilenceAutoSubmit: (transcriptText) => {
        handleAutoSubmitAnswer(transcriptText);
      }
    });
  }, [startListening, handleAutoSubmitAnswer]);

  // Ask current question out loud using TTS, then auto-listen
  const handleAskQuestionAloud = useCallback(() => {
    if (!currentQuestion) return;
    
    stopListening();
    hasSpokenQuestionRef.current = true;

    speakText(currentQuestion, () => {
      // Once question speech ends, turn on mic automatically
      if (isAutoLoopActive) {
        setTimeout(() => {
          handleStartListening();
        }, 500);
      }
    });
  }, [currentQuestion, speakText, isAutoLoopActive, stopListening, handleStartListening]);

  // Auto-start loop when parameter present
  useEffect(() => {
    if (autoStartParam === 'true' && !isAutoLoopActive) {
      setIsAutoLoopActive(true);
    }
  }, [autoStartParam, isAutoLoopActive]);

  // Trigger question speech when question changes in auto mode
  useEffect(() => {
    if (isAutoLoopActive && !hasSpokenQuestionRef.current && !state.isSpeaking && !state.isListening && !state.isProcessing) {
      handleAskQuestionAloud();
    }
  }, [currentQuestionIndex, isAutoLoopActive, state.isSpeaking, state.isListening, state.isProcessing, handleAskQuestionAloud]);

  const handleToggleListen = () => {
    if (state.isListening) {
      stopListening();
      if (state.transcript || state.interimTranscript) {
        const text = (state.transcript || state.interimTranscript).trim();
        if (text) handleAutoSubmitAnswer(text);
      }
    } else if (state.isSpeaking) {
      stopSpeaking();
    } else {
      setIsAutoLoopActive(true);
      handleStartListening();
    }
  };

  const handleStartPractice = () => {
    setIsAutoLoopActive(true);
    hasSpokenQuestionRef.current = false;
    handleAskQuestionAloud();
  };

  const handleStopPractice = () => {
    setIsAutoLoopActive(false);
    stopListening();
    stopSpeaking();
  };

  const handleSkip = () => {
    stopListening();
    stopSpeaking();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      hasSpokenQuestionRef.current = false;
    }
  };

  // Map conversation to ConversationLog format
  const messages = state.conversation.map((msg, i) => ({
    id: String(i),
    role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.text,
    timestamp: msg.timestamp,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Voice Mock Interview</h1>
        <p className="text-muted-foreground">
          Interactive voice practice: AI asks questions aloud, listens to your speech, auto-submits after 5 seconds of silence, and provides verbal feedback.
        </p>
      </div>

      <Card className="glass border-orange-500/30 overflow-hidden relative">
        {state.isListening && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 opacity-50"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          />
        )}
        
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[420px] relative z-10 space-y-8">
          <div className="text-center max-w-2xl space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {isAutoLoopActive && (
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
                  Auto Mode Active
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold leading-relaxed text-white/90">{currentQuestion}</p>
          </div>

          <VoiceInterface 
            state={voiceState}
            onToggleListen={handleToggleListen}
            transcript={state.transcript || state.interimTranscript}
            response=""
            silenceCountdown={state.silenceCountdown}
          />

          <div className="flex flex-wrap gap-4 justify-center items-center">
            {!isAutoLoopActive ? (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full px-8 py-6 h-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                onClick={handleStartPractice}
              >
                <Play className="w-5 h-5 mr-2 fill-current" /> Start Voice Interview Loop
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="destructive" 
                className="rounded-full px-8 py-6 h-auto"
                onClick={handleStopPractice}
              >
                <Square className="w-5 h-5 mr-2 fill-current" /> Pause Practice
              </Button>
            )}

            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-6 py-6 h-auto glass border-white/20"
              onClick={handleAskQuestionAloud}
              disabled={state.isSpeaking}
            >
              <Volume2 className="w-5 h-5 mr-2" /> Repeat Question
            </Button>

            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-6 py-6 h-auto glass border-white/20"
              onClick={handleSkip}
              disabled={currentQuestionIndex >= questions.length - 1}
            >
              <SkipForward className="w-5 h-5 mr-2" /> Next Question
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Conversation & Feedback History</h3>
          <Button variant="ghost" size="sm" onClick={clearConversation} className="text-muted-foreground hover:text-white">
            <RotateCcw className="w-4 h-4 mr-1" /> Clear History
          </Button>
        </div>
        <ConversationLog messages={messages} isTyping={state.isProcessing} />
      </div>
    </div>
  );
}

export default function VoiceInterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-muted-foreground">Initializing Voice Lab...</p>
      </div>
    }>
      <VoiceInterviewContent />
    </Suspense>
  );
}
