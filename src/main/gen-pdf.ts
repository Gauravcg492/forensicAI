// pdfGenerator.js
import fs from "fs";
import markdownpdf from "markdown-pdf";


export function generateMMLSPDFReport(mdData: string, outputPath: string) {
    const mdPath = "/tmp/report.md";
    fs.writeFileSync(mdPath, mdData);

    markdownpdf()
        .from(mdPath)
        .to(outputPath, () => {
            console.log("PDF generated successfully");
            // clean up temp file
            fs.unlinkSync(mdPath);
        });
}