import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ReactNode } from 'react';

import { Data } from '@/app/page';

interface FillPdfProps {
  children?: ReactNode;
  queuedData: Data[];
}

export function FillPdf({ queuedData }: FillPdfProps) {
  const fillPdfTemplateWithData = async ({ patientId, patientName, staffName, procedureDate, treatmentType }: Data) => {
    const modelPDFBytes = await fetch('/modelo.pdf').then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(modelPDFBytes);
    const pages = pdfDoc.getPages();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    pages[0].setFontSize(10);
    pages[0].setFont(timesRomanFont);

    pages[1].setFontSize(10);
    pages[1].setFont(timesRomanFont);

    pages[2].setFontSize(10);
    pages[2].setFont(timesRomanFont);

    const date = new Date(procedureDate);
    const today = date.toLocaleDateString('pt-br', {
      dateStyle: 'short',
      timeZone: 'UTC',
    });

    // Preencher página 1
    pages[0].drawText(patientName.toUpperCase(), { x: 100, y: 633 });
    pages[0].drawText(patientId, { x: 475, y: 633 });
    pages[0].drawText(today, { x: 53, y: 483 });
    pages[0].drawText(today, { x: 215, y: 483 });
    pages[0].drawText(today, { x: 60, y: 110 });
    pages[0].drawText(treatmentType, { x: 50, y: 300 });

    // Preencher página 2
    pages[1].drawText(patientName.toUpperCase(), { x: 100, y: 705 });
    pages[1].drawText(patientId, { x: 440, y: 705 });
    pages[1].drawText(today, { x: 45, y: 670 });
    pages[1].drawText(staffName.toUpperCase(), { x: 75, y: 640 });

    // Preencher página 3
    pages[2].drawText(patientName.toUpperCase(), { x: 75, y: 330 });
    pages[2].drawText(today, { x: 345, y: 330 });
    pages[2].drawText(patientName.toUpperCase(), { x: 485, y: 330 });
    pages[2].drawText(today, { x: 760, y: 330 });

    return await pdfDoc.save();
  };
  const fillPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < queuedData.length; i++) {
      const data = queuedData[i];
      const newPdfBytes = await fillPdfTemplateWithData(data);
      const newPdfDoc = await PDFDocument.load(newPdfBytes);
      const copiedPages = await pdfDoc.copyPages(newPdfDoc, [0, 1, 2]);
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <button onClick={fillPDF} type="button" className="btn btn-secondary join-item" disabled={!queuedData.length}>
      Preencher e Converter PDF
    </button>
  );
}
