// jsonGenerator.js
import OpenAI from "openai";
import { readFile } from "fs/promises";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "YOUR_API_KEY", // Replace with your API key
});

export async function generateJSON(promptFile = "./prompt.txt") {
  try {
    // Read the prompt from an external file named prompt.txt
    const customPrompt = await readFile(promptFile, "utf8");

    // Call the chat completions endpoint using the prompt from the file
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: customPrompt,
        },
      ],
    });

    // Extract and parse the JSON output from the response
    const output = response.choices[0].message.content.trim();
    const jsonData = JSON.parse(output);
    return jsonData;
  } catch (error) {
    console.error("Error in generateJSON:", error);
    throw error;
  }
}
