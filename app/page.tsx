"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadArea } from "@/components/upload-area";
import { AgentTrace } from "@/components/agents/agent-trace";
import { SourceCard } from "@/components/rag/source-cards";
import { useAgent } from "@/hooks/use-agent";
import { BrainCircuit, Mic, Database, Bot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { analyzeResume, isLoading, analysisResult, agentTrace, ragContext } = useAgent();

  const handleAnalyze = async (file: File, jd: string) => {
    await analyzeResume(file, jd);
  };

  const features = [
    {
      icon: <Bot className="w-8 h-8 text-blue-400" />,
      title: "Multi-Agent Analysis",
      description: "Specialized agents for research, review, and orchestration.",
    },
    {
      icon: <Database className="w-8 h-8 text-green-400" />,
      title: "RAG Grounding",
      description: "Context-aware feedback powered by extensive knowledge base.",
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-purple-400" />,
      title: "MCP Integration",
      description: "Advanced semantic routing and query planning.",
    },
    {
      icon: <Mic className="w-8 h-8 text-orange-400" />,
      title: "Voice Interviews",
      description: "Real-time mock interviews with voice recognition.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 pt-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="gradient-text">AI Career Intelligence Platform</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Multi-Agent • RAG-Powered • Voice-Enabled
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, idx) => (
          <Card key={idx} className="glass hover:bg-white/10 transition-colors cursor-default">
            <CardHeader>
              <div className="mb-2">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Action Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Analyze Your Resume</h2>
        <UploadArea onAnalyze={handleAnalyze} isAnalyzing={isLoading} />
      </motion.div>

      {/* Results Area */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass flex flex-col items-center justify-center p-6 md:col-span-1">
              <h3 className="text-lg font-medium text-muted-foreground mb-4">ATS Score</h3>
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-blue-500/20">
                <span className="text-4xl font-bold text-blue-400">{analysisResult.score}%</span>
              </div>
            </Card>

            <Card className="glass p-6 md:col-span-2 space-y-4">
              <h3 className="text-lg font-medium">Skills Match</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-green-400">Matched Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matchingSkills?.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-red-400">Missing Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills?.map((skill, i) => (
                      <Badge key={i} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass p-6">
                <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
                <ul className="space-y-3">
                  {analysisResult.insights?.map((insight, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="glass p-6 bg-gradient-to-r from-blue-950/40 via-cyan-950/40 to-transparent border-cyan-500/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-cyan-400" /> Ready to Practice Your Answers?
                    </h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Start an interactive hands-free voice mock interview tailored to your resume.
                    </p>
                  </div>
                  <Link href="/voice-lab?autoStart=true">
                    <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] whitespace-nowrap">
                      <Mic className="w-4 h-4 mr-2" /> Start Voice Practice
                    </Button>
                  </Link>
                </div>
              </Card>

              {agentTrace && agentTrace.length > 0 && (
                <div className="glass p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Agent Trace</h3>
                  <AgentTrace traces={agentTrace} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">RAG Knowledge Used</h3>
              {ragContext && ragContext.length > 0 ? (
                <div className="space-y-3">{ragContext.map((item, i) => <SourceCard key={i} item={item} />)}</div>
              ) : (
                <Card className="glass p-6">
                  <p className="text-muted-foreground text-sm">No specific knowledge sources used for this analysis.</p>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
