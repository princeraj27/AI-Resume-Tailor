# AI Career Intelligence Platform — Architecture & Complete Workflows

The **AI Career Intelligence Platform** is a multi-agent AI application designed for Faculty Development Program (FDP) demonstrations. It showcases **Multi-Agent Orchestration**, **Retrieval-Augmented Generation (RAG)**, **Model Context Protocol (MCP) Tools**, and an **Ultra-Low Latency Voice Agent**.

---

## 🏗️ High-Level System Architecture

```
[ User UI Layer ]
  ├── Home & Upload Hub (/)
  ├── ATS Analysis Dashboard (/dashboard)
  ├── STAR Interview Preparation (/interview)
  ├── Hands-Free Voice Lab (/voice-lab)
  └── RAG Knowledge Base (/knowledge-base)
        │
        ▼
[ Multi-Agent Supervisor Layer ] (lib/agents/orchestrator.ts)
  ├── Resume Analyst Agent (llama-3.3-70b-versatile)
  ├── Interview Coach Agent (llama-3.3-70b-versatile)
  ├── RAG Grounding Agent (llama-3.3-70b-versatile)
  └── Quality Reviewer / Critic Agent (llama-3.1-8b-instant)
        │
   ┌────┴──────────────────────────────┐
   ▼                                   ▼
[ In-Memory RAG Engine ]     [ MCP Interface Layer ]
(lib/rag/)                  (lib/mcp/)
  ├── MemoryVectorStore        ├── Web Search Tool (`web_search`)
  ├── LocalEmbeddings (TF-IDF) ├── Company Research Tool (`research_company`)
  └── Domain Knowledge Base    └── GitHub Profile Tool (`get_github_profile`)
        (4 JSON datasets)
```

---

## 🔄 Complete End-to-End User Flow

```mermaid
graph TD
    A[Step 1: Candidate Uploads Resume & Pastes JD] --> B[Multi-Agent Analysis Pipeline Executed]
    B --> C[Step 2: ATS Score, Skill Match & Insights Displayed]
    C --> D[Candidate Clicks 'Start Voice Practice' Button]
    D --> E[Step 3: Direct Transition to Voice Lab]
    E --> F[AI Voice Agent Reads Question 1 Aloud via TTS]
    F --> G[Microphone Auto-Turns ON & Candidate Speaks Answer]
    G --> H{5 Seconds of Silence Detected?}
    H -- Yes --> I[Auto-Submits Voice Transcript]
    H -- No (Manually Click Stop) --> I
    I --> J[Sub-300ms Streaming Evaluation via Groq fast-model]
    J --> K[AI Speaks Feedback & Score Aloud]
    K --> L{More Questions?}
    L -- Yes --> M[Auto-Advances to Question N & Repeats Loop]
    L -- No / User Pauses --> N[Complete Session Transcript & Score Breakdown]
```

---

## 📊 Detailed Workflow Sequence Diagrams

### 1. Resume Upload & Multi-Agent Analysis Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Page as Home UI (/)
    participant Orchestrator as Orchestrator Agent
    participant RAG as RAG Grounding Agent
    participant ResumeAgent as Resume Analyst Agent
    participant Critic as Quality Critic Agent
    participant VectorStore as Memory Vector Store

    User->>Page: Upload PDF Resume + Paste Job Description
    Page->>Orchestrator: POST /api/agent (task: analyze_resume)
    Orchestrator->>RAG: Ingest User Documents & Retrieve Grounding Context
    RAG->>VectorStore: Ingest PDF Text & Query Skill Taxonomy / Bullet Rewrites
    VectorStore-->>RAG: Return Top-K Grounding Matches
    RAG-->>Orchestrator: Grounded RAG Context
    Orchestrator->>ResumeAgent: Analyze Resume vs JD + RAG Context
    ResumeAgent-->>Orchestrator: ATS Score, Matched/Missing Skills, Bullet Advice
    Orchestrator->>Critic: Review Analysis Consistency & Actionability
    Critic-->>Orchestrator: Verified Quality Analysis
    Orchestrator-->>Page: Return AnalysisOutput + AgentTrace Timeline
    Page-->>User: Display Score Gauge, Skills Badges, Insights & 'Start Voice Practice' CTA
```

---

### 2. Hands-Free Interactive Voice Interview Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant VoiceUI as Voice Lab (/voice-lab)
    participant SpeechSTT as Web Speech Recognition (STT)
    participant SpeechTTS as Web Speech Synthesis (TTS)
    participant VoiceAPI as Voice API (/api/voice)
    participant Groq as Groq LLM (llama-3.1-8b-instant)

    VoiceUI->>SpeechTTS: AI Reads Question 1 Aloud
    SpeechTTS-->>Candidate: Audio output (TTS Question)
    SpeechTTS-->>VoiceUI: Question Speech Finished
    VoiceUI->>SpeechSTT: Auto-Turn ON Microphone (Listening Mode)
    Candidate->>SpeechSTT: Speaks Answer Aloud
    SpeechSTT-->>VoiceUI: Real-Time Audio Transcript Streamed (en-IN / local locale)
    
    note over VoiceUI,SpeechSTT: 5-Second Silence Auto-Submit Timer
    alt Candidate Pauses for 5 Seconds
        SpeechSTT-->>VoiceUI: Silence Timeout Triggered
        VoiceUI->>SpeechSTT: Auto-Stop Listening & Finalize Transcript
    end

    VoiceUI->>VoiceAPI: POST /api/voice (transcript, question)
    VoiceAPI->>Groq: Stream prompt (llama-3.1-8b-instant)
    Groq-->>VoiceAPI: Sub-300ms Token Stream (800+ tok/s)
    VoiceAPI-->>VoiceUI: Chunked Response Stream
    VoiceUI->>SpeechTTS: Stream Feedback Audio Sentences Aloud
    SpeechTTS-->>Candidate: Audio output (Verbal STAR Feedback & Score)
    SpeechTTS-->>VoiceUI: Feedback Audio Finished
    VoiceUI->>VoiceUI: Auto-Increment to Question N (Auto-Loop Continues)
```

---

## 🛠️ Technology Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend & Backend** | Next.js 16 App Router, TypeScript | Core application framework & API routes |
| **Styling & UI** | Tailwind CSS v4, Framer Motion, Lucide Icons | Dark mode glassmorphism UI with micro-animations |
| **Agent Orchestration** | LangChain JS / Custom Supervisor Pattern | Agent routing, state management, and trace logging |
| **LLM Inference Engine** | Groq API (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`) | Ultra-fast token generation (< 200ms latency) |
| **Vector RAG Storage** | `MemoryVectorStore`, `LocalEmbeddings` (TF-IDF) | Self-contained vector database & retrieval |
| **MCP Integration** | Custom `MCPClient` & Tool Registry | Standardized tool execution (`web_search`, `research_company`, `github_profile`) |
| **Voice Processing** | Web Speech Recognition & Web Speech Synthesis API | Zero-dependency browser-native STT and TTS |
