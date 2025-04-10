// index.js
import { generateJSON } from "./openai-json-gen.js";
import { generatePDFReport } from "./pdf-gen.js";
import { generateFsstatPDFReport } from "./gen-fsstat-pdf.js"

async function run() {
  try {
    // Generate JSON from the prompt
    const jsonData = await generateJSON("./prompt_fsstat.txt");
    console.log("Generated JSON:", jsonData);
    
    // Generate the PDF report using the JSON data
    // generatePDFReport(jsonData);
    generateFsstatPDFReport(jsonData);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();