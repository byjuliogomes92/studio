// TextGenerator flow
'use server';

/**
 * @fileOverview A text generator AI agent for creating marketing copy.
 *
 * - generateText - A function that handles the text generation process.
 * - TextGeneratorInput - The input type for the generateText function.
 * - TextGeneratorOutput - The return type for the generateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TextGeneratorInputSchema = z.object({
  prompt: z.string().describe('The user\'s instruction for the text to be generated.'),
  componentType: z.string().describe('The type of component the text is for (e.g., "Title", "Paragraph", "Button").'),
  context: z.string().optional().describe('Any existing text in the component to provide context.'),
});
export type TextGeneratorInput = z.infer<typeof TextGeneratorInputSchema>;

const TextGeneratorOutputSchema = z.object({
  suggestion: z.string().describe('The generated text suggestion.'),
});
export type TextGeneratorOutput = z.infer<typeof TextGeneratorOutputSchema>;

export async function generateText(input: TextGeneratorInput): Promise<TextGeneratorOutput> {
  return textGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textGeneratorPrompt',
  input: { schema: TextGeneratorInputSchema },
  output: { schema: TextGeneratorOutputSchema },
  prompt: `
    You are an expert marketing copywriter. Your task is to generate a compelling and concise text for a web page component.

    Component Type: {{componentType}}
    User Instruction: {{{prompt}}}
    {{#if context}}
    Existing Text (for context): {{{context}}}
    {{/if}}

    Based on the instruction, generate a new text suggestion.
    - For a "Title" or "Subtitle", make it catchy and impactful.
    - For a "Paragraph", make it informative and engaging.
    - For a "Button", make it a clear and concise call-to-action.
    - Do not include markdown or HTML tags in your response.
    - Your response should only be the generated text.
  `,
});

const textGeneratorFlow = ai.defineFlow(
  {
    name: 'textGeneratorFlow',
    inputSchema: TextGeneratorInputSchema,
    outputSchema: TextGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
