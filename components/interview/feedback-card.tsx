'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface FeedbackResult {
  score: number;
  starBreakdown: { situation: number; task: number; action: number; result: number };
  feedback: string[];
  improvedAnswer: string;
  strengths: string[];
  weaknesses: string[];
}

interface FeedbackCardProps {
  feedback: FeedbackResult;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 60) return 'text-amber-400 stroke-amber-400';
    return 'text-red-400 stroke-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500/20 to-transparent';
    if (score >= 60) return 'from-amber-500/20 to-transparent';
    return 'from-red-500/20 to-transparent';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-black/20 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden"
    >
      <div className={`p-6 border-b border-white/10 bg-gradient-to-b ${getScoreGradient(feedback.score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white/90">Analysis Complete</h2>
            <p className="text-sm text-zinc-400 mt-1">AI Critic Agent Feedback</p>
          </div>
          
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="36" className="stroke-white/10" strokeWidth="8" fill="none" />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                className={getScoreColor(feedback.score)}
                strokeWidth="8"
                fill="none"
                strokeDasharray="226"
                initial={{ strokeDashoffset: 226 }}
                animate={{ strokeDashoffset: 226 - (226 * feedback.score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{feedback.score}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        {/* STAR Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            STAR Methodology Score
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Situation', score: feedback.starBreakdown.situation, color: 'bg-blue-500' },
              { label: 'Task', score: feedback.starBreakdown.task, color: 'bg-purple-500' },
              { label: 'Action', score: feedback.starBreakdown.action, color: 'bg-emerald-500' },
              { label: 'Result', score: feedback.starBreakdown.result, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="text-zinc-300 font-medium">{item.score}/10</span>
                </div>
                <Progress value={item.score * 10} className="h-1.5 bg-white/5" indicatorClassName={item.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/5 border-emerald-500/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-2">
                {feedback.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-red-500/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-2">
                {feedback.weaknesses.map((weak, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Key Insights
          </h3>
          <ul className="space-y-3">
            {feedback.feedback.map((fb, i) => (
              <li key={i} className="text-sm text-zinc-300 bg-black/20 p-3 rounded-lg border border-white/5">
                {fb}
              </li>
            ))}
          </ul>
        </div>

        {/* Improved Answer */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="improved-answer" className="border-emerald-500/30 rounded-lg overflow-hidden bg-emerald-950/20 px-4">
            <AccordionTrigger className="text-emerald-400 hover:text-emerald-300 hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                View AI Improved Answer
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-emerald-100/80 leading-relaxed pb-4">
                {feedback.improvedAnswer}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.div>
  );
}
