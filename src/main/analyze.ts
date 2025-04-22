import path from 'path';
import { exec } from 'child_process';
import { getTskCmdsFromOutput, getReport, getCmdReport, analyzeImgs } from "./openai-gen";
import { generateMMLSPDFReport } from './utilities';

/**
 * Executes the `mmls` command on the provided file path and returns the output.
 * @param filePath - The path to the disk image file.
 * @returns A promise that resolves with the output of the `mmls` command.
 */
export const runMmls = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Execute the mmls command
    const cmd = `mmls "${filePath}"`
    exec(cmd, (error, stdout, stderr) => {
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
      resolve(`Command: ${cmd}\nResult:\n` + stdout);
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
export const analyze = async (event: Electron.IpcMainInvokeEvent, filePath: string, customPrompt: string) => {
  try {

    // Run mmls and get report
    event.sender.send('analysis-progress', 'Started mmls analysis...');
    const output = await runMmls(filePath);
    
    const reports: string[] = [];
    reports.push(await getCmdReport(path.resolve(__dirname, "../../assets/prompts/get_tool_report.txt"), "mmls", output, "no conclusion", "Analysis of Disk Image"));
    event.sender.send('analysis-progress', 'Completed mmls analysis!');
    
    // Run fsstat and get report
    event.sender.send('analysis-progress', 'Started fsstat analysis...');
    const fsstat_cmds = await getTskCmdsFromOutput(path.resolve(__dirname, "../../assets/prompts/get_fsstat.txt"), output, filePath);
    var results = await runCmds(fsstat_cmds);
    
    reports.push(await getCmdReport(path.resolve(__dirname, "../../assets/prompts/get_tool_report.txt"), "fsstat", results.join("\n"), "no conclusion", "Analysis of Disk Partition Statistics"));
    event.sender.send('analysis-progress', 'Completed fsstat analysis!');

    // Run fls and get report
    event.sender.send('analysis-progress', 'Started fls analysis...');
    const fls_cmds = await getTskCmdsFromOutput(path.resolve(__dirname, "../../assets/prompts/get_fls.txt"), output, filePath);
    results = await runCmds(fls_cmds);
    
    reports.push(await getCmdReport(path.resolve(__dirname, "../../assets/prompts/get_tool_report.txt"), "fls", results.join("\n"), customPrompt, "Analysis of File Listings"));
    event.sender.send('analysis-progress', 'Completed fls analysis!');

    // Run icat and get image analysis
    event.sender.send('analysis-progress', 'Started icat analysis...');
    const icat_cmds = await getTskCmdsFromOutput(path.resolve(__dirname, "../../assets/prompts/get_icat.txt"), results.join("\n"), filePath);
    results = await runCmds(icat_cmds);

    const filenames = icat_cmds.split("\n").map((cmd: string)  => {
      const parts = cmd.split(' ');
      return parts[parts.length - 1];
    });

    const img_results = await analyzeImgs(filenames);
    reports.push(await getCmdReport(path.resolve(__dirname, "../../assets/prompts/get_tool_report.txt"), "icat", img_results.join("\n"), customPrompt + " No metadata required", "Analysis of Images Found"));
    event.sender.send('analysis-progress', 'Completed icat analysis!');

    // Get final report
    event.sender.send('analysis-progress', 'All analysis completed! Generating Report...');
    const pdfPath = "/tmp/report.pdf";
    var mdData = await getReport(path.resolve(__dirname, "../../assets/prompts/get_report.txt"), reports, customPrompt);
    const disclaimer = `\n**Note**:AI-Generated Report Disclaimer<br/>All findings, conclusions, and recommendations herein require independent verification by a certified digital forensics professional before being relied upon. Do not use this report for critical decisions without expert validation.<br/>\n`
    mdData = "# Forensic Report<br/>" + disclaimer + reports.join("\n\n") + mdData;
    await generateMMLSPDFReport(mdData, pdfPath);

    // Return generated pdf
    return "file://" + pdfPath;
  } catch (error) {
    console.error('Error during analysis:', error);
  }
};