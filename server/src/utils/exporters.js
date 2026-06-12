import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// Streams an .xlsx file to the response.
export const sendExcel = async (res, { filename = "report.xlsx", sheetName = "Report", columns = [], rows = [] }) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.columns = columns; // [{ header, key, width }]
  rows.forEach((r) => ws.addRow(r));
  ws.getRow(1).font = { bold: true };
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await wb.xlsx.write(res);
  res.end();
};

// Streams a simple tabular PDF to the response.
export const sendPdf = (res, { filename = "report.pdf", title = "Report", subtitle, columns = [], rows = [] }) => {
  const doc = new PDFDocument({ margin: 36, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: "center" });
  if (subtitle) {
    doc.moveDown(0.2).fontSize(10).fillColor("#666").text(subtitle, { align: "center" }).fillColor("#000");
  }
  doc.moveDown();

  const left = 36;
  const usable = doc.page.width - left * 2;
  const colWidth = usable / Math.max(columns.length, 1);

  const drawRow = (cells, bold = false) => {
    const y = doc.y;
    cells.forEach((c, i) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 10 : 9)
        .text(String(c ?? ""), left + i * colWidth, y, { width: colWidth - 4, ellipsis: true });
    });
    doc.moveDown(0.7);
  };

  drawRow(columns.map((c) => c.header), true);
  doc.moveTo(left, doc.y).lineTo(doc.page.width - left, doc.y).stroke();
  doc.moveDown(0.3);

  rows.forEach((r) => {
    drawRow(columns.map((c) => r[c.key]));
    if (doc.y > doc.page.height - 50) doc.addPage();
  });

  doc.end();
};
