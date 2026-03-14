'use server';
/**
 * @fileOverview A Genkit flow for Snooks to generate marketing content for various platforms.
 *
 * - snooksGenerateMarketingContent - A function that handles the content generation process.
 * - SnooksGenerateMarketingContentInput - The input type for the snooksGenerateMarketingContent function.
 * - SnooksGenerateMarketingContentOutput - The return type for the snooksGenerateMarketingContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SnooksGenerateMarketingContentInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s request for marketing content.'),
  userContext: z.string().describe('User\'s stored context including tone preferences, niche, and past successful content, as a JSON string.'),
});
export type SnooksGenerateMarketingContentInput = z.infer<typeof SnooksGenerateMarketingContentInputSchema>;

const SnooksGenerateMarketingContentOutputSchema = z.object({
  linkedinPost: z.string().describe('Generated content for a LinkedIn post.'),
  xTweet: z.string().describe('Generated content for an X (Twitter) tweet.'),
  emailContent: z.string().describe('Generated content for an email.'),
  instagramPost: z.string().describe('Generated content for an Instagram post.'),
  youtubeScript: z.string().describe('Generated content for a YouTube script.'),
});
export type SnooksGenerateMarketingContentOutput = z.infer<typeof SnooksGenerateMarketingContentOutputSchema>;

export async function snooksGenerateMarketingContent(input: SnooksGenerateMarketingContentInput): Promise<SnooksGenerateMarketingContentOutput> {
  return snooksGenerateMarketingContentFlow(input);
}

const snooksMarketingPrompt = ai.definePrompt({
  name: 'snooksMarketingPrompt',
  input: { schema: SnooksGenerateMarketingContentInputSchema },
  output: { schema: SnooksGenerateMarketingContentOutputSchema },
  prompt: `You are Snooks, an expert marketing head AI agent. Your goal is to generate high-quality, multi-platform marketing content based on user prompts and their specific context. You are skilled in viral content psychology, SEO principles, platform-specific hook structures, and persuasion frameworks.

First, act as a content strategist to plan the overall structure and key messages based on the user's request and context. Then, as a copywriter, tailor the content for each platform, ensuring it is optimized for engagement and platform best practices. Finally, review and refine the content, acting as a critic, to ensure it meets the highest standards.

User's Request: {{{userPrompt}}}
User's Context (JSON): {{{userContext}}}

Generate distinct content for each of the following platforms. The output MUST be a JSON object with the specified keys:
- 'linkedinPost': Content for a professional LinkedIn post.
- 'xTweet': Content for a concise X (Twitter) tweet.
- 'emailContent': Content for a marketing email.
- 'instagramPost': Content for an Instagram post (including captions and relevant hashtags).
- 'youtubeScript': A short script or outline for a YouTube video.

Ensure the content is engaging, platform-appropriate, and aligns with the user's provided context.`,
});

const snooksGenerateMarketingContentFlow = ai.defineFlow(
  {
    name: 'snooksGenerateMarketingContentFlow',
    inputSchema: SnooksGenerateMarketingContentInputSchema,
    outputSchema: SnooksGenerateMarketingContentOutputSchema,
  },
  async (input) => {
    const { output } = await snooksMarketingPrompt(input);
    return output!;
  }
);
