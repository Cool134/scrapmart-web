import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysisResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

export const analyzeScrapImage = async (base64Image: string, mimeType: string): Promise<AIAnalysisResult> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
  const prompt = `You are analyzing a metal scrap piece image for a marketplace listing.
  Estimate the following and return JSON only:
  {
   "material": "steel|aluminum|copper|iron|brass|unknown",
   "thickness_mm": number,
   "width_cm": number,
   "height_cm": number,
   "surface_area_cm2": number,
   "estimated_weight_kg": number (use material density),
   "suggested_price_usd": number (use scrap market rates),
   "outline_points": [[x,y], ...] (normalized 0-1 coordinates of scrap contour, minimum 8 points),
   "surface_condition": "clean|rusty|painted|mixed",
   "confidence": number between 0 and 1,
   "description": "brief professional listing description"
  }`;

  const imageParts = [
    {
      inlineData: {
        data: base64Image,
        mimeType
      },
    },
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("AI Analysis failed");
  }
};
