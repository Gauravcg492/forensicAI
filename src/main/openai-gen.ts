// jsonGenerator.js
import OpenAI from "openai";
import { readFile, writeFile } from "fs/promises";
import fs from 'fs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "", // Use environment variable instead of hardcoded key
});

const logFileName = '/tmp/ai-log.txt'

async function getOpenAIResponse(prompt: string): Promise<string> {
  let content = "Prompt: \n" + prompt
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

  const answer = response.choices[0].message.content.trim();
  content += `\nAnswer:\n${answer}\n\n\n`
  await writeFile(logFileName, content, { flag: 'a+' });
  return answer
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
  customPrompt: string
): Promise<string> {
  try {
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

    const result: string = await readFile(logFileName, "utf8");
    return output + "\n<br/>\n# Appendix\n```" + result + "```";
  } catch (error) {
    console.error("Error in getReport:", error);
    throw error;
  }
}

export async function analyzeImgs(filenames: string[]) {
  const prompt = "Describe this image.";
  const results: string[] = [];
  let content = '';

  for (const path of filenames) {
    if (path.includes("jpg")) {
        const imageBuffer = fs.readFileSync(path);
        const base64Image = imageBuffer.toString("base64");
        content += `Filename:${path}, Prompt: ${prompt}\n`;
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text:  prompt },
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
          const answer = response.choices[0].message.content
          console.log("Image output", answer);
          results.push("Filename: " + path + "\nDescription:" + answer);
          content += `Answer:\n${answer}\n\n\n`;
        } catch(error) {
          // ignore failed files
        }
    }
  }

  await writeFile(logFileName, content, { flag: 'a+' });
  return results;
}