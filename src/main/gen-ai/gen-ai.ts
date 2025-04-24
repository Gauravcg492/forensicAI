// jsonGenerator.js
import { readFile, writeFile } from "fs/promises";
import fs from 'fs';
import { GPT } from "./gpt";
import { Gemini } from "./gemini";
import { AI } from "./ai";

// Initialize OpenAI client
const gpt = new GPT(
  process.env.OPENAI_API_KEY ?? ""
);
const gemini = new Gemini(
  process.env.GEMINI_API_KEY ?? ""
);

let ai:AI = gpt;

export function changeAI(aiName="gpt"): void {
  if(aiName == "gemini") {
    ai = gemini;
  } else {
    ai = gpt;
  }
}

const logFileName = '/tmp/ai-log.txt'

async function getOpenAIResponse(prompt: string): Promise<string> {
  let content = "Prompt: \n" + prompt
  const answer = await ai.getResponse(prompt)

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
    return output + "\n\nAppendix\n```" + result + "```";
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
        content += `Filename:${path}, Prompt: ${prompt}\n`;
        try {
          const answer = await ai.getImgResponse(prompt, path);
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