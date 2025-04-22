import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { AI } from "./ai";

export class Gemini implements AI {
  private client: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey: apiKey });
  }

  async getResponse(prompt: string): Promise<string> {
    const response = await this.client.models.generateContent({ 
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt
    });

    if (!response.text) {
        throw new Error("Invalid response from Gemini API");
    }
    return response.text.trim();
  }

  async getImgResponse(prompt: string, imgPath: string): Promise<string> {
    const imgFile = await this.client.files.upload({ 
        file: imgPath,
        config: { mimeType: "image/jpeg"}
    });
    const response = await this.client.models.generateContent({ 
        model: "gemini-2.5-flash-preview-04-17",
        contents: createUserContent([
          createPartFromUri(imgFile.uri??'', imgFile.mimeType??''),
          prompt
        ])
    });

    if (!response.text) {
      throw new Error("Invalid response from Gemini API");
    }
    return response.text.trim();
  }
}