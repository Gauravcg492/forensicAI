// pdfGenerator.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable explicitly
import fs from "fs";

export function generatePDFReport(jsonData, outputPath = "mmls_report.pdf") {
  // Create a new PDF document
  const doc = new jsPDF();

  // Set up the document title
  doc.setFontSize(18);
  doc.text("mmls Report", 14, 22);

  // Add header information
  doc.setFontSize(12);
  doc.text(`Disk Image: ${jsonData.disk_image}`, 14, 32);
  doc.text(`Partition Table: ${jsonData.partition_table}`, 14, 40);
  doc.text(`Offset Sector: ${jsonData.offset_sector}`, 14, 48);
  doc.text(`Units: ${jsonData.units}`, 14, 56);

  // Prepare table headers and rows for the partitions data
  const tableColumns = ["Slot", "Start", "End", "Length", "Description"];
  const tableRows = jsonData.partitions.map(partition => [
    partition.slot,
    partition.start,
    partition.end,
    partition.length,
    partition.description,
  ]);

  // Generate table starting at Y position 65 using autoTable
  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 65,
    styles: { halign: "center" },
    headStyles: { fillColor: [128, 128, 128] },
  });

  // Save the PDF report to a file (Node environment)
  const pdfOutput = doc.output();
  fs.writeFileSync(outputPath, pdfOutput, "binary");
  console.log(`PDF report generated and saved as ${outputPath}`);
}
