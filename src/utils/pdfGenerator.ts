import { PDFDocument, StandardFonts } from 'pdf-lib';

import { Data } from '@/app/page';

export async function fillPdfTemplateWithData(
  { patientId, patientName, staffName, procedureDate, treatmentType }: Data,
  modelPDFBytes: ArrayBuffer
) {
  const pdfDoc = await PDFDocument.load(modelPDFBytes);
  const pages = pdfDoc.getPages();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  pages[0].setFontSize(10);
  pages[0].setFont(timesRomanFont);

  pages[1].setFontSize(10);
  pages[1].setFont(timesRomanFont);

  pages[2].setFontSize(10);
  pages[2].setFont(timesRomanFont);

  // página 1
  pages[0].drawText(patientName.toUpperCase(), { x: 100, y: 633 });
  pages[0].drawText(patientId.toString(), { x: 475, y: 633 });
  pages[0].drawText(procedureDate.split(' ')[0], { x: 53, y: 483 });
  pages[0].drawText(procedureDate.split(' ')[0], { x: 215, y: 483 });
  pages[0].drawText(procedureDate.split(' ')[0], { x: 60, y: 110 });
  pages[0].drawText(treatmentType, { x: 50, y: 300 });

  // página 2
  pages[1].drawText(patientName.toUpperCase(), { x: 100, y: 705 });
  pages[1].drawText(patientId.toString(), { x: 440, y: 705 });
  pages[1].drawText(procedureDate.split(' ')[0], { x: 45, y: 670 });
  pages[1].drawText(staffName.toUpperCase(), { x: 75, y: 640 });

  // página 3
  pages[2].drawText(patientName.toUpperCase(), { x: 75, y: 330 });
  pages[2].drawText(procedureDate.split(' ')[0], { x: 345, y: 330 });
  pages[2].drawText(patientName.toUpperCase(), { x: 485, y: 330 });
  pages[2].drawText(procedureDate.split(' ')[0], { x: 760, y: 330 });

  return await pdfDoc.save();
}

export async function createPdfFromData(processedData: Data[], modelPDFBytes: ArrayBuffer): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create();
  for (const data of processedData) {
    if (!data.patientName) continue;
    const newPdfBytes = await fillPdfTemplateWithData(data, modelPDFBytes);
    const newPdfDoc = await PDFDocument.load(newPdfBytes);
    const copiedPages = await pdfDoc.copyPages(newPdfDoc, [0, 1, 2]);
    copiedPages.forEach((page) => pdfDoc.addPage(page));
  }

  return pdfDoc;
}

export function createPdfUrl(pdfBytes: Uint8Array): string {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return window.URL.createObjectURL(blob);
}
