"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/components/layout/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentTrace } from "@/components/agents/agent-trace";
import { GroundingCitation } from "@/components/rag/grounding-citation";
import { KnowledgePanel } from "@/components/rag/knowledge-panel";
import { IngestForm } from "@/components/rag/ingest-form";
import Link from "next/link";
import { ArrowLeft, Target, TrendingUp, Zap, BookOpen, Mic } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "insights";

  const { session } = useAppContext();
  const analysisResult = session.analysisResult;
  const agentTrace = session.agentTrace;
  const ragContext = session.ragContext;

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] space-y-4 text-center">
        <Target className="w-12 h-12 text-muted-foreground opacity-40" />
        <h2 className="text-2xl font-bold">No Active Analysis Found</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          Please upload your resume and job description on the home page to view your ATS analysis dashboard.
        </p>
        <Link href="/">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Go to Upload Page
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            ATS Compatibility • Multi-Agent Insights • Inline RAG Citations
          </p>
        </div>
        <Link href="/practice">
          <Button className="gap-2">
            <Mic className="w-4 h-4 text-orange-500" /> Start Practice Hub
          </Button>
        </Link>
      </div>

      {/* Primary Metrics (Section 3 Visual Hierarchy) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-t-4 border-t-blue-500 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-500" /> ATS Match Score
          </span>
          <div className="text-4xl font-extrabold text-foreground">{analysisResult.score}%</div>
          <p className="text-xs text-muted-foreground">Overall resume to JD alignment</p>
        </Card>
        
        <Card className="p-5 border-t-4 border-t-emerald-500 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Matched Skills
          </span>
          <div className="text-4xl font-extrabold text-foreground">{analysisResult.matchingSkills?.length || 0}</div>
          <p className="text-xs text-muted-foreground">Technical skills confirmed in resume</p>
        </Card>

        <Card className="p-5 border-t-4 border-t-amber-500 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Action Items
          </span>
          <div className="text-4xl font-extrabold text-foreground">{analysisResult.insights?.length || 0}</div>
          <p className="text-xs text-muted-foreground">High-impact optimizations recommended</p>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-4">
          <TabsTrigger value="insights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5">
            Key Insights
          </TabsTrigger>
          <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5">
            Skills Breakdown
          </TabsTrigger>
          <TabsTrigger value="trace" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5">
            Agent Trace
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-500" /> Knowledge Explorer
          </TabsTrigger>
        </TabsList>
        
        {/* Tab 1: Key Insights with Inline Citations */}
        <TabsContent value="insights" className="pt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Detailed Optimizations</h3>
            <ul className="space-y-4">
              {analysisResult.insights?.map((insight, idx) => (
                <li key={idx} className="p-4 rounded-lg bg-muted/40 border space-y-2">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-foreground leading-relaxed">{insight}</p>
                  </div>
                  {/* Inline Citation */}
                  {ragContext && ragContext[idx] && (
                    <div className="pl-8">
                      <GroundingCitation item={ragContext[idx]} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
        
        {/* Tab 2: Skills Breakdown */}
        <TabsContent value="skills" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">Matching Skills ({analysisResult.matchingSkills?.length || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matchingSkills?.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-destructive">Missing Skills ({analysisResult.missingSkills?.length || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills?.map((skill, i) => (
                  <Badge key={i} variant="outline" className="border-destructive/30 text-destructive px-3 py-1 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab 3: Agent Activity Trace */}
        <TabsContent value="trace" className="pt-4">
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold">Multi-Agent Execution Timeline</h3>
            <AgentTrace traces={agentTrace || []} />
          </Card>
        </TabsContent>

        {/* Tab 4: Nested Knowledge Explorer (Section 5 Requirement) */}
        <TabsContent value="knowledge" className="pt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <KnowledgePanel />
            </div>
            <div>
              <IngestForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
