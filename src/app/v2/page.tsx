import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { PDFDocument, StandardFonts } from 'pdf-lib';

import { Data } from '../page';

export default function V2() {
  async function action(data: FormData) {
    'use server';
    const csvData = data.get('csvData')?.toString();
    const emailTo = data.get('emailTo')?.toString();
    if (!csvData || !emailTo) {
      return;
    }

    function csvToArray(csvText: string): string[][] {
      // Dividir o texto do CSV em linhas
      const lines: string[] = csvText.split('\n');

      // Array para armazenar as colunas
      const result: string[][] = [];

      // Iterar sobre as linhas
      lines.forEach((line) => {
        // Dividir a linha em colunas
        const columns: string[] = line.split(';');

        // Adicionar as colunas ao resultado
        result.push(columns);
      });

      return result;
    }

    const processedData = csvToArray(csvData)
      .slice(4)
      .map((row: any) => ({
        patientId: row[0],
        patientName: row[2],
        staffName: row[5],
        procedureDate: row[7],
        treatmentType: row[10],
      }));

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

      // Preencher página 1
      pages[0].drawText(patientName.toUpperCase(), { x: 100, y: 633 });
      pages[0].drawText(patientId, { x: 475, y: 633 });
      pages[0].drawText(procedureDate.split(' ')[0], { x: 53, y: 483 });
      pages[0].drawText(procedureDate.split(' ')[0], { x: 215, y: 483 });
      pages[0].drawText(procedureDate.split(' ')[0], { x: 60, y: 110 });
      pages[0].drawText(treatmentType, { x: 50, y: 300 });

      // Preencher página 2
      pages[1].drawText(patientName.toUpperCase(), { x: 100, y: 705 });
      pages[1].drawText(patientId, { x: 440, y: 705 });
      pages[1].drawText(procedureDate.split(' ')[0], { x: 45, y: 670 });
      pages[1].drawText(staffName.toUpperCase(), { x: 75, y: 640 });

      // Preencher página 3
      pages[2].drawText(patientName.toUpperCase(), { x: 75, y: 330 });
      pages[2].drawText(procedureDate.split(' ')[0], { x: 345, y: 330 });
      pages[2].drawText(patientName.toUpperCase(), { x: 485, y: 330 });
      pages[2].drawText(procedureDate.split(' ')[0], { x: 760, y: 330 });

      return await pdfDoc.save();
    };
    const fillPDF = async () => {
      const pdfDoc = await PDFDocument.create();
      const modelPDFBytes = await fetch('https://hgf-solutions.vercel.app/modelo.pdf').then((res) => res.arrayBuffer());
      for (let i = 0; i < processedData.length; i++) {
        const data = processedData[i];
        if (!data.patientName) continue;
        const newPdfBytes = await fillPdfTemplateWithData(data, modelPDFBytes);
        const newPdfDoc = await PDFDocument.load(newPdfBytes);
        const copiedPages = await pdfDoc.copyPages(newPdfDoc, [0, 1, 2]);
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      }

      const pdfBytes = await pdfDoc.save();

      console.log(pdfBytes);

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log(transporter);

      const mailOptions: MailOptions = {
        from: 'oftleonunesbs@gmail.com',
        to: emailTo,
        subject: 'Relatório de Injeções',
        text: 'Segue anexo relatório de injeções.',
        attachments: [
          {
            filename: 'relatorio.pdf',
            content: Buffer.from(pdfBytes),
            contentType: 'application/pdf',
          },
        ],
      };
      console.log('teste');

      const { response } = await transporter.sendMail(mailOptions);
      console.log(response);
    };
    fillPDF();
  }
  return (
    <main className="py-10 px-4 space-y-10 w-full min-h-full">
      <section>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <h1 className="text-2xl mb-6 font-bold">HGF</h1>
          <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <form action={action} className="space-y-4">
                <div className="form-control">
                  <label htmlFor="csvData" className="label label-text">
                    Dados CSV:
                  </label>
                  <textarea name="csvData" id="csvData" className="textarea textarea-bordered w-full" required />
                </div>
                <div className="form-control">
                  <label htmlFor="emailTo" className="label label-text">
                    E-mail destino:
                  </label>
                  <input
                    type="email"
                    name="emailTo"
                    id="emailTo"
                    placeholder="john@email.com"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Processar
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
