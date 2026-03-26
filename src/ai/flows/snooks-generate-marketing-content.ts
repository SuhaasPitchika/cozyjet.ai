

/**
 * @fileOverview A unified marketing intelligence flow for Snooks.
 * Refined for conciseness, empathy, and high-fidelity strategy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SnooksInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s request or question.'),
  userContext: z.string().describe('User\'s stored context including tone preferences and niche.'),
});

const SnooksOutputSchema = z.object({
  responseText: z.string().describe('A concise, empathetic, and strategic response.'),
  generatedContent: z.object({
    linkedinPost: z.string().optional(),
    xTweet: z.string().optional(),
    emailContent: z.string().optional(),
  }).optional(),
});

export async function snooksIntelligence(input: z.infer<typeof SnooksInputSchema>) {
  return snooksIntelligenceFlow(input);
}

const snooksPrompt = ai.definePrompt({
  name: 'snooksPrompt',
  input: { schema: SnooksInputSchema },
  output: { schema: SnooksOutputSchema },
  prompt: `You are Snooks, an expert marketing head AI. You are brilliant, concise, and deeply understanding.
  
User Context: {{{userContext}}}
User Prompt: {{{userPrompt}}}

INSTRUCTIONS:
1. Respond with high empathy. Acknowledge the challenge or win the user is sharing.
2. Be extremely concise. Avoid "filler" text. Get straight to the strategic gold.
3. If they ask for content, provide it in the generatedContent fields. 
4. If they ask a strategy question, provide a structured but brief advice in responseText.
5. Your tone is authoritative yet supportive. Like a senior partner who values the user's time.`,
});

const snooksIntelligenceFlow = ai.defineFlow(
  {
    name: 'snooksIntelligenceFlow',
    inputSchema: SnooksInputSchema,
    outputSchema: SnooksOutputSchema,
  },
  async (input) => {
    const { output } = await snooksPrompt(input);
    return output!;
  }
);
