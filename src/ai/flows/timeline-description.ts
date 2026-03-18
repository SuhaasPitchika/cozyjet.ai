"use client";

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * Timeline Description Generator
 * 
 * Generates contextual, emotional descriptions of accomplishments
 * rather than generic time-based summaries.
 */

const TimelineDescriptionInput = z.object({
  workEvents: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    app: z.string(),
    description: z.string(),
    type: z.enum(['deep_work', 'meeting', 'break', 'communication', 'research']),
  })).describe('Array of work events to analyze'),
  focusScore: z.number().describe('Overall focus score 0-100'),
});

const TimelineDescriptionOutput = z.object({
  headline: z.string().describe('One-line headline summarizing the session'),
  emotionalSummary: z.string().describe('2-3 sentence emotional summary'),
  keyAccomplishments: z.array(z.object({
    title: z.string(),
    description: z.string(),
    impact: z.string(),
  })).describe('List of key accomplishments with context'),
  flowQuality: z.enum(['excellent', 'good', 'moderate', 'poor']),
  suggestions: z.array(z.string()).describe('Actionable suggestions for improvement'),
});

export async function generateTimelineDescription(input: TimelineDescriptionInput) {
  return timelineDescriptionFlow(input);
}

const timelineDescriptionPrompt = ai.definePrompt({
  name: 'timelineDescriptionPrompt',
  input: { schema: TimelineDescriptionInput },
  output: { schema: TimelineDescriptionOutput },
  prompt: `You're creating a meaningful timeline description for a productivity app. Transform raw activity data into an emotional, contextual narrative.

Work Events:
{{#each input.workEvents}}
- {{startTime}} - {{endTime}}: {{app}} - {{description}} ({{type}})
{{/each}}

Focus Score: {{input.focusScore}}/100

Generate:
1. A compelling headline (not "3 hours of work")
2. 2-3 sentence summary that captures the feeling of the work
3. Key accomplishments with real context (e.g., "Built the login component" not just "Coding")
4. Flow quality assessment
5. 1-3 specific suggestions

Make it feel human and motivating, not robotic.`,
});

const timelineDescriptionFlow = ai.defineFlow(
  {
    name: 'timelineDescriptionFlow',
    inputSchema: TimelineDescriptionInput,
    outputSchema: TimelineDescriptionOutput,
  },
  async (input) => {
    const { output } = await timelineDescriptionPrompt(input);
    return output!;
  }
);

/**
 * Productivity Score Calculator
 * 
 * Calculates focus scores based on activity patterns.
 */

const ProductivityScoreInput = z.object({
  activities: z.array(z.object({
    app: z.string(),
    duration: z.number(), // in minutes
    contextSwitches: z.number(),
    flowState: z.boolean(),
  })),
});

const ProductivityScoreOutput = z.object({
  score: z.number().describe('Overall productivity score 0-100'),
  breakdown: z.object({
    focusTime: z.number(),
    distractionTime: z.number(),
    contextSwitches: z.number(),
    deepWorkRatio: z.number(),
  }),
  insights: z.array(z.string()),
});

export async function calculateProductivityScore(input: ProductivityScoreInput) {
  return productivityScoreFlow(input);
}

const productivityScorePrompt = ai.definePrompt({
  name: 'productivityScorePrompt',
  input: { schema: ProductivityScoreInput },
  output: { schema: ProductivityScoreOutput },
  prompt: `Calculate productivity score based on work activities.

Activities:
{{#each input.activities}}
- {{app}}: {{duration}}min, {{contextSwitches}} switches, flow: {{flowState}}
{{/each}}

Calculate:
1. Overall score (0-100) considering:
   - Ratio of focused vs distracted time
   - Number of context switches
   - Deep work ratio
2. Breakdown of time spent
3. 2-3 insight items

Be analytical but fair - don't penalize reasonable work patterns.`,
});

const productivityScoreFlow = ai.defineFlow(
  {
    name: 'productivityScoreFlow',
    inputSchema: ProductivityScoreInput,
    outputSchema: ProductivityScoreOutput,
  },
  async (input) => {
    const { output } = await productivityScorePrompt(input);
    return output!;
  }
);
