'use server';

import { analyzeLegalStrategy } from '@/ai/flows/analyze-legal-strategy';
import { predictOpponentStrategy } from '@/ai/flows/predict-opponent-strategy';
import type { FullAnalysis } from '@/types';

export async function getAnalysis(strategy: string): Promise<FullAnalysis | { error: string }> {
  if (!strategy || strategy.trim().length === 0) {
    return { error: "Legal strategy cannot be empty." };
  }

  try {
    const [analysisResult, opponentPredictionResult] = await Promise.all([
      analyzeLegalStrategy({ legalStrategy: strategy }),
      predictOpponentStrategy({ legalStrategy: strategy }),
    ]);

    if (!analysisResult || !analysisResult.strengths) {
      return { error: "Received an invalid response from the analysis service." };
    }

    if (!opponentPredictionResult) {
      return { error: "Received an invalid response from the prediction service." };
    }

    return {
      legalAnalysis: analysisResult,
      opponentPrediction: opponentPredictionResult,
    };

  } catch (e) {
    console.error("Error in getAnalysis:", e);
    if (e instanceof Error) {
      return { error: `An unexpected error occurred: ${e.message}` };
    }
    return { error: 'An unknown error occurred.' };
  }
}
