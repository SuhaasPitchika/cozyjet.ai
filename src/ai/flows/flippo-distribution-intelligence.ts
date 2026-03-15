
'use server';
/**
 * @fileOverview FLIPPO Distribution Intelligence Agent.
 * Handles optimal posting times and distribution strategy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DistributionInputSchema = z.object({
  userId: z.string(),
  platform: z.string(),
  historicalPerformance: z.string().describe('JSON string of past post metrics.'),
});

const OptimalTimesSchema = z.object({
  recommendations: z.array(z.object({
    time: z.string(),
    reason: z.string(),
    confidence: z.number(),
  })),
  strategy: z.string().describe('A/B testing or exploration recommendation.'),
});

export async function flippoGetOptimalTimes(input: z.infer<typeof DistributionInputSchema>) {
  return flippoDistributionFlow(input);
}

const flippoDistributionPrompt = ai.definePrompt({
  name: 'flippoDistributionPrompt',
  input: { schema: DistributionInputSchema },
  output: { schema: OptimalTimesSchema },
  prompt: `You are FLIPPO, the Distribution & Productivity Agent. 
Analyze the historical performance data for {{{platform}}} and recommend the 3 best times to post.

Use an Upper Confidence Bound (UCB) logic:
- Prioritize hours with high engagement rates.
- Suggest "exploration" hours that haven't been tried frequently but might perform well.

Data:
{{{historicalPerformance}}}`,
});

const flippoDistributionFlow = ai.defineFlow(
  {
    name: 'flippoDistributionFlow',
    inputSchema: DistributionInputSchema,
    outputSchema: OptimalTimesSchema,
  },
  async (input) => {
    const { output } = await flippoDistributionPrompt(input);
    return output!;
  }
);
