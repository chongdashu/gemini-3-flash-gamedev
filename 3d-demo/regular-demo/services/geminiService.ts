
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getWaveMessage(wave: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just started wave ${wave} in a snowman defense game. Give a very short (max 10 words) encouraging or thematic message. Examples: "The blizzard thickens!", "Keep your cool, Frosty!", "An icy horde approaches!"`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 20,
      }
    });
    return response.text?.trim() || `Wave ${wave} Started!`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Wave ${wave} Started!`;
  }
}
