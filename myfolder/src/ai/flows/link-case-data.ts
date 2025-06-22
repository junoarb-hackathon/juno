'use server';

/**
 * @fileOverview This file defines a Genkit flow for linking legal arguments to relevant cases in a database and suggesting citations.
 *
 * - linkCaseData - A function that takes legal arguments and case information as input, and returns suggested case citations.
 * - LinkCaseDataInput - The input type for the linkCaseData function.
 * - LinkCaseDataOutput - The return type for the linkCaseData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LinkCaseDataInputSchema = z.object({
  legalArguments: z
    .string()
    .describe('The legal arguments for which to find supporting cases.'),
  caseDatabase: z
    .string()
    .describe('The linked case database to search for relevant cases.'),
});
export type LinkCaseDataInput = z.infer<typeof LinkCaseDataInputSchema>;

const LinkCaseDataOutputSchema = z.object({
  suggestedCitations: z
    .array(z.string())
    .describe('Suggested case citations to support the legal arguments.'),
  reasoning: z
    .string()
    .describe('Explanation of why these cases are relevant.'),
});
export type LinkCaseDataOutput = z.infer<typeof LinkCaseDataOutputSchema>;

export async function linkCaseData(input: LinkCaseDataInput): Promise<LinkCaseDataOutput> {
  return linkCaseDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'linkCaseDataPrompt',
  input: {schema: LinkCaseDataInputSchema},
  output: {schema: LinkCaseDataOutputSchema},
  prompt: `You are an expert legal assistant. You will analyze the provided legal arguments and search the case database for relevant cases that support these arguments. Provide a list of suggested case citations and explain why these cases are relevant.\n\nLegal Arguments: {{{legalArguments}}}\n\nCase Database: {{{caseDatabase}}}`,
});

const linkCaseDataFlow = ai.defineFlow(
  {
    name: 'linkCaseDataFlow',
    inputSchema: LinkCaseDataInputSchema,
    outputSchema: LinkCaseDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
