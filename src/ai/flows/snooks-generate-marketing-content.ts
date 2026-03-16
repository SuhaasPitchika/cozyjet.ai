'use server';
/**
 * @fileOverview A unified marketing intelligence flow for Snooks.
 * Handles both platform-specific content generation and general marketing advice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SnooksInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s request or question.'),
  userContext: z.string().describe('User\'s stored context including tone preferences, niche, and past successful content, as a JSON string.'),
});
export type SnooksInput = z.infer<typeof SnooksInputSchema>;

const SnooksOutputSchema = z.object({
  responseText: z.string().describe('The main conversational response or advice from Snooks.'),
  generatedContent: z.object({
    linkedinPost: z.string().optional(),
    xTweet: z.string().optional(),
    emailContent: z.string().optional(),
    instagramPost: z.string().optional(),
    youtubeScript: z.string().optional(),
  }).optional().describe('Structured marketing assets if the user requested generation.'),
});
export type SnooksOutput = z.infer<typeof SnooksOutputSchema>;

export async function snooksIntelligence(input: SnooksInput): Promise<SnooksOutput> {
  return snooksIntelligenceFlow(input);
}

const snooksPrompt = ai.definePrompt({
  name: 'snooksPrompt',
  input: { schema: SnooksInputSchema },
  output: { schema: SnooksOutputSchema },
  prompt: `You are Snooks, an expert marketing head AI agent with deep "PI" (Personal Intelligence) about the user.
  
Your goal is to provide high-fidelity marketing advice and content generation. You understand viral psychology, SEO, and platform-specific engagement hooks.

User's Request: {{{userPrompt}}}
User's Context (JSON): {{{userContext}}}

INSTRUCTIONS:
1. If the user is asking a question (e.g., "How do I improve SEO?", "What should my strategy be?"), provide a comprehensive 'responseText'.
2. If the user is asking to generate content (e.g., "Write a post about my new product"), provide 'responseText' as an introduction and populate the 'generatedContent' fields appropriately.
3. Always maintain an authoritative yet helpful tone aligned with the user's preferred style.
4. Ensure your advice is practical and grounded in modern marketing best practices.`,
});

const snooksIntelligenceFlow = ai.defineFlow(
  {
    name: 'snooksIntelligenceFlow',
    inputSchema: SnooksInputSchema,
    outputSchema: SnooksOutputSchema,
  },
  async (input) => {
    const { output } = await snooksPrompt(input);
    if (!output) throw new Error('Snooks could not process the request.');
    return output;
  }
);
