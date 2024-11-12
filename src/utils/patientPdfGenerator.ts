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
  startEye: 'OD' | 'OS' | '';
}

export async function fillPatientPdfTemplateWithData(
  data: PatientData,
  modelPDFBytes: ArrayBuffer
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(modelPDFBytes);
  const pages = pdfDoc.getPages();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pages[0]; // Utilizando a primeira página do template

  page.setFont(timesRomanFont);
  page.setFontSize(12);

  // Espaçador vertical padronizado que funciona como o espaço de uma linha em branco
  const verticalSpacer = 20;
  let yPosition = 675; // Posição Y inicial
  // Próxima linha
  yPosition -= 0.5 * verticalSpacer;

  page.drawText(
    new Date().toLocaleDateString('pt-br', {
      dateStyle: 'short',
    }),
    { x: 102, y: yPosition }
  ); // Data

  page.setFontSize(10);

  // Próxima linha
  yPosition -= 2.5 * verticalSpacer;

  // Nome do paciente e Prontuário (ID do paciente) na mesma linha
  page.drawText(data.name, { x: 115, y: yPosition }); // Nome do paciente
  page.drawText(data.refId, { x: 425, y: yPosition }); // Prontuário (ID do paciente)

  // Próxima linha
  yPosition -= 5.5 * verticalSpacer;

  // Diagnóstico
  page.drawText(data.indication, { x: 140, y: yPosition });

  // Próxima linha
  yPosition -= 9.5 * verticalSpacer;

  page.drawText(data.medication, { x: 380, y: yPosition }); // Indicação de medicação

  // Próxima linha
  yPosition -= 1.4 * verticalSpacer;

  page.drawText(`${data.remainingOD ?? 0}`, { x: 470, y: yPosition }); // Doses indicadas OD

  // Próxima linha
  yPosition -= 1.2 * verticalSpacer;

  page.drawText(`${data.remainingOS ?? 0}`, { x: 470, y: yPosition }); // Doses indicadas OS

  // Próxima linha
  yPosition -= 4.6 * verticalSpacer;

  page.drawText(`Swalis: ${data.swalisClassification}`, { x: 140, y: yPosition }); // Classificação Swalis

  // Verifica se há indicação para o olho de início antes de desenhar
  const hasIndicationOD = (data.remainingOD ?? 0) > 0;
  const hasIndicationOS = (data.remainingOS ?? 0) > 0;

  if ((data.startEye === 'OD' && hasIndicationOD) || (data.startEye === 'OS' && hasIndicationOS)) {
    page.drawText(`Começar por: ${data.startEye}`, { x: 195, y: yPosition }); // Olho de início
  }

  // Próxima linha
  yPosition -= 0.8 * verticalSpacer;

  // Observações com largura máxima e quebra de linha
  const observations = data.observations || '';
  const maxWidth = 450; // Define a largura máxima para o texto de observações
  const fontSize = 10; // Tamanho da fonte atual
  const words = observations.split(' ');
  let line = '';
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const lineWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
    if (lineWidth > maxWidth) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  for (const textLine of lines) {
    page.drawText(textLine.trim(), { x: 85, y: yPosition });
    yPosition -= 0.8 * verticalSpacer; // Avança para a próxima linha
  }

  // Próxima linha
  yPosition -= verticalSpacer;

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function createPatientPdfBlob(pdfBytes: Uint8Array): string {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
