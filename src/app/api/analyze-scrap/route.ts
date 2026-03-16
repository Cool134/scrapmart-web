import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
// Make sure to have GEMINI_API_KEY in your environment variables, or use a dummy for now
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // TODO: Replace with custom METAL scrap inference endpoint once ready
    // const customResponse = await fetch('https://custom-metal-model.endpoint/predict', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: imageBase64 })
    // });
    // const customData = await customResponse.json();
    
    // TEMPORARY SHIM: Using @google/generative-ai
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      You are an expert AI analyzing a photo of metal scrap. 
      Analyze the provided image and output a JSON response with the following keys:
      - material: (string) The likely material (e.g., Stainless Steel 304, Aluminum, Copper, Brass).
      - condition: (string) The surface condition (e.g., Good, Rusty, Scratched, Clean).
      - estimated_thickness_mm: (number) Estimated thickness in mm.
      - confidence: (number) A value between 0.0 and 1.0 indicating your confidence.
      - description: (string) A short description of the scrap piece.
      
      Output ONLY valid JSON without markdown wrapping.
    `;

    // Strip the "data:image/jpeg;base64," prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting from Gemini response
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Error analyzing scrap:', error);
    // Return a mock response in case the API key is missing or invalid so the UI still works
    return NextResponse.json({
      success: true,
      data: {
        material: "Steel (Mocked)",
        condition: "Rusty",
        estimated_thickness_mm: 5.0,
        confidence: 0.85,
        description: "A rusty piece of steel scrap."
      },
      mocked: true,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
