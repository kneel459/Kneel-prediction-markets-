import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MarketAnalysis {
  prediction: "Bullish" | "Bearish" | "Neutral";
  confidence: number;
  reasoning: string;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  sentiment: string;
}

export async function analyzeMarket(coin: string, priceData: any[]): Promise<MarketAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-latest",
      contents: `Analyze the following price data for ${coin} and provide a market prediction. 
      Data: ${JSON.stringify(priceData.slice(-20))}
      Return the response in JSON format with the following structure:
      {
        "prediction": "Bullish" | "Bearish" | "Neutral",
        "confidence": number (0-100),
        "reasoning": "string",
        "keyLevels": { "support": [number], "resistance": [number] },
        "sentiment": "string"
      }`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      prediction: "Neutral",
      confidence: 0,
      reasoning: "Analysis unavailable at the moment.",
      keyLevels: { support: [], resistance: [] },
      sentiment: "Unknown",
    };
  }
}
