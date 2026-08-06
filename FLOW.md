# AI Career Intelligence Platform — Architecture & Workflows

## High-Level System Architecture

```
[ User UI Layer ]
  ├── Home / Upload Hub (/)
  ├── Analysis Dashboard (/dashboard)
  ├── STAR Interview Coach (/interview)
  ├── Voice Lab (/voice-lab)
  └── Knowledge Base (/knowledge-base)
        │
        ▼
[ Multi-Agent Orchestrator Layer ] (lib/agents/orchestrator.ts)
  ├── Resume Analyst Agent (llama-3.3-70b-versatile)
  ├── Interview Coach Agent (llama-3.3-70b-versatile)
  ├── RAG Grounding Agent (llama-3.3-70b-versatile)
  └── Quality Reviewer / Critic Agent (llama-3.1-8b-instant)
        │
   ┌────┴──────────────────────────────┐
   ▼                                   ▼
[ In-Memory RAG Engine ]     [ MCP Interface Layer ]
(lib/rag/)                  (lib/mcp/)
  ├── MemoryVectorStore        ├── Web Search Tool
  ├── LocalEmbeddings          ├── Company Research Tool
  └── Knowledge Base (JSONs)   └── GitHub Profile Tool
```

## Workflows & Sequence Diagrams

### 1. Multi-Agent Resume Analysis Workflow
1. User uploads resume PDF and pastes Job Description.
2. `Orchestrator Agent` receives request and delegates to `RAG Grounding Agent`.
3. `RAG Agent` ingests document text into `MemoryVectorStore` and queries domain knowledge for matching bullet rewrites and skill taxonomy.
4. `Resume Agent` analyzes resume vs. JD using RAG context and calculates score, skill match, and improvement suggestions.
5. `Critic Agent` (fast model) reviews output quality.
6. Frontend receives structured analysis along with real-time `AgentTrace` visualization.

### 2. Voice Interview Workflow
1. User opens `/voice-lab` and starts speaking.
2. Web Speech API converts speech to text locally in real time.
3. Transcript sent to `/api/voice` streaming endpoint.
4. Server streams AI response chunks via Server-Sent Stream.
5. Client accumulates chunks into natural sentences and synthesizes speech via Web Speech Synthesis API with animated waveform feedback.
