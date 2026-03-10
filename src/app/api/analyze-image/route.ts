import { analyzeScrapImage } from "@/lib/gemini";
import { NextResponse } from "next/server";

// Ensure this route runs optimally
export const maxDuration = 60; // 60 seconds max duration for Vercel Hobby tier

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body || !body.image) {
      return NextResponse.json(
        { error: "No image data provided in the request body." },
        { status: 400 }
      );
    }
    
    // Strip the data URL prefix if present (e.g., "data:image/jpeg;base64,...")
    let base64Data = body.image;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }
    
    const mimeType = body.mimeType || 'image/jpeg';
    
    // Log for debugging
    console.log(`Starting AI analysis for image of type: ${mimeType}`);
    
    const result = await analyzeScrapImage(base64Data, mimeType);
    
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("API Route /api/analyze-image Error:", error);
    
    // Return a structured error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during AI analysis.";
    
    return NextResponse.json(
      { 
        error: "AI Analysis failed", 
        details: errorMessage 
      }, 
      { status: 500 }
    );
  }
}
