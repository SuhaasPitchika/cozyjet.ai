


/**
 * @fileOverview Enhanced Skippy chat interaction with screen observation
 * and intelligent task assistance capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SkippyChatInputSchema = z.object({
  userMessage: z.string().describe('The message from the user.'),
  currentView: z.string().describe('The current dashboard view.'),
  observationContext: z.string().describe('Recent activity context.'),
  screenContext: z.string().optional().describe('Current screen content summary if available.'),
  taskContext: z.string().optional().describe('Current task user is working on.'),
});

const SkippyChatOutputSchema = z.object({
  response: z.string().describe('A brief, helpful, and empathetic response.'),
  suggestedAction: z.string().optional().describe('Suggested next action if applicable.'),
  taskBreakdown: z.array(z.string()).optional().describe('Step-by-step breakdown if user needs help.'),
});

export async function skippyChat(input: z.infer<typeof SkippyChatInputSchema>) {
  return skippyChatFlow(input);
}

const skippyChatPrompt = ai.definePrompt({
  name: 'skippyChatPrompt',
  input: { schema: SkippyChatInputSchema },
  output: { schema: SkippyChatOutputSchema },
  prompt: `You are Skippy, an intelligent workspace observer and assistant. You help users by understanding their work context and providing actionable guidance.

User Message: {{{userMessage}}}
Current Page: {{{currentView}}}
{{#if screenContext}}
Screen Context: {{{screenContext}}}
{{/if}}
{{#if taskContext}}
Current Task: {{{taskContext}}}
{{/if}}
Context: {{{observationContext}}}

PERSONALITY:
- Be concise and actionable. 1-3 sentences max.
- If user seems stuck, provide a specific next step.
- If they ask what you can do, explain: observing workspace, analyzing productivity, suggesting content.
- Offer to break down complex tasks into steps.
- Reference their actual work when possible.`,
});

const skippyChatFlow = ai.defineFlow(
  {
    name: 'skippyChatFlow',
    inputSchema: SkippyChatInputSchema,
    outputSchema: SkippyChatOutputSchema,
  },
  async (input) => {
    const { output } = await skippyChatPrompt(input);
    return output!;
  }
);

// Screen analysis flow for understanding workspace
export const skippyScreenAnalysis = ai.defineFlow(
  {
    name: 'skippyScreenAnalysis',
    inputSchema: z.object({
      screenContent: z.string().describe('Description of current screen content'),
      activeApp: z.string().describe('Name of the active application'),
      recentActions: z.array(z.string()).describe('Recent user actions'),
    }),
    outputSchema: z.object({
      understanding: z.string().describe('What Skippy understands about the work'),
      suggestions: z.array(z.string()).describe('Actionable suggestions'),
      taskIdentified: z.string().optional().describe('Task if identifiable'),
    }),
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'screenAnalysisPrompt',
      input: { schema: skippyScreenAnalysis.inputSchema },
      output: { schema: skippyScreenAnalysis.outputSchema },
      prompt: `Analyze this workspace context:

Active App: {{input.activeApp}}
Recent Actions: {{#each input.recentActions}}{{this}}, {{/each}}
Screen: {{input.screenContent}}

Provide:
1. Brief understanding of what the user is doing
2. 1-3 actionable suggestions
3. If a clear task is identifiable, name it`,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);
