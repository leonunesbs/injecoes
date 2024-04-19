'use client';

import { useRouter } from 'next/navigation';
import { parse as parseCSV, ParseResult } from 'papaparse';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';

import { ProcessButton } from '@/components';

export interface Data {
  patientId: string | number;
  patientName: string;
  staffName: string;
  procedureDate: string;
  treatmentType: string;
}

type Inputs = {
  xlsFile: FileList;
};

export default function Page() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<Inputs>({});

  const fillPdfTemplateWithData = async (
    { patientId, patientName, staffName, procedureDate, treatmentType }: Data,
    modelPDFBytes: ArrayBuffer
  ) => {
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
  };

  async function processFiles(file: FileList): Promise<Data[]> {
    const processedData: Data[] = [];

    async function readAndProcessFile(file: File) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let rows: string[][] = [];

      if (extension === 'csv') {
        const text = await file.text();
        const parsed = parseCSV(text, { header: true }) as ParseResult<string[]>;
        if (parsed.errors.length > 0) {
          throw new Error('CSV parsing error');
        }
        rows = parsed.data.map((row) => Object.values(row));
      } else if (extension === 'xls' || extension === 'xlsx') {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
      } else {
        throw new Error('Unsupported file format');
      }

      for (const row of rows.slice(4)) {
        const [patientId, , patientName, , , staffName, , procedureDate, , , treatmentType] = row;
        processedData.push({
          patientId: typeof patientId === 'number' ? String(patientId) : patientId,
          patientName,
          staffName,
          procedureDate,
          treatmentType,
        });
      }
    }

    await Promise.all(Array.from(file).map(readAndProcessFile));

    return processedData;
  }

  async function createPdfFromData(processedData: Data[], modelPDFBytes: ArrayBuffer): Promise<PDFDocument> {
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

  async function sortPdfPages(pdfDoc: PDFDocument): Promise<PDFDocument> {
    const sortedPdf = await PDFDocument.create();
    const pageCount = pdfDoc.getPageCount();
    const numColumns = 3; // Number of columns in the sorted PDF
    for (let k = 0; k < numColumns; k++) {
      for (let i = k; i < pageCount; i += numColumns) {
        const newPdfBytes = await pdfDoc.save({
          useObjectStreams: false,
          updateFieldAppearances: false,
        });
        const newPdfDoc = await PDFDocument.load(newPdfBytes);
        const copiedPages = await sortedPdf.copyPages(newPdfDoc, [i]);
        copiedPages.forEach((page) => sortedPdf.addPage(page));
      }
    }
    return sortedPdf;
  }
  async function sortAndSavePdf(processedData: Data[]): Promise<Uint8Array> {
    const modelPDFBytes = await fetch('/modelo.pdf').then((res) => res.arrayBuffer());
    const pdfDoc = await createPdfFromData(processedData, modelPDFBytes);
    const sortedPdf = await sortPdfPages(pdfDoc);
    return sortedPdf.save();
  }

  function createPdfUrl(pdfBytes: Uint8Array): string {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return window.URL.createObjectURL(blob);
  }

  const onSubmit: SubmitHandler<Inputs> = async ({ xlsFile }) => {
    const processedData = await processFiles(xlsFile);
    const sortedPdfBytes = await sortAndSavePdf(processedData);

    const url = createPdfUrl(sortedPdfBytes);
    router.push(url);
  };

  return (
    <main className="py-10 px-4 space-y-10 w-full min-h-full">
      <section>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <h1 className="text-2xl mb-6 font-bold">HGF</h1>
          <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" action={''}>
                <div className="form-control">
                  <label htmlFor="xlsFile" className="label label-text">
                    Arquivo XLS:
                  </label>
                  <input
                    {...register('xlsFile')}
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    multiple
                    className="file-input file-input-bordered"
                    required
                  />
                </div>
                <ProcessButton />
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
