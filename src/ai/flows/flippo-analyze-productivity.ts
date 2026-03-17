
/**
 * @fileOverview This file implements a Genkit flow for the Flippo AI agent to analyze
 * summarized work activity, generate a structured productivity timeline, and
 * calculate a deep work score.
 *
 * - flippoAnalyzeProductivity - The main function to analyze work activity.
 * - FlippoAnalyzeProductivityInput - The input type for the analysis.
 * - FlippoAnalyzeProductivityOutput - The output type for the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WorkActivitySummarySchema = z.object({
  startTime: z
    .string()
    .describe('The start time of the activity in HH:MM format.'),
  endTime: z
    .string()
    .describe('The end time of the activity in HH:MM format.'),
  description: z.string().describe('A brief description of the work activity.'),
});

const FlippoAnalyzeProductivityInputSchema = z.object({
  activitySummaries: z
    .array(WorkActivitySummarySchema)
    .describe(
      'An array of summarized work activities, each with start time, end time, and description.'
    ),
});
export type FlippoAnalyzeProductivityInput = z.infer<
  typeof FlippoAnalyzeProductivityInputSchema
>;

const TimelineEventSchema = z.object({
  timestamp: z.string().describe('The time of the event in HH:MM format.'),
  description: z.string().describe('A description of the event.'),
  durationMinutes: z.number().describe('The duration of the event in minutes.'),
  type: z
    .enum(['deep_work', 'distraction', 'other'])
    .describe('The type of work event: deep_work, distraction, or other.'),
});

const FlippoAnalyzeProductivityOutputSchema = z.object({
  timeline: z
    .array(TimelineEventSchema)
    .describe('A structured timeline of productivity events.'),
  deepWorkScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'A score from 0 to 100 indicating the quality and quantity of deep work.'
    ),
  productivityInsights: z
    .string()
    .describe("Textual insights into the user's productivity patterns."),
});
export type FlippoAnalyzeProductivityOutput = z.infer<
  typeof FlippoAnalyzeProductivityOutputSchema
>;

export async function flippoAnalyzeProductivity(
  input: FlippoAnalyzeProductivityInput
): Promise<FlippoAnalyzeProductivityOutput> {
  return flippoAnalyzeProductivityFlow(input);
}

const flippoAnalyzeProductivityPrompt = ai.definePrompt({
  name: 'flippoAnalyzeProductivityPrompt',
  input: { schema: FlippoAnalyzeProductivityInputSchema },
  output: { schema: FlippoAnalyzeProductivityOutputSchema },
  prompt: `You are Flippo, an AI productivity brain. Your task is to analyze the provided work activity summaries and generate a structured productivity timeline along with a deep work score and insights.

**Input Data**: You will receive an array of daily activity summaries. Each summary object will contain 'startTime', 'endTime', and 'description'. These summaries represent segments of the user's workday.

**Activity Summaries**:
{{#each activitySummaries}}
- From {{this.startTime}} to {{this.endTime}}: {{this.description}}
{{/each}}

**Deep Work Definition**:
*   A 'deep work' session is defined as a contiguous block of activity lasting **more than 25 minutes** where the user was focused on a single task or closely related tasks.
*   'Distraction' is indicated by a session break (gap between activities) lasting **less than 2 minutes** between activities, or an activity itself lasting a very short period (e.g., less than 5 minutes) that seems unrelated to prior or subsequent focused work. Activities that are neither deep work nor clear distractions can be labeled as 'other'.

**Your Goal**:
1.  **Generate a Detailed Timeline**: Create a chronological list of events from the activity summaries. For each event, determine its 'type' (deep_work, distraction, or other) based on the definitions above, calculate its 'durationMinutes', and provide a 'description'.
2.  **Calculate Deep Work Score**: Based on the timeline, calculate a 'deepWorkScore' from 0 to 100. A higher score indicates more sustained deep work periods and fewer distractions. The score should reflect the proportion and quality of deep work blocks relative to total active time.
3.  **Provide Productivity Insights**: Offer a concise summary of the user's productivity patterns based on the timeline and score. Highlight strengths and suggest areas for improvement.

Ensure the output is valid JSON matching the provided Output Schema.
`,
});

const flippoAnalyzeProductivityFlow = ai.defineFlow(
  {
    name: 'flippoAnalyzeProductivityFlow',
    inputSchema: FlippoAnalyzeProductivityInputSchema,
    outputSchema: FlippoAnalyzeProductivityOutputSchema,
  },
  async (input) => {
    const { output } = await flippoAnalyzeProductivityPrompt(input);
    if (!output) {
      throw new Error('Flippo could not analyze productivity.');
    }
    return output;
  }
);
