import { mcpClient } from './client';
import { webSearchTool } from './mock-tools/web-search';
import { companyResearchTool } from './mock-tools/company-research';
import { githubProfileTool } from './mock-tools/github-profile';

export function initializeMCPTools(): void {
  mcpClient.registerTool(webSearchTool);
  mcpClient.registerTool(companyResearchTool);
  mcpClient.registerTool(githubProfileTool);
}

// Auto-initialize on import
initializeMCPTools();
