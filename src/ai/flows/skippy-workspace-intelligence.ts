

/**
 * @fileOverview SKIPPY Workspace Intelligence Agent.
 * Handles local workspace monitoring and content brief generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WorkspaceEventSchema = z.object({
  integration: z.enum(['notion', 'figma', 'github']),
  rawContent: z.string().describe('The raw data extracted from the integration API.'),
  privacyBlocklist: z.array(z.string()).describe('User-defined sensitive terms to redact.'),
});

const ContentBriefSchema = z.object({
  summary: z.string().describe('A 1-2 sentence privacy-filtered summary of work accomplished.'),
  significance: z.enum(['low', 'medium', 'high']),
  platformTargets: z.array(z.string()),
});

export async function skippyProcessWorkspace(input: z.infer<typeof WorkspaceEventSchema>) {
  return skippyWorkspaceFlow(input);
}

const skippyWorkspacePrompt = ai.definePrompt({
  name: 'skippyWorkspacePrompt',
  input: { schema: WorkspaceEventSchema },
  output: { schema: ContentBriefSchema },
  prompt: `You are SKIPPY, the Seeing Agent. You operate locally and handle sensitive workspace data.
  
Your task is to analyze the provided raw content from {{{integration}}} and generate a high-level content brief.

CRITICAL PRIVACY RULES:
1. Redact any terms found in the privacy blocklist: {{#each privacyBlocklist}} "{{this}}" {{/each}}.
2. Do not include specific client names, internal codenames, or PII.
3. Focus on the 'type' of work completed and its professional significance.

Raw Content:
{{{rawContent}}}`,
});

const skippyWorkspaceFlow = ai.defineFlow(
  {
    name: 'skippyWorkspaceFlow',
    inputSchema: WorkspaceEventSchema,
    outputSchema: ContentBriefSchema,
  },
  async (input) => {
    const { output } = await skippyWorkspacePrompt(input);
    return output!;
  }
);
