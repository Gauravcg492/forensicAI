import OpenAI from "openai";
import { AI } from "./ai";
import fs from 'fs';

export class GPT implements AI {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

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