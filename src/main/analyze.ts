import path from 'path';
import { exec } from 'child_process';
import { getTskCmdsFromMMLS, getReport } from "./openai-gen";
import fs from 'fs';
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

export const runCmds = (cmds: string): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Split the commands by a delimiter (e.g., newline or semicolon)
      const commands = cmds.split('\n');

      const results: string[] = [];
      for (const cmd of commands) {
        console.log(`Executing command: ${cmd}`);
        const output = await new Promise<string>((resolveCmd, rejectCmd) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error running command "${cmd}": ${error.message}`);
              rejectCmd(`Error: ${error.message}`);
              return;
            }

            if (stderr) {
              console.error(`Command "${cmd}" stderr: ${stderr}`);
              rejectCmd(`Error: ${stderr}`);
              return;
            }

            resolveCmd(stdout.trim());
          });
        });
        results.push("\nCommand:" + cmd + "\nResult:\n" + output);
      }

      resolve(results); // Resolve with all command outputs
    } catch (error) {
      reject(`Error executing commands: ${error}`);
    }
  });
};

/**
 * Analyzes the given file by running the `mmls` command and processing its output.
 * @param filePath - The path to the disk image file.
 */
export const analyze = async (filePath: string) => {
  try {
    const tmpReportPath = "/tmp/report.txt";
    fs.writeFileSync(tmpReportPath, "");

    console.log(`Analyzing file: ${filePath}`);
    const output = await runMmls(filePath);
    fs.appendFileSync(tmpReportPath, "MMLS Ouput:\n" + output);
    
    const fsstat_cmds = await getTskCmdsFromMMLS(path.resolve(__dirname, "../../assets/prompts/get_fsstat.txt"), output, filePath);
    var results = await runCmds(fsstat_cmds);
    fs.appendFileSync(tmpReportPath, "\n\nFSSTAT Outputs:\n" + results.join("\n"));
    
    const fls_cmds = await getTskCmdsFromMMLS(path.resolve(__dirname, "../../assets/prompts/get_fls.txt"), output, filePath);
    results = await runCmds(fls_cmds);
    fs.appendFileSync(tmpReportPath, "\n\nFLS Outputs:\n" + results.join("\n"));

    const pdfPath = "/tmp/report.pdf";
    const mdData = await getReport(path.resolve(__dirname, "../../assets/prompts/get_report.txt"), tmpReportPath);
    await generateMMLSPDFReport(mdData, pdfPath);

    return "file://" + pdfPath;
  } catch (error) {
    console.error('Error during analysis:', error);
  }
};