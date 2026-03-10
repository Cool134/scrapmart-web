import { analyzeScrapImage } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image, mimeType } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    
    const base64Data = image.split(',')[1] || image;
    
    const result = await analyzeScrapImage(base64Data, mimeType || 'image/jpeg');
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
