'use server';

/**
 * @fileOverview Predicts an opponent's legal strategy.
 *
 * - predictOpponentStrategy - A function that predicts counter-arguments and tactics.
 * - PredictOpponentStrategyInput - The input type for the predictOpponentStrategy function.
 * - PredictOpponentStrategyOutput - The return type for the predictOpponentStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictOpponentStrategyInputSchema = z.object({
  legalStrategy: z
    .string()
    .describe("The user's legal strategy to be analyzed from an opponent's perspective."),
});
export type PredictOpponentStrategyInput = z.infer<typeof PredictOpponentStrategyInputSchema>;

const OpponentCaseLawSchema = z.object({
    caseName: z.string().describe("The full name or citation of the case law the opponent might use."),
    relevance: z.string().describe("A brief explanation of why the opponent would find this case relevant."),
});

const PredictOpponentStrategyOutputSchema = z.object({
  predictedCounterArguments: z.string().describe("The likely counter-arguments the opponent will raise."),
  potentialTactics: z.string().describe("Potential procedural or strategic tactics the opponent might employ."),
  keyCaseLawForOpponent: z.array(OpponentCaseLawSchema).describe("Key case laws the opponent is likely to rely on, with explanations."),
  overallOpponentStrategy: z.string().describe("A summary of the opponent's most probable overall strategy."),
});
export type PredictOpponentStrategyOutput = z.infer<typeof PredictOpponentStrategyOutputSchema>;

export async function predictOpponentStrategy(input: PredictOpponentStrategyInput): Promise<PredictOpponentStrategyOutput> {
  return predictOpponentStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictOpponentStrategyPrompt',
  input: {schema: PredictOpponentStrategyInputSchema},
  output: {schema: PredictOpponentStrategyOutputSchema},
  prompt: `You are an expert legal strategist playing the role of opposing counsel. You have been given your opponent's (the user's) legal strategy. Your task is to analyze it from a critical perspective and predict the counter-strategy you would employ.

Analyze the following legal strategy: {{{legalStrategy}}}

Structure your prediction in a valid JSON object with the following fields:
- predictedCounterArguments: What are the main arguments you would use to counter their position?
- potentialTactics: What procedural or strategic tactics would you use (e.g., motions, discovery requests, settlement approaches)?
- keyCaseLawForOpponent: What key case laws would you cite to support your counter-arguments? Provide the case name and its relevance.
- overallOpponentStrategy: Summarize your overall strategic approach to defeating the user's case.
`,
});

const predictOpponentStrategyFlow = ai.defineFlow(
  {
    name: 'predictOpponentStrategyFlow',
    inputSchema: PredictOpponentStrategyInputSchema,
    outputSchema: PredictOpponentStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
