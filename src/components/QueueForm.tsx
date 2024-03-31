import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import CSVReader from 'react-csv-reader';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Data } from '@/app/page';
import { AdvancedConfig } from './AdvancedConfig';
import { FillPdf } from './FillPdf';

interface QueueFormProps {
  queuedData: Data[];
  setQueuedData: Dispatch<SetStateAction<Data[]>>;
}

export function QueueForm({ queuedData, setQueuedData }: QueueFormProps) {
  const [position, setPosition] = useState({
    startLine: 4,
    idColumn: 0,
    patientColumn: 2,
    staffColumn: 5,
  });
  const { register, handleSubmit, reset, getValues } = useForm<{
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
    [position, getValues, setQueuedData]
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
    <>
      <div className="form-control">
        <CSVReader
          onFileLoaded={handleCsvData}
          parserOptions={{ header: false, skipEmptyLines: true }}
          inputId="csv-reader-input"
          inputStyle={{ display: 'none' }}
        />
        {!queuedData.length ? (
          <label htmlFor="csv-reader-input" className="btn btn-primary">
            Upload CSV
          </label>
        ) : (
          <label htmlFor="csv-reader-input" className="btn btn-disabled">
            Dados carregados!
          </label>
        )}
      </div>
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

        <div className="join">
          <button type="submit" className="btn btn-primary join-item">
            Adicionar
          </button>

          <FillPdf queuedData={queuedData} />
        </div>
      </form>
    </>
  );
}
