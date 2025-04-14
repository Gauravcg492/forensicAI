// jsonGenerator.js
import OpenAI from "openai";
import { readFile } from "fs/promises";
import dotenv from "dotenv";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTskCmdsFromMMLS(promptFile, mmls_output, diskpath) {
  try {
    // Read the prompt from an external file named prompt.txt
    console.log("mmls_output:", mmls_output);
    const prompt = await readFile(promptFile, "utf8");
    var customPrompt = prompt.replace("{{mmls_output}}", mmls_output);
    customPrompt = customPrompt.replace("{{path}}", diskpath);
    console.log(customPrompt);

    // Call the chat completions endpoint using the prompt from the file
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: customPrompt,
        },
      ],
    });

    // Extract and parse the JSON output from the response
    const output = response.choices[0].message.content.trim();
    console.log("Output:", output);
    return output;
  } catch (error) {
    console.error("Error in generateJSON:", error);
    throw error;
  }
}

export async function getReport(promptFile, tmpReport) {
  try {
    // Read the prompt from an external file named prompt.txt
    const result = await readFile(tmpReport, "utf8");
    const prompt = await readFile(promptFile, "utf8");
    var customPrompt = prompt.replace("{{final_output}}", result);
    console.log(customPrompt);

    // Call the chat completions endpoint using the prompt from the file
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: customPrompt,
        },
      ],
    });

    // Extract and parse the JSON output from the response
    const output = response.choices[0].message.content.trim();
    console.log("Output:", output);
    return output;
  } catch (error) {
    console.error("Error in generateJSON:", error);
    throw error;
  }
}