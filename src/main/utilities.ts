// pdfGenerator.js
import fs from "fs";
import { mdToPdf } from "md-to-pdf";


export async function generateMMLSPDFReport(mdData: string, outputPath: string) {
    const mdPath = "/tmp/report.md";
    fs.writeFileSync(mdPath, mdData);

    const pdf = await mdToPdf({ path: mdPath }, { dest: outputPath, stylesheet: [] });

    if (pdf) {
      console.log("PDF generated successfully at:", outputPath);
    }
}