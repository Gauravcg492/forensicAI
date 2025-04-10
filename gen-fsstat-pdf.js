// pdfGeneratorFsstat.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";

/**
 * Checks if the current vertical position (yPos) is near the bottom of the page.
 * If it is, it adds a new page and resets yPos to the top margin.
 */
function checkPageOverflow(doc, yPos, marginBottom, marginTop) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPos >= pageHeight - marginBottom) {
    doc.addPage();
    return marginTop;
  }
  return yPos;
}

export function generateFsstatPDFReport(jsonData, outputPath = "fsstat_report.pdf") {
  // Define margins
  const marginLeft = 30;
  const marginRight = 30;
  const marginTop = 40;
  const marginBottom = 40;

  const doc = new jsPDF({
    unit: "pt", // Points; adjust as desired (e.g., "mm")
    format: "letter" // or "a4", etc.
  });

  // Current vertical cursor
  let yPos = marginTop;

  // Set up some helper font functions
  const setBold = () => doc.setFont("Helvetica", "bold");
  const setNormal = () => doc.setFont("Helvetica", "normal");

  // Page width and usable width
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - marginLeft - marginRight;

  // A helper for writing multi-line text with overflow checks
  function writeWrappedText(text, fontSize = 12, increment = 6) {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, usableWidth);
    for (let i = 0; i < lines.length; i++) {
      yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
      doc.text(lines[i], marginLeft, yPos);
      yPos += increment;
    }
  }

  // --- REPORT TITLE ---
  setBold();
  doc.setFontSize(16);
  doc.text("fsstat Forensic Report", marginLeft, yPos);
  yPos += 20;

  // --- 1. General File System Information ---
  setBold();
  doc.setFontSize(14);
  doc.text("1. General File System Information", marginLeft, yPos);
   yPos += 20;

  setNormal();
  doc.setFontSize(12);

  // We'll write each field in normal text
  const general = jsonData.general_file_system_information;
  const generalFields = [
    `File System Type: ${general.file_system_type.value}`,
    `Volume Serial Number: ${general.volume_serial_number.value}`,
    `OEM Name: ${general.oem_name.value}`,
    `Volume Name: ${general.volume_name.value}`,
    `Version: ${general.version.value}`
  ];

  for (const field of generalFields) {
    yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
    doc.text(field, marginLeft, yPos);
     yPos += 20;
  }

  // Combine all descriptions into one paragraph
  const generalDesc = [
    general.file_system_type.description,
    general.volume_serial_number.description,
    general.oem_name.description,
    general.volume_name.description,
    general.version.description
  ].join(" ");
  writeWrappedText(generalDesc, 12, 14);
  yPos += 20;

  // --- 2. Metadata Information ---
  setBold();
  doc.setFontSize(14);
  yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
  doc.text("2. Metadata Information", marginLeft, yPos);
   yPos += 20;

  setNormal();
  doc.setFontSize(12);
  const metadata = jsonData.metadata_information;
  const metaFields = [
    `First Cluster of MFT: ${metadata.first_cluster_of_mft.value}`,
    `First Cluster of MFT Mirror: ${metadata.first_cluster_of_mft_mirror.value}`,
    `Size of MFT Entries: ${metadata.size_of_mft_entries.value}`,
    `Size of Index Records: ${metadata.size_of_index_records.value}`,
    `Range: ${metadata.range.value}`,
    `Root Directory: ${metadata.root_directory.value}`
  ];

  for (const field of metaFields) {
    yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
    doc.text(field, marginLeft, yPos);
     yPos += 20;
  }

  const metaDesc = [
    metadata.first_cluster_of_mft.description,
    metadata.first_cluster_of_mft_mirror.description,
    metadata.size_of_mft_entries.description,
    metadata.size_of_index_records.description,
    metadata.range.description,
    metadata.root_directory.description
  ].join(" ");
  writeWrappedText(metaDesc, 12, 14);
  yPos += 20;
  // --- 3. Content Information ---
  setBold();
  doc.setFontSize(14);
  yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
  doc.text("3. Content Information", marginLeft, yPos);
   yPos += 20;

  setNormal();
  doc.setFontSize(12);
  const content = jsonData.content_information;
  const contentFields = [
    `Sector Size: ${content.sector_size.value}`,
    `Cluster Size: ${content.cluster_size.value}`,
    `Total Cluster Range: ${content.total_cluster_range.value}`,
    `Total Sector Range: ${content.total_sector_range.value}`
  ];

  for (const field of contentFields) {
    yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
    doc.text(field, marginLeft, yPos);
     yPos += 20;
  }

  const contentDesc = [
    content.sector_size.description,
    content.cluster_size.description,
    content.total_cluster_range.description,
    content.total_sector_range.description
  ].join(" ");
  writeWrappedText(contentDesc, 12, 14);
  yPos += 40;
  // --- 4. NTFS Attribute Definitions ---
  setBold();
  doc.setFontSize(14);
  yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
  doc.text("4. NTFS Attribute Definitions ($AttrDef)", marginLeft, yPos);
   yPos += 20;

  // Prepare table data
  const attrColumns = ["Attribute", "Identifier", "Size Range", "Flags", "Description"];
  const attrRows = jsonData.ntfs_attribute_definitions.map(attr => [
    attr.attribute,
    attr.identifier,
    attr.size_range,
    attr.flags,
    attr.description
  ]);

  // Insert the table using autoTable
  autoTable(doc, {
    head: [attrColumns],
    body: attrRows,
    startY: yPos,
    margin: { left: marginLeft, right: marginRight },
    tableWidth: "wrap", // ensures wrapping instead of overflow
    styles: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 10,
      overflow: "linebreak", 
      cellWidth: "wrap",
      valign: "top",
      halign: "center"
    },
    headStyles: {
      fillColor: [128, 128, 128],
      fontStyle: "bold",
      halign: "center"
    },
    columnStyles: {
      0: { cellWidth: 60 },  // Adjust these as needed
      1: { cellWidth: 40 },
      2: { cellWidth: 60 },
      3: { cellWidth: 40 },
      4: { cellWidth: 200 }  // 'Description' can be the widest
    },
    didDrawPage: (data) => {
      // If table overflows, autoTable automatically adds pages. 
      // We can track the final Y if needed:
      yPos = data.cursor.y;
    }
  });

  // Update yPos after the table
  yPos = doc.lastAutoTable.finalY + 20;

  // --- 5. Overall Significance ---
  setBold();
  doc.setFontSize(14);
  yPos = checkPageOverflow(doc, yPos, marginBottom, marginTop);
  doc.text("5. Overall Significance", marginLeft, yPos);
   yPos += 20;

  setNormal();
  doc.setFontSize(12);
  const overallSignificance = jsonData.overall_significance;
  writeWrappedText(overallSignificance, 12, 14);
  yPos += 20;
  // -- Optional Footer (Page X of Y) --
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    setNormal();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.text(`Page ${i} of ${pageCount}`, marginLeft, pageHeight - marginBottom + 10);
  }

  // Save the PDF
  const pdfOutput = doc.output();
  fs.writeFileSync(outputPath, pdfOutput, "binary");
  console.log(`PDF report generated and saved as ${outputPath}`);
}
