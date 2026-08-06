import { MCPTool, MCPToolResult } from '../client';

export const webSearchTool: MCPTool = {
  name: 'web_search',
  description: 'Search the web for information about companies, roles, interview tips, and career advice',
  parameters: {
    query: { type: 'string', description: 'Search query', required: true }
  },
  async execute(params): Promise<MCPToolResult> {
    const query = (params.query as string).toLowerCase();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let results = [];
    
    if (query.includes('interview') || query.includes('tips')) {
      results = [
        {
          title: "Top 50 Software Engineering Interview Questions (2024)",
          snippet: "Prepare for your next technical interview with our comprehensive list of the most common behavioral and technical questions asked by top tech companies.",
          url: "https://example.com/interview-prep"
        },
        {
          title: "Mastering the System Design Interview",
          snippet: "A step-by-step guide to approaching system design questions. Learn how to scale systems, choose the right database, and communicate trade-offs effectively.",
          url: "https://example.com/system-design"
        },
        {
          title: "How to use the STAR method in interviews",
          snippet: "The STAR method (Situation, Task, Action, Result) is the most effective way to answer behavioral interview questions. Here are 10 examples.",
          url: "https://example.com/star-method"
        }
      ];
    } else if (query.includes('salary') || query.includes('compensation')) {
      results = [
        {
          title: "Software Engineer Salary Trends 2024",
          snippet: "The average base salary for a Senior Software Engineer in San Francisco is $180,000, with total compensation averaging $250,000 including equity.",
          url: "https://example.com/salaries/swe"
        },
        {
          title: "How to Negotiate Your Tech Offer",
          snippet: "Don't accept the first offer. Learn the strategies used by top earners to increase their base salary and equity grants by up to 20%.",
          url: "https://example.com/negotiation"
        }
      ];
    } else {
      results = [
        {
          title: `Latest News and Updates for ${params.query}`,
          snippet: `Find the most recent articles, blog posts, and community discussions related to ${params.query}. Stay up to date with industry trends.`,
          url: `https://example.com/search?q=${encodeURIComponent(params.query as string)}`
        },
        {
          title: `Complete Guide to ${params.query} in 2024`,
          snippet: `Everything you need to know about ${params.query}. From basics to advanced concepts, expert opinions, and real-world applications.`,
          url: `https://example.com/guide/${encodeURIComponent(params.query as string)}`
        },
        {
          title: `Top companies hiring for ${params.query} skills`,
          snippet: `See which top tech companies are actively looking for candidates with experience in ${params.query}. View open roles and salary estimates.`,
          url: `https://example.com/jobs/skills/${encodeURIComponent(params.query as string)}`
        }
      ];
    }
    
    return {
      success: true,
      data: {
        query: params.query,
        results
      }
    };
  }
};
