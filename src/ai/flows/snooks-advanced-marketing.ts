/**
 * Advanced Marketing Flow for Snooks
 * 
 * Multi-platform support with SEO optimization and viral content strategies.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const Platform = z.enum(['linkedin', 'twitter', 'instagram', 'youtube', 'reddit', 'email']);

const AdvancedMarketingInput = z.object({
  topic: z.string().describe('Main topic or work summary to create content from'),
  platform: Platform.describe('Target platform for content'),
  contentType: z.enum(['post', 'thread', 'article', 'carousel', 'script', 'email']).describe('Type of content'),
  tone: z.enum(['professional', 'casual', 'controversial', 'inspirational', 'educational']).optional(),
  keywords: z.array(z.string()).optional().describe('SEO keywords to include'),
  userContext: z.string().optional().describe('User context for personalization'),
});

const AdvancedMarketingOutput = z.object({
  content: z.string().describe('Generated content'),
  metadata: z.object({
    suggestedHashtags: z.array(z.string()),
    suggestedTitle: z.string(),
    bestTimeToPost: z.string(),
    engagementPrediction: z.string(),
    viralScore: z.number().describe('0-100 viral potential score'),
  }),
  alternatives: z.array(z.object({
    variant: z.string(),
    content: z.string(),
  })).optional(),
  platformGuidance: z.object({
    optimalLength: z.string(),
    keyElements: z.array(z.string()),
    avoid: z.array(z.string()),
  }),
});

export async function generateAdvancedMarketing(input: z.infer<typeof AdvancedMarketingInput>) {
  return advancedMarketingFlow(input);
}

// Platform-specific optimization guidance
const platformGuidelines: Record<string, {
  optimalLength: string;
  keyElements: string[];
  avoid: string[];
  bestTimes: string;
}> = {
  linkedin: {
    optimalLength: '1300-1900 characters',
    keyElements: ['Hook in first 2 lines', 'Personal story', '3-5 relevant hashtags', 'Call to action'],
    avoid: ['Excessive hashtags', 'Too promotional', 'Link in first line'],
    bestTimes: 'Tuesday-Thursday 9am-11am',
  },
  twitter: {
    optimalLength: '280 characters (thread up to 12 tweets)',
    keyElements: ['Strong hook', 'Value in first tweet', 'Line breaks', '1-2 hashtags at end'],
    avoid: ['Hashtags in first tweet', 'Blocking threads with no value', 'Too many links'],
    bestTimes: 'Tuesday-Thursday 10am-3pm',
  },
  instagram: {
    optimalLength: '7-10 slides or 1250 characters',
    keyElements: ['Eye-catching first slide', 'Consistent visual style', 'Save CTA', '15-30 hashtags'],
    avoid: ['Too much text per slide', 'Banned hashtags', 'Low quality images'],
    bestTimes: 'Monday-Wednesday 11am-1pm',
  },
  youtube: {
    optimalLength: '8-15 minutes for optimal monetization',
    keyElements: ['Hook in first 10 seconds', 'Clear value proposition', 'Pattern interrupts every 90s', 'Dual CTA at end'],
    avoid: ['Clickbait without delivery', 'No timestamps', 'Missing end screens'],
    bestTimes: 'Saturday-Sunday 2pm-4pm',
  },
  reddit: {
    optimalLength: '150-300 characters for titles, body varies',
    keyElements: ['Specific subreddit', 'Engaging title', 'Provide value', 'Engage in comments'],
    avoid: ['Self-promotion without value', 'Off-topic', 'All caps titles'],
    bestTimes: 'Tuesday-Thursday 10am-12pm',
  },
  email: {
    optimalLength: '50-125 words',
    keyElements: ['Personal subject line', 'Clear CTA', 'Brief value prop', 'Signature'],
    avoid: ['All caps subject', 'Too many links', 'No clear purpose'],
    bestTimes: 'Tuesday-Thursday 10am-11am',
  },
};

const advancedMarketingPrompt = ai.definePrompt({
  name: 'advancedMarketingPrompt',
  input: { schema: AdvancedMarketingInput },
  output: { schema: AdvancedMarketingOutput },
  prompt: `You are Snooks, an expert marketing strategist specializing in viral content creation.

Generate marketing content with these specifics:
- Topic: {{{input.topic}}}
- Platform: {{{input.platform}}}
- Content Type: {{{input.contentType}}}
{{#if input.tone}}
- Tone: {{{input.tone}}}
{{/if}}
{{#if input.keywords}}
- Keywords: {{input.keywords}}
{{/if}}

Platform Guidelines for {{{input.platform}}}:
- Optimal Length: {{platformGuidelines.(input.platform).optimalLength}}
- Key Elements: {{platformGuidelines.(input.platform).keyElements}}
- Avoid: {{platformGuidelines.(input.platform).avoid}}
- Best Posting Time: {{platformGuidelines.(input.platform).bestTimes}}

Generate:
1. Platform-optimized content
2. Suggested hashtags
3. Title (if applicable)
4. Engagement prediction
5. Viral score (0-100)
6. 2 alternative versions
7. Specific guidance for this platform

Make content genuinely valuable and engaging, not generic.`,
});

const advancedMarketingFlow = ai.defineFlow(
  {
    name: 'advancedMarketingFlow',
    inputSchema: AdvancedMarketingInput,
    outputSchema: AdvancedMarketingOutput,
  },
  async (input) => {
    const { output } = await advancedMarketingPrompt({
      ...input,
      platformGuidelines,
    });
    return output!;
  }
);

/**
 * Viral Optimization Flow
 * 
 * Analyzes and optimizes content for maximum viral potential.
 */

const ViralOptimizationInput = z.object({
  content: z.string(),
  platform: Platform,
  goal: z.enum(['views', 'engagement', 'shares', 'followers']),
});

const ViralOptimizationOutput = z.object({
  score: z.number(),
  improvements: z.array(z.object({
    change: z.string(),
    impact: z.number().describe('Expected impact on engagement'),
    implementation: z.string(),
  })),
  predictedEngagement: z.string(),
});

export async function optimizeForVirality(input: ViralOptimizationInput) {
  return viralOptimizationFlow(input);
}

const viralOptimizationPrompt = ai.definePrompt({
  name: 'viralOptimizationPrompt',
  input: { schema: ViralOptimizationInput },
  output: { schema: ViralOptimizationOutput },
  prompt: `Analyze this content for viral potential on {{{input.platform}}}:

Content: {{{input.content}}}
Goal: {{{input.goal}}}

Evaluate and provide:
1. Current viral score (0-100)
2. 3-5 specific improvements with expected impact
3. Predicted engagement level

Focus on: hooks, emotional triggers, specificity, timing, format.`,
});

const viralOptimizationFlow = ai.defineFlow(
  {
    name: 'viralOptimizationFlow',
    inputSchema: ViralOptimizationInput,
    outputSchema: ViralOptimizationOutput,
  },
  async (input) => {
    const { output } = await viralOptimizationPrompt(input);
    return output!;
  }
);
