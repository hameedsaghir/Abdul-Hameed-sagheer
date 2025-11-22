import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const rewriteDocumentContent = async (
  originalText: string, 
  userPrompt: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert document editor and writer.
      
      Task: Rewrite the following article/text based strictly on the user's modification instructions.
      
      Input Text (from Word Document):
      """
      ${originalText}
      """
      
      User Instructions (Modification Request):
      "${userPrompt}"
      
      Output Requirements:
      1. Return ONLY the full modified text. 
      2. Do not include any conversational filler ("Here is the modified text", "Sure", etc.).
      3. Maintain the original formatting structure (paragraphs) where possible by using double newlines.
      4. Ensure the tone matches the user's request or defaults to professional if not specified.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated from Gemini.");
    
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};