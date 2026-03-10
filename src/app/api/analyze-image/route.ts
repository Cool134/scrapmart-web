import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const base64Data = image.split(',')[1];
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `Analyze this metal scrap offset. Return ONLY a raw JSON object with NO markdown or code blocks. Keys: "materialType" (string), "thickness" (string), "dimensions" (string), "price" (number), "shape" (string).`;
    
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
