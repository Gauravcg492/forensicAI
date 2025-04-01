// index.js
import { generateJSON } from "./openai-json-gen.js";
import { generatePDFReport } from "./pdf-gen.js";

async function run() {
  try {
    // Generate JSON from the prompt
    const jsonData = await generateJSON();
    console.log("Generated JSON:", jsonData);
    
    // Generate the PDF report using the JSON data
    generatePDFReport(jsonData);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
