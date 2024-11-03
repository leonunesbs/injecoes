// utils/patientPdfGenerator.ts

import { PDFDocument, StandardFonts } from 'pdf-lib';

interface PatientData {
  refId: string;
  name: string;
  indication: string;
  medication: string;
  swalisClassification: string;
  observations?: string;
  remainingOD?: number;
  remainingOS?: number;
  startEye: 'OD' | 'OS';
}

export async function fillPatientPdfTemplateWithData(
  data: PatientData,
  modelPDFBytes: ArrayBuffer
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(modelPDFBytes);
  const pages = pdfDoc.getPages();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pages[0]; // Supondo que você tenha um template de uma única página

  page.setFont(timesRomanFont);
  page.setFontSize(12);

  // Ajuste as coordenadas (x, y) de acordo com o seu template de PDF
  page.drawText(`Nome: ${data.name}`, { x: 50, y: 700 });
  page.drawText(`ID do Paciente: ${data.refId}`, { x: 50, y: 680 });
  page.drawText(`Indicação: ${data.indication}`, { x: 50, y: 660 });
  page.drawText(`Medicação: ${data.medication}`, { x: 50, y: 640 });
  page.drawText(`Classificação Swalis: ${data.swalisClassification}`, { x: 50, y: 620 });
  page.drawText(`Observações: ${data.observations || ''}`, { x: 50, y: 600 });
  page.drawText(`Injeções Restantes OD: ${data.remainingOD ?? 0}`, { x: 50, y: 580 });
  page.drawText(`Injeções Restantes OS: ${data.remainingOS ?? 0}`, { x: 50, y: 560 });
  page.drawText(`Olho de Início: ${data.startEye}`, { x: 50, y: 540 });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function createPatientPdfBlob(pdfBytes: Uint8Array): string {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
