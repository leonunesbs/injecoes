'use client';

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { useState } from 'react';
import CSVReader from 'react-csv-reader';

export default function Home() {
  const [csvData, setCsvData] = useState<any>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    staffName: '',
    procedureDate: '',
    treatmentType: '',
  });

  const handleCsvData = (data: any) => {
    const processedData = data.slice(4).map((row: any) => [row[0], row[2], row[5]]);
    setCsvData(processedData);
  };

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    const newEntry = [
      formData.patientId,
      formData.patientName.toUpperCase(),
      formData.staffName.toUpperCase(),
      formData.procedureDate,
      formData.treatmentType,
    ];
    setCsvData([...csvData, newEntry]);
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fillPdfTemplateWithData = async (data: any) => {
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

    const patientId: string = data[0];
    const patientName: string = data[1];
    const staffName: string = data[2];
    const procedureDate = new Date();
    const today = procedureDate.toLocaleDateString('pt-br', {
      dateStyle: 'short',
    });

    console.log(formData);

    // Preencher página 1
    pages[0].drawText(patientName.toUpperCase(), { x: 100, y: 633 });
    pages[0].drawText(patientId, { x: 475, y: 633 });
    pages[0].drawText(today, { x: 53, y: 483 });
    pages[0].drawText(today, { x: 215, y: 483 });
    pages[0].drawText(today, { x: 60, y: 110 });
    pages[0].drawText(formData.treatmentType, { x: 50, y: 300 });

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
    for (let i = 0; i < csvData.length; i++) {
      const data = csvData[i];
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
    <main className="py-10 px-4 space-y-10">
      <h1 className="font-bold text-2xl">Injeções</h1>
      <form onSubmit={handleFormSubmit} className="form-control max-w-md space-y-2">
        <div className="form-control">
          <label htmlFor="patientId">Número do prontuário:</label>
          <input
            onChange={handleInputChange}
            type="text"
            id="patientId"
            name="patientId"
            className="input input-bordered"
            placeholder="998877"
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="patientName">Nome do paciente:</label>
          <input
            onChange={handleInputChange}
            type="text"
            id="patientName"
            name="patientName"
            className="input input-bordered"
            placeholder="Fulano de Souza"
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="staffName">Nome do staff:</label>
          <input
            onChange={handleInputChange}
            type="text"
            id="staffName"
            name="staffName"
            className="input input-bordered"
            required
            placeholder="João da Silva"
          />
        </div>
        <div className="form-control">
          <label htmlFor="procedureDate">Data do procedimento:</label>
          <input
            onChange={handleInputChange}
            type="date"
            name="procedureDate"
            id="procedureDate"
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="treatmentType">Tipo de tratamento:</label>
          <select
            className="select select-bordered"
            onChange={handleInputChange}
            id="treatmentType"
            name={'treatmentType'}
          >
            <option disabled selected>
              Selecione uma opção
            </option>
            <option id={'treatmentType'} value="INJEÇÃO INTRAVÍTREA DE AVASTIN">
              Avastin
            </option>
            <option id={'treatmentType'} value="INJEÇÃO INTRAVÍTREA DE EYLIA">
              Eylia
            </option>
          </select>
        </div>
        <div className="form-control">
          <CSVReader
            onFileLoaded={handleCsvData}
            parserOptions={{ header: false, skipEmptyLines: true }}
            inputId="csv-reader-input"
            inputStyle={{ display: 'none' }}
          />
          <label htmlFor="csv-reader-input" className="btn btn-primary">
            Upload CSV
          </label>
        </div>
        <div>
          <button type="submit" className="btn btn-primary">
            Adicionar
          </button>
        </div>
      </form>
      {csvData.length > 0 && (
        <div>
          <h2 className="font-bold text-xl">Dados do CSV:</h2>
          <ul>
            {csvData.map((row: any, index: any) => (
              <li key={index}>{row.join(', ')}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={fillPDF} className="btn btn-primary">
        Preencher e Converter PDF
      </button>
    </main>
  );
}
