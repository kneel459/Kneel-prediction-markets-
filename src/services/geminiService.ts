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

export interface PriceForecast {
  targetDate: string;
  predictedPrice: number;
  expectedRange: { min: number; max: number };
  reasoning: string;
  riskLevel: "Low" | "Medium" | "High";
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

export async function forecastPrice(coin: string, priceData: any[], targetDate: string): Promise<PriceForecast> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Based on the following historical price data for ${coin}, forecast the daily candle close for ${targetDate}.
      Current Date: ${new Date().toISOString().split('T')[0]}
      Historical Data (last 50 points): ${JSON.stringify(priceData.slice(-50))}
      
      Return the response in JSON format with the following structure:
      {
        "targetDate": "${targetDate}",
        "predictedPrice": number,
        "expectedRange": { "min": number, "max": number },
        "reasoning": "string",
        "riskLevel": "Low" | "Medium" | "High"
      }`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Price forecast failed:", error);
    throw error;
  }
}
