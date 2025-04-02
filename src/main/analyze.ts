import { exec } from 'child_process';

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
    
    console.log('mmls output:', output);
    // Add further processing of the mmls output here if needed
  } catch (error) {
    console.error('Error during analysis:', error);
  }
};