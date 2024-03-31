'use client';

import { useCallback, useState } from 'react';
import CSVReader from 'react-csv-reader';
import { SubmitHandler, useForm } from 'react-hook-form';

import { AdvancedConfig, FillPdf } from '@/components';

export interface Data {
  patientId: string;
  patientName: string;
  staffName: string;
  procedureDate: string;
  treatmentType: string;
}

export default function Home() {
  const [position, setPosition] = useState({
    startLine: 4,
    idColumn: 0,
    patientColumn: 2,
    staffColumn: 5,
  });
  const [queuedData, setQueuedData] = useState<Data[]>([]);
  const { register, handleSubmit, getValues, reset } = useForm<{
    patientId: string;
    patientName: string;
    staffName: string;
    procedureDate: string;
    treatmentType: string;
  }>({
    defaultValues: {
      procedureDate: new Date().toISOString().split('T')[0],
      treatmentType: 'INJEÇÃO INTRAVÍTREA DE AVASTIN',
    },
  });

  const handleCsvData = useCallback(
    (data: any) => {
      const processedData = data.slice(position.startLine).map((row: any) => ({
        patientId: row[position.idColumn],
        patientName: row[position.patientColumn],
        staffName: row[position.staffColumn],
        procedureDate: getValues('procedureDate'),
        treatmentType: getValues('treatmentType'),
      }));
      setQueuedData(processedData);
    },
    [position, getValues]
  );

  const onSubmit: SubmitHandler<{
    patientId: string;
    patientName: string;
    staffName: string;
    procedureDate: string;
    treatmentType: string;
  }> = (data) => {
    const newEntry: Data = {
      ...data,
    };
    setQueuedData([...queuedData, newEntry]);
    reset();
  };

  return (
    <main className="py-10 px-4 space-y-10">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="form-control">
            <CSVReader
              onFileLoaded={handleCsvData}
              parserOptions={{ header: false, skipEmptyLines: true }}
              inputId="csv-reader-input"
              inputStyle={{ display: 'none' }}
            />
            {!queuedData.length ? (
              <label htmlFor="csv-reader-input" className="btn btn-primary">
                1. Upload CSV
              </label>
            ) : (
              <label htmlFor="csv-reader-input" className="btn btn-disabled">
                Dados carregados
              </label>
            )}
          </div>
          {queuedData.length > 0 && (
            <div className="overflow-x-auto max-h-96">
              <table className="table bg-base-200">
                <thead>
                  <tr>
                    <th>N prontuário</th>
                    <th>Nome do paciente</th>
                    <th>Nome do staff</th>
                    <th>Data do procedimento</th>
                    <th>Tipo de tratamento</th>
                  </tr>
                </thead>
                <tbody>
                  {queuedData.map(({ patientId, patientName, staffName, procedureDate, treatmentType }) => (
                    <tr key={patientId}>
                      <td>{patientId}</td>
                      <td>{patientName}</td>
                      <td>{staffName}</td>
                      <td>{procedureDate}</td>
                      <td>{treatmentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h1 className="font-bold text-2xl">Injeções</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="form-control max-w-md space-y-2">
            <div className="form-control">
              <label htmlFor="patientId">Número do prontuário:</label>
              <input
                {...register('patientId')}
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
                {...register('patientName')}
                type="text"
                className="input input-bordered"
                placeholder="Fulano de Souza"
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="staffName">Nome do staff:</label>
              <input
                {...register('staffName')}
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
              <input {...register('procedureDate')} type="date" className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label htmlFor="treatmentType">Tipo de tratamento:</label>
              <select className="select select-bordered" {...register('treatmentType')}>
                <option value="INJEÇÃO INTRAVÍTREA DE AVASTIN">Avastin</option>
                <option value="INJEÇÃO INTRAVÍTREA DE EYLIA">Eylia</option>
              </select>
            </div>
            <AdvancedConfig position={position} setPosition={setPosition} />

            <div>
              <button type="submit" className="btn btn-primary">
                2. Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
      <FillPdf queuedData={queuedData} />
    </main>
  );
}
