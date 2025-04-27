import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { AI } from "./ai";

/**
 * Implementation of the AI interface using Google's Gemini model
 * Uses Gemini 2.5 Flash preview (latest)
 */
export class Gemini implements AI {
  /** Instance of the Gemini AI client */
  private client: GoogleGenAI;
  
  /**
   * Initializes a new Gemini AI instance
   * @param apiKey - Google API key for authentication/usage
   */
  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey: apiKey });
  }

  /**
   * Generates a text response using Gemini's text generation model
   * @param prompt - The input text prompt for analysis
   * @returns Gemini's response as a string
   * @throws Error if Gemini API returns an invalid response
   */
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

  /**
   * Analyzes an image using Gemini's vision model
   * @param prompt - Text prompt for the image
   * @param imgPath - File system path to the image file
   * @returns Gemini's analysis as a string
   * @throws Error if image upload fails or API returns invalid response
   */
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