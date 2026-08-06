import { MCPTool, MCPToolResult } from '../client';

const companyDatabase: Record<string, any> = {
  'google': {
    name: 'Google',
    overview: 'Multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.',
    techStack: ['C++', 'Java', 'Python', 'Go', 'JavaScript', 'Angular', 'Kubernetes'],
    culture: 'Engineering-driven, analytical, values "Googliness" (doing the right thing, striving for excellence, keeping an eye on the goals, being proactive).',
    interviewProcess: '1 phone screen (DSA). 4-5 onsite interviews (3 DSA, 1 System Design, 1 Behavioral/Googliness).',
    recentNews: 'Recently announced updates to Gemini AI models and new cloud infrastructure offerings.',
    glassdoorRating: 4.4
  },
  'meta': {
    name: 'Meta (formerly Facebook)',
    overview: 'Multinational technology conglomerate that owns and operates Facebook, Instagram, Threads, and WhatsApp, among other products and services.',
    techStack: ['Hack/PHP', 'C++', 'Java', 'Python', 'React', 'GraphQL', 'MySQL'],
    culture: 'Move fast, builder culture, high impact, focus on connecting people.',
    interviewProcess: '1 phone screen (2 coding questions in 45m). 4 onsite (2 Coding, 1 System/Product Design, 1 Behavioral/Jedi).',
    recentNews: 'Heavy investment in open-source AI (Llama models) and the metaverse.',
    glassdoorRating: 4.1
  },
  'amazon': {
    name: 'Amazon',
    overview: 'Multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
    techStack: ['Java', 'C++', 'Ruby', 'Python', 'React', 'AWS infrastructure'],
    culture: 'Driven by 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action). Writing narratives (6-pagers) instead of presentations.',
    interviewProcess: 'Online Assessment. 1 phone screen. 4-5 onsite interviews heavily focused on Leadership Principles combined with System Design or Coding.',
    recentNews: 'Expanding AWS generative AI capabilities and retail automation.',
    glassdoorRating: 3.8
  },
  'microsoft': {
    name: 'Microsoft',
    overview: 'Multinational technology corporation producing computer software, consumer electronics, personal computers, and related services.',
    techStack: ['C#', '.NET', 'C++', 'TypeScript', 'React', 'Azure infrastructure'],
    culture: 'Growth mindset, inclusive, work-life balance generally better than other FAANG companies.',
    interviewProcess: 'Varies by team. Typically 1 phone screen, 4 onsite interviews (Coding, Design, Behavioral).',
    recentNews: 'Deep integration of Copilot AI across all enterprise and consumer products.',
    glassdoorRating: 4.3
  }
};

export const companyResearchTool: MCPTool = {
  name: 'research_company',
  description: 'Get detailed information about a company including culture, tech stack, interview process, and recent news',
  parameters: {
    company: { type: 'string', description: 'Company name', required: true }
  },
  async execute(params): Promise<MCPToolResult> {
    const query = (params.company as string).toLowerCase();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Try to find a match
    let match = null;
    for (const key of Object.keys(companyDatabase)) {
      if (query.includes(key) || key.includes(query)) {
        match = companyDatabase[key];
        break;
      }
    }
    
    if (match) {
      return {
        success: true,
        data: match
      };
    }
    
    // Generic response for unknown companies
    return {
      success: true,
      data: {
        name: params.company,
        overview: `A technology company operating in the software industry.`,
        techStack: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'SQL'],
        culture: 'Standard tech startup culture, fast-paced and collaborative.',
        interviewProcess: 'Usually consists of an initial recruiter call, a technical screen, and a final loop of 3-4 interviews covering coding, system design, and behavioral questions.',
        recentNews: `Recent product launches and team expansions.`,
        glassdoorRating: 4.0
      }
    };
  }
};
