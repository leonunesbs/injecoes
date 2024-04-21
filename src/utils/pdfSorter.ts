import { PDFDocument } from 'pdf-lib';

export async function sortPdfPages(pdfDoc: PDFDocument): Promise<PDFDocument> {
  const sortedPdf = await PDFDocument.create();
  const totalPages = pdfDoc.getPageCount();
  const modelPages = 3; // Number of columns in the sorted PDF
  for (let k = 0; k < modelPages; k++) {
    for (let i = k; i < totalPages; i += modelPages) {
      const copiedPages = await sortedPdf.copyPages(pdfDoc, [i]);
      copiedPages.forEach((page) => sortedPdf.addPage(page));
    }
  }
  return sortedPdf;
}
