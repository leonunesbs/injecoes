// pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import { MainFormData } from '@/components/MainForm';

export async function fillPdfTemplateWithData(data: MainFormData, modelPDFBytes: ArrayBuffer) {
  const { refId, patientName, staffName, procedureDate, treatmentType } = data;
  const pdfDoc = await PDFDocument.load(modelPDFBytes);
  const pages = pdfDoc.getPages();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  pages[0].setFontSize(10);
  pages[0].setFont(timesRomanFont);

  pages[1].setFontSize(10);
  pages[1].setFont(timesRomanFont);

  pages[2].setFontSize(10);
  pages[2].setFont(timesRomanFont);

  // Page 1
  pages[0].drawText(patientName.toUpperCase(), { x: 100, y: 633 });
  pages[0].drawText(refId.toString(), { x: 475, y: 633 });
  pages[0].drawText(procedureDate.split(' ')[0], { x: 53, y: 483 });
  pages[0].drawText(procedureDate.split(' ')[0], { x: 215, y: 483 });
  pages[0].drawText(procedureDate.split(' ')[0], { x: 60, y: 110 });
  pages[0].drawText(treatmentType, { x: 50, y: 300 });

  // Page 2
  pages[1].drawText(patientName.toUpperCase(), { x: 100, y: 705 });
  pages[1].drawText(refId.toString(), { x: 440, y: 705 });
  pages[1].drawText(procedureDate.split(' ')[0], { x: 45, y: 670 });
  pages[1].drawText(staffName.toUpperCase(), { x: 75, y: 640 });

  // Page 3
  pages[2].drawText(patientName.toUpperCase(), { x: 75, y: 330 });
  pages[2].drawText(procedureDate.split(' ')[0], { x: 345, y: 330 });
  pages[2].drawText(patientName.toUpperCase(), { x: 485, y: 330 });
  pages[2].drawText(procedureDate.split(' ')[0], { x: 760, y: 330 });

  return await pdfDoc.save();
}

export async function createPdfFromData(
  processedData: MainFormData[],
  modelPDFBytes: ArrayBuffer
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create();

  // Add a blank page at the beginning
  const blankPage = pdfDoc.addPage();
  const { width, height } = blankPage.getSize();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  blankPage.setFont(timesRomanFont);
  blankPage.setFontSize(12);

  // Get today's date
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Write the headers
  let yPosition = height - 50; // Start from top
  blankPage.drawText(`Patient Summary - Remaining Doses - Date: ${today}`, { x: 50, y: yPosition });
  yPosition -= 30;

  // Header row
  blankPage.drawText('Patient ID', { x: 50, y: yPosition });
  blankPage.drawText('Name', { x: 120, y: yPosition });
  blankPage.drawText('Next Eye', { x: 405, y: yPosition }); // Adjusted position
  blankPage.drawText('OD', { x: 505, y: yPosition }); // Adjusted position
  blankPage.drawText('OS', { x: 530, y: yPosition }); // Adjusted position
  yPosition -= 10;

  // Draw a line below the header
  blankPage.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  // For each patient, write the data in table format
  processedData.forEach((data, index) => {
    const lineY = yPosition - index * 20;

    // Verificação se a soma das injeções restantes é igual a 1
    const isLastInjection = (data.remainingOD || 0) + (data.remainingOS || 0) === 1;
    const lastInjectionEye = data.remainingOD === 1 ? 'OD' : data.remainingOS === 1 ? 'OS' : '';

    // Verificação para "Finalizou" ou "Erro"
    const nextEyeStatus =
      data.remainingOD === 0 && data.remainingOS === 0
        ? 'Finalizou'
        : (data.remainingOD ?? 0) < 0 || (data.remainingOS ?? 0) < 0
          ? 'Erro'
          : isLastInjection
            ? `Última (${lastInjectionEye})`
            : data.nextEye;

    const odText = data.remainingOD?.toString() || '';
    const osText = data.remainingOS?.toString() || '';

    blankPage.drawText(data.refId.toString(), { x: 50, y: lineY });
    blankPage.drawText(data.patientName, { x: 120, y: lineY });

    // Exibir "Finalizou", "Erro", ou "Última" no campo próximo olho
    blankPage.drawText(nextEyeStatus || '', { x: 405, y: lineY });
    blankPage.drawText(odText, { x: 505, y: lineY });
    blankPage.drawText(osText, { x: 530, y: lineY });

    // Linha separadora
    blankPage.drawLine({
      start: { x: 50, y: lineY - 5 },
      end: { x: width - 50, y: lineY - 5 },
      thickness: 0.5,
      color: rgb(0.75, 0.75, 0.75),
    });
  });

  // Add total number of patients at the bottom
  const totalPatients = processedData.length;
  yPosition -= totalPatients * 20 + 30;
  blankPage.drawText(`Total Patients: ${totalPatients}`, { x: 50, y: yPosition });

  // Now, process each patient and add their pages
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
