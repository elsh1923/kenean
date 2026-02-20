import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in .env. Geez translation will be disabled.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function translateToGeez(text: string): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API is not configured. Please add GEMINI_API_KEY to your .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Translate the following text into the Geez language (Classical Ethiopic). 
  Provide only the translated text, no further explanation or transliteration.
  
  Text: "${text}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw new Error("Failed to translate text to Geez. The divine message was interrupted.");
  }
}
