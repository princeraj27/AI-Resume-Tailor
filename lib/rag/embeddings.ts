import { Embeddings } from '@langchain/core/embeddings';

const VOCABULARY = [
  "react", "javascript", "typescript", "node", "python", "java", "c#", "go", "rust",
  "aws", "gcp", "azure", "docker", "kubernetes", "ci/cd", "agile", "scrum", "leadership",
  "frontend", "backend", "fullstack", "database", "sql", "nosql", "api", "rest", "graphql",
  "architecture", "design", "scalable", "performance", "optimization", "security", "testing",
  "cloud", "microservices", "serverless", "machine", "learning", "data", "science", "ai",
  "management", "team", "project", "product", "business", "strategy", "communication",
  "development", "engineering", "software", "system", "infrastructure", "devops", "operations",
  "deployment", "continuous", "integration", "delivery", "automation", "monitoring", "logging",
  "analytics", "metrics", "kpi", "growth", "user", "experience", "ui", "ux", "interface",
  "application", "web", "mobile", "ios", "android", "cross-platform", "framework", "library",
  "tool", "platform", "service", "solution", "product", "feature", "release", "version",
  "code", "review", "quality", "standard", "practice", "methodology", "process", "lifecycle",
  "requirements", "specification", "documentation", "support", "maintenance", "troubleshooting",
  "debugging", "issue", "bug", "fix", "resolution", "customer", "client", "stakeholder",
  "partner", "vendor", "contractor", "consultant", "employee", "manager", "director", "vp",
  // Padded to 384 terms for compatibility (truncated here for brevity, but functional)
];

// Fill rest with placeholders to reach 384
while (VOCABULARY.length < 384) {
  VOCABULARY.push(`term_${VOCABULARY.length}`);
}

export class LocalEmbeddings extends Embeddings {
  constructor(params?: any) {
    super(params);
  }
  
  async embedQuery(text: string): Promise<number[]> {
    return this.calculateVector(text);
  }
  
  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map(doc => this.calculateVector(doc));
  }
  
  private calculateVector(text: string): number[] {
    const tokens = text.toLowerCase().split(/[^a-z0-9]+/);
    const vector = new Array(384).fill(0);
    
    // Calculate term frequencies
    for (const token of tokens) {
      if (!token) continue;
      const index = VOCABULARY.indexOf(token);
      if (index !== -1) {
        vector[index]++;
      } else {
        // Hash unknown tokens to one of the placeholder buckets for some signal
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
          hash = ((hash << 5) - hash) + token.charCodeAt(i);
          hash |= 0;
        }
        const bucket = 120 + (Math.abs(hash) % 264); // use upper portion of vector
        vector[bucket]++;
      }
    }
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    
    return vector.map(val => val / magnitude);
  }
}

export const embeddingsInstance = new LocalEmbeddings({});
