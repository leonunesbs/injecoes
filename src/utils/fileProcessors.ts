import { parse as parseCSV, ParseResult } from 'papaparse';
import * as XLSX from 'xlsx';

export interface Data {
  refId: string;
  patientName: string;
  staffName: string;
  procedureDate: string;
  treatmentType: string;
}

const startRow = 0;

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

    for (const row of rows.slice(startRow)) {
      const [refId, , patientName, , , staffName, , procedureDate, , , treatmentType, status] = row;
      console.log(status);
      if (status === 'CANCELADO') {
        continue;
      }
      // descarta linhas sem refId ou com refId não numérico
      if (!refId || isNaN(Number(refId))) {
        continue;
      }

      processedData.push({
        refId: typeof refId === 'number' ? String(refId) : refId,
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
