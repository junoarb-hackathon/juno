'use server';

/**
 * @fileOverview A legal strategy analysis AI agent.
 *
 * - analyzeLegalStrategy - A function that handles the legal strategy analysis process.
 * - AnalyzeLegalStrategyInput - The input type for the analyzeLegalStrategy function.
 * - AnalyzeLegalStrategyOutput - The return type for the analyzeLegalStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLegalStrategyInputSchema = z.object({
  legalStrategy: z
    .string()
    .describe('The legal strategy to analyze, including case information.'),
});
export type AnalyzeLegalStrategyInput = z.infer<typeof AnalyzeLegalStrategyInputSchema>;

const RelevantCaseLawSchema = z.object({
  caseName: z.string().describe("The full name or citation of the case law."),
  relevance: z.string().describe("A brief explanation of why this case is relevant to the provided legal strategy."),
});

const AnalyzeLegalStrategyOutputSchema = z.object({
  typeOfArbitration: z.string().describe("The type of arbitration (e.g., Commercial, Investment Treaty)."),
  damagesClaimed: z.string().describe("The amount and currency of damages claimed."),
  parties: z.array(z.string()).describe("The names of the parties involved in the arbitration."),
  seatOfArbitration: z.string().describe("The legal place or seat of the arbitration."),
  applicableLaws: z.array(z.string()).describe("The laws applicable to the substance of the dispute."),
  statementOfFacts: z.string().describe("A neutral summary of the key facts of the case."),
  numberOfExpertWitnesses: z.number().describe("The number of expert witnesses involved."),
  contentions: z.string().describe("The main contentions or arguments of the case."),
  weaknesses: z.string().describe("Weaknesses in the provided legal argument or case position."),
  strengths: z.string().describe("Strengths in the provided legal argument or case position."),
  relevantCaseLaws: z.array(RelevantCaseLawSchema).describe("List of relevant case laws with brief explanations of their relevance."),
  summaryOfArguments: z.string().describe("A concise summary of the overall legal arguments."),
  finalCautions: z.string().describe("Final cautions or potential risks to be aware of."),
});
export type AnalyzeLegalStrategyOutput = z.infer<typeof AnalyzeLegalStrategyOutputSchema>;

export async function analyzeLegalStrategy(input: AnalyzeLegalStrategyInput): Promise<AnalyzeLegalStrategyOutput> {
  return analyzeLegalStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLegalStrategyPrompt',
  input: {schema: AnalyzeLegalStrategyInputSchema},
  output: {schema: AnalyzeLegalStrategyOutputSchema},
  prompt: `You are a seasoned legal expert specializing in arbitration. Analyze the provided legal strategy and case information. Structure your response in the following JSON format:

- typeOfArbitration: The type of arbitration (e.g., Commercial, Investment Treaty).
- damagesClaimed: The amount and currency of damages claimed.
- parties: The names of the parties involved.
- seatOfArbitration: The legal place or seat of the arbitration.
- applicableLaws: The laws applicable to the substance of the dispute.
- statementOfFacts: A neutral summary of the key facts of the case.
- numberOfExpertWitnesses: The number of expert witnesses involved.
- contentions: The main contentions or arguments of the case.
- weaknesses: Weaknesses in the provided legal argument or case position.
- strengths: Strengths in the provided legal argument or case position.
- relevantCaseLaws: An array of objects. This is very important. For each object, provide a 'caseName' and a 'relevance' property explaining why the case is relevant.
- summaryOfArguments: A concise summary of the overall legal arguments.
- finalCautions: Final cautions or potential risks to be aware of.

Legal Strategy and Case Information: {{{legalStrategy}}}

Ensure your output is a valid JSON object matching the defined schema.
`,
});

const analyzeLegalStrategyFlow = ai.defineFlow(
  {
    name: 'analyzeLegalStrategyFlow',
    inputSchema: AnalyzeLegalStrategyInputSchema,
    outputSchema: AnalyzeLegalStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
