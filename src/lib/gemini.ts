import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysisResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "dummy");

export const analyzeScrapImage = async (base64Image: string, mimeType: string): Promise<AIAnalysisResult> => {
  if (!base64Image) {
    throw new Error("No image data provided to AI.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
  const prompt = `You are an expert industrial metallurgist and AI estimator analyzing a metal scrap piece image (manufacturing offset) for a B2B marketplace listing.
  
  Please analyze the image and estimate the physical properties of the main metal piece. 
  
  Return ONLY a raw JSON object with NO markdown formatting, NO code blocks, and NO extra text. The JSON must strictly adhere to the following schema:
  {
   "material": "steel" | "aluminum" | "copper" | "iron" | "brass" | "unknown",
   "thickness_mm": <number>,
   "width_cm": <number>,
   "height_cm": <number>,
   "surface_area_cm2": <number>,
   "estimated_weight_kg": <number> (calculated using standard density of the detected material),
   "suggested_price_inr": <number> (calculated using current average scrap/offset market rates),
   "outline_points": [[x,y], [x,y], ...] (Array of coordinate pairs. These must be normalized 0-1 coordinates mapping the exact contour/polygon of the scrap piece in the image. Provide a minimum of 8 points.),
   "surface_condition": "clean" | "rusty" | "painted" | "mixed",
   "confidence": <number> (between 0.0 and 1.0 representing your confidence in this assessment),
   "description": "<string>" (A brief, professional 2-3 sentence description suitable for a marketplace listing)
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
    const response = result.response;
    let text = response.text();
    
    // Aggressive JSON extraction to handle Gemini edge cases
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find the first '{' and last '}' just in case there's surrounding text
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
       throw new Error("AI returned invalid response format.");
    }
    
    const jsonString = text.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(jsonString) as AIAnalysisResult;
    
    // Basic validation of required nested fields
    if (!parsedData.material || !parsedData.outline_points) {
      throw new Error("AI response missing critical fields.");
    }

    return parsedData;

  } catch (error) {
    console.error("Gemini AI Error:", error);
    
    // Fallback object to prevent complete UI crash if API fails/hallucinates
    // This is crucial for a robust MVP
    return {
      material: "unknown",
      thickness_mm: 0,
      width_cm: 0,
      height_cm: 0,
      surface_area_cm2: 0,
      estimated_weight_kg: 0,
      suggested_price_inr: 0,
      outline_points: [[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]], // Default bounding box
      surface_condition: "mixed",
      confidence: 0,
      description: "AI analysis failed to process this image automatically. Please verify manual details."
    };
  }
};
