import { parse as parseCSV, ParseResult } from 'papaparse';
import * as XLSX from 'xlsx';

import { Data } from '@/app/page';

export async function processFiles(file: FileList): Promise<Data[]> {
  const processedData: Data[] = [];

  async function readAndProcessFile(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let rows: string[][] = [];

    if (extension === 'csv') {
      const text = await file.text();
      const parsed = parseCSV(text, { header: true }) as ParseResult<string[]>;
      if (parsed.errors.length > 0) {
        alert('CSV parsing error');
        return false;
      }
      rows = parsed.data.map((row) => Object.values(row));
    } else if (extension === 'xls' || extension === 'xlsx') {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
    } else {
      alert('Unsupported file format');
      return false;
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

  // Ordena pelo nome do paciente (patientName)
  processedData.sort((a, b) => (a.patientName > b.patientName ? 1 : -1));

  return processedData;
}
