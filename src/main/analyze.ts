import path from 'path';
import { exec } from 'child_process';
import { generateJSON } from "./openai-gen";
import { generateMMLSPDFReport } from './utilities';

/**
 * Executes the `mmls` command on the provided file path and returns the output.
 * @param filePath - The path to the disk image file.
 * @returns A promise that resolves with the output of the `mmls` command.
 */
export const runMmls = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Execute the mmls command
    exec(`mmls "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running mmls: ${error.message}`);
        reject(`Error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`mmls stderr: ${stderr}`);
        reject(`Error: ${stderr}`);
        return;
      }

      // Resolve with the command output
      resolve(stdout);
    });
  });
};

/**
 * Analyzes the given file by running the `mmls` command and processing its output.
 * @param filePath - The path to the disk image file.
 */
export const analyze = async (filePath: string) => {
  try {
    console.log(`Analyzing file: ${filePath}`);
    const output = await runMmls(filePath);
    const jsonData = await generateJSON(path.resolve(__dirname, "../../assets/prompts/mmls.txt"), output);
    console.log('Generated JSON:', jsonData);
    // const reportPath = path.resolve(__dirname, "../../assets/report.pdf");
    const reportPath = "/tmp/report.pdf";
    generateMMLSPDFReport(jsonData, reportPath);
    return "file:///tmp/report.pdf";
  } catch (error) {
    console.error('Error during analysis:', error);
  }
};