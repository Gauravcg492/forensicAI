// jsonGenerator.js
import OpenAI from "openai";
import { readFile } from "fs/promises";
import fs from 'fs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "", // Use environment variable instead of hardcoded key
});

async function getOpenAIResponse(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  if (!response?.choices?.[0]?.message?.content) {
    throw new Error("Invalid response from OpenAI API");
  }

  return response.choices[0].message.content.trim();
}

export async function getTskCmdsFromOutput(
  promptFile: string,
  output: string,
  diskpath: string
): Promise<string> {
  try {
    console.log("output:", output);
    const prompt: string = await readFile(promptFile, "utf8");
    let customPrompt: string = prompt.replace("{{output}}", output);
    customPrompt = customPrompt.replace("{{path}}", diskpath);
    console.log(customPrompt);

    const result = await getOpenAIResponse(customPrompt);
    console.log("Output:", result);
    return result;
  } catch (error) {
    console.error("Error in getTskCmdsFromMMLS:", error);
    throw error;
  }
}

export async function getCmdReport(
  promptFile: string,
  toolName: string,
  toolOutput: string,
  customPrompt: string,
  title: string): Promise<string> {
    try {
      const prompt: string = await readFile(promptFile, "utf8");
      let newPrompt: string = prompt.replaceAll("{{tool_name}}", toolName);
      newPrompt = newPrompt.replace("{{tool_output}}", toolOutput);
      newPrompt = newPrompt.replace("{{title}}", title);
  
      if (customPrompt !== '') {
        newPrompt = newPrompt.replace(
          "{{additional_task}}",
          "Focus analysis around these keywords: " + customPrompt
        );
      } else {
        newPrompt = newPrompt.replace(
          "{{additional_task}}",
          ""
        );
      }
      console.log(newPrompt);
      console.log("customPrompt:", customPrompt);
  
      const output = await getOpenAIResponse(newPrompt);
      return output;
    } catch (error) {
      console.error("Error in getReport:", error);
      throw error;
    }

  }

export async function getReport(
  promptFile: string,
  reports: string[],
  tmpReportPath: string,
  customPrompt?: string
): Promise<string> {
  try {
    const result: string = await readFile(tmpReportPath, "utf8");
    const prompt: string = await readFile(promptFile, "utf8");
    let newPrompt: string = prompt.replace("{{final_output}}", reports.join("\n\n"));

    if (customPrompt && customPrompt !== '') {
      newPrompt = newPrompt.replace(
        "{{additional_task}}",
        "Focus analysis around these keywords: " + customPrompt
      );
    }
    console.log(newPrompt);
    console.log("customPrompt:", customPrompt);

    const output = await getOpenAIResponse(newPrompt);
    return output + "\n\n# Appendix\n```" + result + "```";
  } catch (error) {
    console.error("Error in getReport:", error);
    throw error;
  }
}

function encodeImageToBase64(filePath: string) {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString("base64");
}


export async function analyzeImgs(filenames: string[]) {
  const results: string[] = []
  
  for (const path of filenames) {
    if (path.includes("jpg")) {
        const base64Image = encodeImageToBase64(path);
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Describe this image." },
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
          console.log("Image output", response.choices[0].message.content);
          results.push("Filename: " + path + "\nDescription:" + response.choices[0].message.content);
        } catch(error) {
          // continue
        }
    }
  }
  return results;
}