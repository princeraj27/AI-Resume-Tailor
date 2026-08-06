"use client";

import { useState } from "react";
import { UploadArea } from "@/components/upload-area";
import { AgentTrace } from "@/components/agents/agent-trace";
import { GroundingCitation } from "@/components/rag/grounding-citation";
import { useAgent } from "@/hooks/use-agent";
import { useAppContext } from "@/components/layout/providers";
import { BrainCircuit, Mic, Database, Bot, ArrowRight, Play, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { session, updateSession, hasActiveSession, resetSession } = useAppContext();
  const { analyzeResume, isLoading, analysisResult, agentTrace, ragContext } = useAgent();

  const handleAnalyze = async (file: File, jd: string) => {
    await analyzeResume(file, jd);
  };

  const currentResult = analysisResult || session.analysisResult;
  const currentTrace = (agentTrace && agentTrace.length > 0) ? agentTrace : session.agentTrace;

  const features = [
    {
      icon: <Bot className="w-6 h-6 text-primary" />,
      title: "Multi-Agent System",
      description: "Specialized Groq-powered agents for research, scoring, and review.",
    },
    {
      icon: <Database className="w-6 h-6 text-emerald-500" />,
      title: "RAG Grounding",
      description: "Inline citations grounded in our domain knowledge base.",
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-cyan-500" />,
      title: "MCP Tools",
      description: "Parallel company research & web search execution.",
    },
    {
      icon: <Mic className="w-6 h-6 text-orange-500" />,
      title: "Interactive Practice",
      description: "Text & Voice practice with 5-second silence auto-submit.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          AI Career Intelligence Platform
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Multi-Agent Resume Optimization, Inline RAG Citations, and Hands-Free Voice Practice.
        </p>
      </div>

      {/* ACTIVE SESSION RESUME BANNER (Section 4 Requirement) */}
      {hasActiveSession && (
        <Card className="border-primary/40 bg-primary/5 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500 text-white font-bold">Active Session Found</Badge>
                {currentResult && <span className="text-sm font-semibold">ATS Score: {currentResult.score}%</span>}
              </div>
              <p className="text-sm text-muted-foreground">
                You have an in-progress session with analyzed resume data. Pick up right where you left off.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/dashboard" className="flex-1 sm:flex-none">
                <Button variant="default" className="w-full gap-2">
                  Resume Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/practice" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full gap-2">
                  <Mic className="w-4 h-4 text-orange-500" /> Practice Hub
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={resetSession} title="Start New Session">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Component */}
      <UploadArea onAnalyze={handleAnalyze} isAnalyzing={isLoading} />

      {/* Features Grid */}
      {!currentResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-5 space-y-2">
              <div>{feature.icon}</div>
              <h3 className="font-bold text-base">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Analysis Results Display */}
      {currentResult && (
        <div className="space-y-6 pt-4">
          {/* Main Primary Metric Row (Section 3 Requirement: Clear Hierarchy) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center flex flex-col items-center justify-center space-y-2 md:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ATS Compatibility Score</span>
              <div className="text-5xl font-extrabold text-primary">{currentResult.score}%</div>
              <Progress value={currentResult.score} className="w-full h-2 mt-2" />
            </Card>

            <Card className="p-6 space-y-4 md:col-span-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">Matching Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentResult.matchingSkills?.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentResult.missingSkills?.map((skill, i) => (
                    <Badge key={i} variant="outline" className="border-destructive/30 text-destructive">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Key Insights & Inline RAG Grounding */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Key Optimization Insights</h3>
                  <Link href="/practice">
                    <Button size="sm" className="gap-2">
                      <Mic className="w-4 h-4" /> Start Practice <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <ul className="space-y-3">
                  {currentResult.insights?.map((insight, idx) => (
                    <li key={idx} className="space-y-1 text-sm border-b pb-3 last:border-none last:pb-0">
                      <p className="font-medium text-foreground">{insight}</p>
                      {/* Inline RAG Citation */}
                      {ragContext && ragContext[idx] && (
                        <GroundingCitation item={ragContext[idx]} />
                      )}
                    </li>
                  ))}
                </ul>
              </Card>

              {currentTrace && currentTrace.length > 0 && (
                <Card className="p-6 space-y-3">
                  <h3 className="text-base font-bold">Multi-Agent Pipeline Trace</h3>
                  <AgentTrace traces={currentTrace} />
                </Card>
              )}
            </div>

            {/* Quick Practice Hub Nav Card */}
            <Card className="p-6 space-y-4 h-fit">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Mic className="w-5 h-5 text-orange-500" /> Next Step: Interview Practice
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Take your analysis into our single Practice Hub. Practice questions in Text or Hands-Free Voice mode with instant STAR scoring.
              </p>
              <Link href="/practice" className="block">
                <Button className="w-full gap-2">
                  Go to Practice Hub <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
