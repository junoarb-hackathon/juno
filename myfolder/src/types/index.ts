import type { AnalyzeLegalStrategyOutput } from "@/ai/flows/analyze-legal-strategy";
import type { PredictOpponentStrategyOutput } from "@/ai/flows/predict-opponent-strategy";

export type CaseLaw = {
  caseName: string;
  relevance: string;
};

export type LegalAnalysis = AnalyzeLegalStrategyOutput;

export type OpponentPrediction = PredictOpponentStrategyOutput;

export type FullAnalysis = {
  legalAnalysis: LegalAnalysis;
  opponentPrediction: OpponentPrediction;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'loading';
  content: string | FullAnalysis;
  relevantCaseLaws?: CaseLaw[];
};
