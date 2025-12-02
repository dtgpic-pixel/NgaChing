import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

export const generateLuxuryGreeting = async (): Promise<string> => {
  if (!apiKey) {
    return "Wishing you a prosperous and magnificent holiday season.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, extremely luxurious, "Trump-style" Christmas greeting. 
      Use words like "Tremendous", "Gold", "Magnificent", "Best", "Winner". 
      Keep it under 30 words. It should feel expensive and high-status.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Have a tremendous holiday!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A truly magnificent holiday to you and yours.";
  }
};
