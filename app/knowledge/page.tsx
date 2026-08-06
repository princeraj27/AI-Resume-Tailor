"use client";

import { KnowledgePanel } from "@/components/rag/knowledge-panel";
import { IngestForm } from "@/components/rag/ingest-form";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileText, Layers, Search } from "lucide-react";

export default function KnowledgeBasePage() {
  const stats = [
    { label: "Total Documents", value: "1,248", icon: FileText, color: "text-blue-400" },
    { label: "Vector Embeddings", value: "8.5k", icon: Layers, color: "text-purple-400" },
    { label: "Search Queries", value: "432", icon: Search, color: "text-green-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          RAG Knowledge Base
        </h1>
        <p className="text-muted-foreground mt-2">Manage and explore the vector database that grounds the AI agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-[600px]">
        <div className="lg:col-span-2 glass rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <KnowledgePanel />
        </div>
        <div className="glass rounded-xl border border-white/10 overflow-hidden h-fit">
          <IngestForm />
        </div>
      </div>
    </div>
  );
}
