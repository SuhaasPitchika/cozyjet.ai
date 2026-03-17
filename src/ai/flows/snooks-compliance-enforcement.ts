

/**
 * @fileOverview SNOOKS Compliance Enforcement Agent.
 * Executes the 7 safety checks for content publishing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComplianceInputSchema = z.object({
  content: z.string(),
  platform: z.string(),
  exclusionList: z.array(z.string()),
});

const CheckResultSchema = z.object({
  status: z.enum(['passed', 'warning', 'failed']),
  message: z.string(),
  details: z.string().optional(),
});

const ComplianceReportSchema = z.object({
  piiCheck: CheckResultSchema,
  linkSafety: CheckResultSchema,
  sentimentAnalysis: CheckResultSchema,
  plagiarism: CheckResultSchema,
  platformPolicy: CheckResultSchema,
  clientConfidentiality: CheckResultSchema,
  careerRisk: CheckResultSchema,
  overallStatus: z.enum(['passed', 'warning', 'failed']),
});

export async function snooksComplianceCheck(input: z.infer<typeof ComplianceInputSchema>) {
  return snooksComplianceFlow(input);
}

const snooksCompliancePrompt = ai.definePrompt({
  name: 'snooksCompliancePrompt',
  input: { schema: ComplianceInputSchema },
  output: { schema: ComplianceReportSchema },
  prompt: `You are SNOOKS, the Compliance Enforcement Agent. Act as the system's immune system.
Perform 7 parallel checks on the provided content for {{{platform}}}.

CHECKS:
1. PII Detection: Look for SSNs, phones, emails, etc.
2. Link Safety: Assume all URLs must be verified (simulate Safe Browsing).
3. Sentiment: Flag aggressive or out-of-character language.
4. Plagiarism: Check for excessive similarity to viral tropes.
5. Platform Policy: Ensure disclosure for sponsored content or links.
6. Client Confidentiality: Check exclusion list: {{#each exclusionList}} "{{this}}" {{/each}}.
7. Career Risk: Score the likelihood of professional backlash (0.0 to 1.0).

Content:
{{{content}}}`,
});

const snooksComplianceFlow = ai.defineFlow(
  {
    name: 'snooksComplianceFlow',
    inputSchema: ComplianceInputSchema,
    outputSchema: ComplianceReportSchema,
  },
  async (input) => {
    const { output } = await snooksCompliancePrompt(input);
    return output!;
  }
);
