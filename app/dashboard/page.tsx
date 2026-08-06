"use client";

import { useAgent } from "@/hooks/use-agent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AgentTrace } from "@/components/agents/agent-trace";
import { SourceCard } from "@/components/rag/source-cards";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  const { analysisResult, agentTrace, ragContext } = useAgent();

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <h2 className="text-2xl font-semibold text-gray-300">No Analysis Found</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Please upload a resume and job description on the home page to view the detailed analysis dashboard.
        </p>
        <Link href="/">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights from our multi-agent system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" /> ATS Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analysisResult.score}%</div>
            <p className="text-xs text-muted-foreground mt-1">Based on JD keyword match</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" /> Skills Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analysisResult.matchingSkills?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Core skills identified</p>
          </CardContent>
        </Card>

        <Card className="glass border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analysisResult.insights?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Improvements suggested</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="glass mb-4 grid grid-cols-3 bg-transparent p-1">
              <TabsTrigger value="insights" className="data-[state=active]:bg-white/10">Insights</TabsTrigger>
              <TabsTrigger value="bullets" className="data-[state=active]:bg-white/10">Bullet Analysis</TabsTrigger>
              <TabsTrigger value="agent" className="data-[state=active]:bg-white/10">Agent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="mt-0">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Key Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.insights?.map((insight, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 flex gap-4"
                    >
                      <div className="mt-1">
                        <Zap className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-gray-300 leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bullets" className="mt-0">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Bullet Point Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-muted-foreground">
                    Detailed bullet analysis would be displayed here as a table or list.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="agent" className="mt-0">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Multi-Agent Execution Trace</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentTrace traces={agentTrace || []} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <h3 className="font-semibold text-lg">RAG Grounding</h3>
          {ragContext && ragContext.length > 0 ? (
            <div className="space-y-3">{ragContext.map((item, i) => <SourceCard key={i} item={item} />)}</div>
          ) : (
            <div className="glass p-6 rounded-xl text-sm text-muted-foreground">
              No specific knowledge base context was pulled for this analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
