import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const base64Data = image.split(',')[1];
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `You are analyzing a metal scrap piece image for a marketplace listing.
    Estimate the following and return JSON only:
    {
     "material": "steel|aluminum|copper|iron|brass|unknown",
     "thickness_mm": 0,
     "width_cm": 0,
     "height_cm": 0,
     "surface_area_cm2": 0,
     "estimated_weight_kg": 0,
     "suggested_price_usd": 0,
     "outline_points": [[0.1,0.1], [0.9,0.1], [0.9,0.9], [0.1,0.9]],
     "surface_condition": "clean|rusty|painted|mixed",
     "confidence": 0.95,
     "description": "brief professional listing description"
    }`;
    
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);
    
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "AI Analysis failed" }, { status: 500 });
  }
}
