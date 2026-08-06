"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAgent } from "@/hooks/use-agent";
import { useVoice } from "@/hooks/use-voice";
import { useAppContext } from "@/components/layout/providers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AgentTrace } from "@/components/agents/agent-trace";
import { VoiceInterface, VoiceState } from "@/components/voice/voice-interface";
import { ConversationLog } from "@/components/voice/conversation-log";
import { 
  BrainCircuit, 
  Loader2, 
  MessageSquare, 
  Mic, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Volume2, 
  RotateCcw,
  CheckCircle2,
  Trophy
} from "lucide-react";

interface PracticeItem {
  id: string;
  question: string;
  answer: string;
  feedback: any | null;
  isEvaluated: boolean;
}

function getEvaluationTheme(score: number) {
  if (score >= 90) {
    return { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-500', badge: 'bg-emerald-500 text-white', badgeOutline: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  }
  if (score >= 80) {
    return { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-500', badge: 'bg-cyan-600 text-white', badgeOutline: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' };
  }
  if (score >= 70) {
    return { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-600 text-white', badgeOutline: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
  }
  if (score >= 60) {
    return { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'bg-amber-500 text-white', badgeOutline: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  }
  return { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-500', badge: 'bg-red-500 text-white', badgeOutline: 'bg-red-500/10 text-red-500 border-red-500/20' };
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "voice" ? "voice" : "text";

  const { session, updateSession } = useAppContext();
  const { generateQuestions, evaluateAnswer, interviewQuestions, feedback, isLoading, agentTrace } = useAgent();
  const { state: voiceStateObj, startListening, stopListening, speakText, stopSpeaking } = useVoice();

  const [mode, setMode] = useState<"text" | "voice">(initialMode);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [textAnswerInput, setTextAnswerInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showOverallSummary, setShowOverallSummary] = useState<boolean>(false);
  const hasSpokenCurrentQuestionRef = useRef<boolean>(false);

  // Unified practice items list
  const practiceItems: PracticeItem[] = session.practiceItems.length > 0
    ? session.practiceItems
    : (interviewQuestions || []).map((q, idx) => ({
        id: `q-${idx}`,
        question: q,
        answer: "",
        feedback: null,
        isEvaluated: false,
      }));

  // Sync questions from agent to session state
  useEffect(() => {
    if (interviewQuestions && interviewQuestions.length > 0 && session.practiceItems.length === 0) {
      const items: PracticeItem[] = interviewQuestions.map((q, idx) => ({
        id: `q-${idx}`,
        question: q,
        answer: "",
        feedback: null,
        isEvaluated: false,
      }));
      updateSession({ practiceItems: items, interviewQuestions });
    }
  }, [interviewQuestions, session.practiceItems.length, updateSession]);

  const currentItem = practiceItems[currentStepIndex] || null;

  // Single Question Generator for start or new interview set
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setShowOverallSummary(false);
    try {
      await generateQuestions(session.resumeText || "Candidate Resume", session.jobDescription || "Target Role");
      setCurrentStepIndex(0);
      setTextAnswerInput("");
      hasSpokenCurrentQuestionRef.current = false;
    } finally {
      setIsGenerating(false);
    }
  };

  // Evaluate Answer for current single question
  const handleEvaluateCurrentAnswer = async (answerText: string) => {
    if (!currentItem || !answerText.trim()) return;

    setIsEvaluating(true);
    try {
      await evaluateAnswer(currentItem.question, answerText);

      // Update current item in shared state
      const updatedItems = [...practiceItems];
      updatedItems[currentStepIndex] = {
        ...currentItem,
        answer: answerText,
        feedback: feedback || null,
        isEvaluated: true,
      };
      updateSession({ practiceItems: updatedItems });

      // Speak verbal feedback & audio suggestion in voice mode, then auto-advance
      if (mode === "voice") {
        const scoreVal = feedback?.score || 80;
        const mainObs = feedback?.feedback?.[0] || "Answer evaluated.";
        const improved = feedback?.improvedAnswer || "";
        
        let verbalSpeech = `Your answer scored ${scoreVal} out of 100. ${mainObs}`;
        if (scoreVal < 95 && improved) {
          verbalSpeech += ` Here is an audio suggestion to make your answer perfect: ${improved}`;
        }

        speakText(verbalSpeech, () => {
          if (currentStepIndex < practiceItems.length - 1) {
            setTimeout(() => {
              setCurrentStepIndex(prev => prev + 1);
              setTextAnswerInput("");
              hasSpokenCurrentQuestionRef.current = false;
            }, 1000);
          } else {
            setTimeout(() => {
              setShowOverallSummary(true);
              speakText("Interview session complete. Generating your overall performance report.");
            }, 1000);
          }
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Next Question Handler: Advances to Question N+1
  const handleNextQuestion = () => {
    if (currentStepIndex < practiceItems.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setTextAnswerInput("");
      hasSpokenCurrentQuestionRef.current = false;
      stopListening();
      stopSpeaking();
    } else {
      setShowOverallSummary(true);
    }
  };

  // Ref for evaluate handler to avoid stale closures during voice auto-submit
  const handleEvaluateRef = useRef(handleEvaluateCurrentAnswer);
  useEffect(() => {
    handleEvaluateRef.current = handleEvaluateCurrentAnswer;
  }, [handleEvaluateCurrentAnswer]);

  const handleStartVoiceListen = useCallback(() => {
    startListening({
      onSilenceAutoSubmit: (transcriptText) => {
        if (transcriptText.trim() && handleEvaluateRef.current) {
          handleEvaluateRef.current(transcriptText);
        }
      }
    });
  }, [startListening]);

  const voiceInterfaceState: VoiceState = voiceStateObj.isListening
    ? "listening"
    : voiceStateObj.isProcessing || isEvaluating
    ? "processing"
    : voiceStateObj.isSpeaking
    ? "speaking"
    : "idle";

  const handleToggleVoiceListen = () => {
    if (voiceStateObj.isListening) {
      stopListening();
      if (voiceStateObj.transcript || voiceStateObj.interimTranscript) {
        const text = (voiceStateObj.transcript || voiceStateObj.interimTranscript).trim();
        if (text) handleEvaluateCurrentAnswer(text);
      }
    } else if (voiceStateObj.isSpeaking) {
      stopSpeaking();
    } else {
      handleStartVoiceListen();
    }
  };

  const handleReadQuestionAloud = useCallback(() => {
    if (!currentItem) return;
    stopListening();
    hasSpokenCurrentQuestionRef.current = true;
    speakText(currentItem.question, () => {
      if (mode === "voice") {
        setTimeout(() => handleStartVoiceListen(), 500);
      }
    });
  }, [currentItem, speakText, mode, stopListening, handleStartVoiceListen]);

  // Read question automatically when entering Voice Mode or changing question
  useEffect(() => {
    if (mode === "voice" && currentItem && !hasSpokenCurrentQuestionRef.current && !voiceStateObj.isSpeaking && !voiceStateObj.isListening && !showOverallSummary) {
      handleReadQuestionAloud();
    }
  }, [mode, currentStepIndex, currentItem, voiceStateObj.isSpeaking, voiceStateObj.isListening, showOverallSummary, handleReadQuestionAloud]);

  const conversationMessages = voiceStateObj.conversation.map((msg, i) => ({
    id: String(i),
    role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
    content: msg.text,
    timestamp: msg.timestamp,
  }));

  const activeFeedback = currentItem?.feedback || (currentItem?.isEvaluated ? feedback : null);

  // Math consistency calculations
  const sitScore = Math.max(0, Math.min(25, Number(activeFeedback?.starBreakdown?.situation ?? 20)));
  const taskScore = Math.max(0, Math.min(25, Number(activeFeedback?.starBreakdown?.task ?? 18)));
  const actScore = Math.max(0, Math.min(25, Number(activeFeedback?.starBreakdown?.action ?? 20)));
  const resScore = Math.max(0, Math.min(25, Number(activeFeedback?.starBreakdown?.result ?? 17)));
  const calculatedScore = sitScore + taskScore + actScore + resScore;
  const calculatedGrade = activeFeedback?.grade || (
    calculatedScore >= 90 ? "Strong Hire (A+)" :
    calculatedScore >= 80 ? "Hire (A)" :
    calculatedScore >= 70 ? "Leaning Hire (B)" :
    calculatedScore >= 60 ? "Needs Work (C)" : "No Hire (D)"
  );
  const evaluationTheme = getEvaluationTheme(calculatedScore);

  // Overall Session Performance Metrics Calculation
  const evaluatedItems = practiceItems.filter(i => i.isEvaluated && i.feedback?.score);
  const totalSessionScore = evaluatedItems.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0);
  const averageSessionScore = evaluatedItems.length > 0 ? Math.round(totalSessionScore / evaluatedItems.length) : 85;

  const overallGrade = averageSessionScore >= 90
    ? "Strong Hire (A+)"
    : averageSessionScore >= 80
    ? "Hire (A)"
    : averageSessionScore >= 70
    ? "Leaning Hire (B)"
    : "Needs Work (C)";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6 md:px-8">
      {/* Top Navigation & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Mock Interview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time interview simulator: answer one question at a time via Text or Voice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={mode} onValueChange={(val) => setMode(val as "text" | "voice")} className="w-[180px]">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="text" className="gap-1.5 text-xs">
                <MessageSquare className="w-3.5 h-3.5" /> Text
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5 text-xs">
                <Mic className="w-3.5 h-3.5" /> Voice
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button 
            onClick={handleGenerateQuestions} 
            disabled={isGenerating || isLoading}
            size="sm"
            className="gap-2 text-xs"
          >
            {(isGenerating || isLoading) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
            Generate Questions
          </Button>
        </div>
      </div>

      {/* OVERALL PERFORMANCE REPORT CARD (End of Session Summary) */}
      {showOverallSummary ? (
        <Card className="p-8 space-y-6 border-emerald-500/40 bg-gradient-to-b from-card to-emerald-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">Interview Performance Report</h2>
              </div>
              <p className="text-xs text-muted-foreground">Overall evaluation across all answered interview questions.</p>
            </div>

            <Badge className="bg-emerald-500 text-white font-extrabold text-base px-4 py-2 self-start sm:self-auto">
              {overallGrade}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Average Score</span>
              <div className="text-4xl font-extrabold text-primary">{averageSessionScore}/100</div>
              <p className="text-[10px] text-muted-foreground">STAR 100-Point Formula</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Questions Completed</span>
              <div className="text-4xl font-extrabold text-foreground">{evaluatedItems.length}/{practiceItems.length}</div>
              <p className="text-[10px] text-muted-foreground">Questions Answered</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Interviewer Status</span>
              <div className="text-xl font-extrabold text-emerald-500 pt-2">{overallGrade.split(' ')[0]}</div>
              <p className="text-[10px] text-muted-foreground">Candidate Recommendation</p>
            </div>
          </div>

          {/* Breakdown per question */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Session Questions & Ratings</h3>
            <div className="space-y-2">
              {practiceItems.map((item, idx) => (
                <div key={item.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
                  <div className="space-y-0.5 max-w-xl">
                    <span className="font-bold text-muted-foreground">Q{idx + 1}:</span>
                    <p className="font-medium text-foreground line-clamp-1">{item.question}</p>
                  </div>
                  <Badge variant="outline" className="font-bold text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    {item.feedback?.score || 85}/100 ({item.feedback?.grade || 'Hire'})
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setShowOverallSummary(false)} className="gap-2 text-xs">
              <RotateCcw className="w-3.5 h-3.5" /> Review Questions
            </Button>
            <Button onClick={handleGenerateQuestions} className="gap-2 font-bold text-sm">
              <BrainCircuit className="w-4 h-4" /> Start New Interview Session
            </Button>
          </div>
        </Card>
      ) : practiceItems.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <BrainCircuit className="w-12 h-12 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-bold">No Interview Questions Generated Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Click below to generate tailored interview questions based on your uploaded resume.
          </p>
          <Button onClick={handleGenerateQuestions} disabled={isGenerating || isLoading} className="gap-2">
            <BrainCircuit className="w-4 h-4" /> Start Interview Session
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Step Progress Header */}
          <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1">
                Question {currentStepIndex + 1} of {practiceItems.length}
              </Badge>
              {currentItem?.isEvaluated && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Answer Evaluated
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReadQuestionAloud} 
                disabled={voiceStateObj.isSpeaking}
                className="text-xs gap-1.5"
              >
                <Volume2 className="w-4 h-4 text-cyan-500" /> Read Question Aloud
              </Button>
            </div>
          </div>

          {/* SINGLE QUESTION DISPLAY */}
          <Card className="p-6 space-y-6 border border-border bg-card text-card-foreground">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interviewer Question</span>
              <h2 className="text-2xl font-bold leading-relaxed">{currentItem?.question}</h2>
            </div>

            {/* INPUT MODE: TEXT */}
            {mode === "text" && (
              <div className="space-y-4 pt-2">
                <Textarea
                  placeholder="Type your structured STAR answer (Situation, Task, Action, Result)..."
                  value={textAnswerInput || currentItem?.answer || ""}
                  onChange={(e) => setTextAnswerInput(e.target.value)}
                  className="min-h-[160px] text-sm resize-none"
                  disabled={isEvaluating}
                />

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {(textAnswerInput || currentItem?.answer || "").length} characters typed
                  </span>
                  <Button 
                    onClick={() => handleEvaluateCurrentAnswer(textAnswerInput || currentItem?.answer || "")}
                    disabled={isEvaluating || !(textAnswerInput || currentItem?.answer || "").trim()}
                    className="gap-2"
                  >
                    {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Answer
                  </Button>
                </div>
              </div>
            )}

            {/* INPUT MODE: VOICE */}
            {mode === "voice" && (
              <div className="space-y-4 pt-2">
                <VoiceInterface
                  state={voiceInterfaceState}
                  onToggleListen={handleToggleVoiceListen}
                  transcript={voiceStateObj.transcript || voiceStateObj.interimTranscript}
                  response=""
                  silenceCountdown={voiceStateObj.silenceCountdown}
                />

                {conversationMessages.length > 0 && (
                  <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                    <AccordionItem value="history" className="border-none">
                      <AccordionTrigger className="text-xs font-semibold py-3 text-muted-foreground">
                        Voice Conversation Log ({conversationMessages.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <ConversationLog messages={conversationMessages} isTyping={isEvaluating} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            )}

            {/* EVALUATION RESULT DISPLAY WITH SCORE-BASED DYNAMIC COLOR THEME */}
            {activeFeedback && (
              <Card className={`p-6 space-y-4 rounded-xl border animate-in fade-in-50 duration-200 ${evaluationTheme.border} ${evaluationTheme.bg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${evaluationTheme.text}`}>
                      <ShieldCheck className="w-5 h-5" /> STAR Interviewer Evaluation
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      100-Point Grading Formula: Situation (25pt) + Task (25pt) + Action (25pt) + Result (25pt)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge className={`font-extrabold text-sm px-3 py-1 ${evaluationTheme.badge}`}>
                      Score: {calculatedScore}/100
                    </Badge>
                    <Badge variant="outline" className={`font-bold text-xs ${evaluationTheme.badgeOutline}`}>
                      {calculatedGrade}
                    </Badge>
                  </div>
                </div>

                {/* STAR Criteria Breakdown (0-25 per component) */}
                {activeFeedback.starBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {[
                      { key: 'situation', label: 'Situation', score: sitScore },
                      { key: 'task', label: 'Task', score: taskScore },
                      { key: 'action', label: 'Action', score: actScore },
                      { key: 'result', label: 'Result', score: resScore }
                    ].map((comp) => {
                      const percent = (comp.score / 25) * 100;
                      return (
                        <div key={comp.key} className="space-y-1 p-3 rounded-md bg-card border border-border">
                          <span className="text-xs font-bold capitalize text-muted-foreground">{comp.label}</span>
                          <div className="text-sm font-extrabold">{comp.score}/25 <span className="text-[10px] text-muted-foreground font-normal">pts</span></div>
                          <Progress value={percent} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI Feedback Observations */}
                {activeFeedback.feedback?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interviewer Observations</h4>
                    <ul className="space-y-1.5 text-sm">
                      {activeFeedback.feedback.map((note: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Audio Improvement Suggestion */}
                {activeFeedback.improvedAnswer && (
                  <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" /> Audio Improvement Suggestion
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => speakText(`Audio Suggestion: ${activeFeedback.improvedAnswer}`)}
                        className="text-xs gap-1.5 py-1 h-7 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen to Audio
                      </Button>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed italic">
                      &quot;{activeFeedback.improvedAnswer}&quot;
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* NEXT QUESTION NAVIGATION BUTTON */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {mode === "voice" ? (
                <div className="flex items-center gap-2 text-xs text-cyan-500 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  Hands-Free Voice Flow: Auto-advancing after verbal evaluation
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Question {currentStepIndex + 1} of {practiceItems.length}
                </div>
              )}

              <Button
                onClick={handleNextQuestion}
                size="default"
                className="gap-2 font-bold"
              >
                {currentStepIndex >= practiceItems.length - 1 ? (
                  <>
                    View Session Report <Trophy className="w-4 h-4 text-yellow-400" />
                  </>
                ) : (
                  <>
                    Next Question <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Execution Trace */}
      {agentTrace && agentTrace.length > 0 && (
        <Accordion type="single" collapsible className="border rounded-xl px-4">
          <AccordionItem value="trace" className="border-none">
            <AccordionTrigger className="text-xs font-bold text-muted-foreground">
              Multi-Agent Execution Log ({agentTrace.length} events)
            </AccordionTrigger>
            <AccordionContent>
              <AgentTrace traces={agentTrace} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[50vh] space-y-3 flex-col">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading Practice Session...</p>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
