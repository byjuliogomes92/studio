// AccessibilityChecker flow
'use server';

/**
 * @fileOverview An accessibility checker AI agent.
 *
 * - accessibilityCheck - A function that handles the accessibility check process.
 * - AccessibilityCheckInput - The input type for the accessibilityCheck function.
 * - AccessibilityCheckOutput - The return type for the accessibilityCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccessibilityCheckInputSchema = z.object({
  htmlCode: z
    .string()
    .describe('The HTML code to check for accessibility issues.'),
});
export type AccessibilityCheckInput = z.infer<typeof AccessibilityCheckInputSchema>;

const AccessibilityCheckOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of suggestions for improving the accessibility of the HTML code based on WCAG guidelines.'
    ),
});
export type AccessibilityCheckOutput = z.infer<typeof AccessibilityCheckOutputSchema>;

export async function accessibilityCheck(input: AccessibilityCheckInput): Promise<AccessibilityCheckOutput> {
  return accessibilityCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accessibilityCheckPrompt',
  input: {schema: AccessibilityCheckInputSchema},
  output: {schema: AccessibilityCheckOutputSchema},
  prompt: `You are an accessibility expert. Analyze the following HTML code and provide suggestions for improving its accessibility based on WCAG guidelines.\n\nHTML code:\n{{{htmlCode}}}`,
});

const accessibilityCheckFlow = ai.defineFlow(
  {
    name: 'accessibilityCheckFlow',
    inputSchema: AccessibilityCheckInputSchema,
    outputSchema: AccessibilityCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
