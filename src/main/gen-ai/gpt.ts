import OpenAI from "openai";
import { AI } from "./ai";
import fs from 'fs';

/**
 * Implementation of the AI interface using OpenAI model
 * Uses GPT 4o
 */
export class GPT implements AI {
  /** Instance of the openAI client */
  private client: OpenAI;

  /**
   * Initializes a new OpenAI instance
   * @param apiKey - OpenAI API key for authentication/usage
   */
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generates a text response using GPT's text generation model
   * @param prompt - The input text prompt for analysis
   * @returns GPT's response as a string
   * @throws Error if GPT returns an invalid response
   */
  async getResponse(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
            role: "user", 
            content: prompt 
        }
      ],
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI API");
    }

    return response.choices[0].message.content.trim();
  }

  /**
   * Analyzes an image using GPT's vision model
   * @param prompt - Text prompt for the image
   * @param imgPath - File system path to the image file
   * @returns GPT's analysis as a string
   * @throws Error if image upload fails or API returns invalid response
   */
  async getImgResponse(prompt: string, imgPath: string): Promise<string> {
    const imageBuffer = fs.readFileSync(imgPath);
    const base64Image = imageBuffer.toString("base64");
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI API");
    }

    return response.choices[0].message.content.trim();
  }
}