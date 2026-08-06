"use client";

import { useState } from "react";
import { useAgent } from "@/hooks/use-agent";
import { QuestionPanel } from "@/components/interview/question-panel";
import { AnswerArea } from "@/components/interview/answer-area";
import { FeedbackCard } from "@/components/interview/feedback-card";
import { AgentTrace } from "@/components/agents/agent-trace";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function InterviewPage() {
  const { 
    generateQuestions, 
    evaluateAnswer, 
    interviewQuestions, 
    feedback, 
    isLoading, 
    agentTrace,
    ragContext
  } = useAgent();

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [answerContent, setAnswerContent] = useState("");

  const questions = interviewQuestions || [];
  const selectedQuestion = selectedIndex >= 0 && selectedIndex < questions.length ? questions[selectedIndex] : null;

  const handleGenerate = async () => {
    await generateQuestions("Sample resume content", "Sample JD content");
    setSelectedIndex(-1);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !answerContent.trim()) return;
    await evaluateAnswer(selectedQuestion, answerContent);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Preparation</h1>
          <p className="text-muted-foreground">Practice answering targeted questions based on your resume and JD.</p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
          Generate Questions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <div className="lg:col-span-1 h-full overflow-hidden">
          <QuestionPanel 
            questions={questions} 
            selectedIndex={selectedIndex} 
            onSelect={(idx) => {
              setSelectedIndex(idx);
              setAnswerContent("");
            }} 
          />
        </div>

        <div className="lg:col-span-2 h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {selectedQuestion ? (
            <>
              <AnswerArea 
                question={selectedQuestion} 
                onSubmit={(answer) => evaluateAnswer(selectedQuestion, answer)} 
                isSubmitting={isLoading} 
              />
              {feedback && (
                <FeedbackCard feedback={feedback} />
              )}
            </>
          ) : (
            <div className="glass h-full flex flex-col items-center justify-center text-muted-foreground rounded-xl border border-white/10">
              <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a question from the left panel or generate new ones to start practicing.</p>
            </div>
          )}
        </div>
      </div>

      {agentTrace && agentTrace.length > 0 && (
        <Accordion type="single" collapsible className="glass rounded-xl px-6 mt-8">
          <AccordionItem value="trace" className="border-none">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              Agent Activity Log
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

