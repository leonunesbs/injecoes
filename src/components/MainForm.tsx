// app/components/MainForm.tsx
'use client';

import { ReactNode, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TbFileTypeCsv, TbFileTypeXls } from 'react-icons/tb';

import { processFiles } from '@/utils/fileProcessors';
import { getPatientData } from '@/utils/getInjections';
import { createPdfFromData, createPdfUrl } from '@/utils/pdfGenerator';
import { sortPdfPages } from '@/utils/pdfSorter';
import { ProcessButton } from './ProcessButton';

interface MainFormProps {
  children?: ReactNode;
}

type Inputs = {
  uploadedData: FileList;
};

export type MainFormData = {
  patientId: string;
  patientName: string;
  staffName: string;
  treatmentType: string;
  procedureDate: string;
  remainingOD?: number;
  remainingOS?: number;
  isRegistered: boolean;
  nextEye: string; // 'OD' or 'OS'
  // other fields...
};

export function MainForm({}: MainFormProps) {
  const { register, handleSubmit, reset } = useForm<Inputs>({});
  const [url, setUrl] = useState('');
  const [processedData, setProcessedData] = useState<MainFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  async function sortAndSavePdf(processedData: MainFormData[]): Promise<Uint8Array> {
    const modelPDFBytes = await fetch('/modelo.pdf').then((res) => res.arrayBuffer());
    const pdfDoc = await createPdfFromData(processedData, modelPDFBytes);
    const sortedPdf = await sortPdfPages(pdfDoc);
    return sortedPdf.save();
  }

  const onSubmit: SubmitHandler<Inputs> = async ({ uploadedData }) => {
    setLoading(true);
    const data = await processFiles(uploadedData);

    const updatedData = await Promise.all(
      data.map(async (item) => {
        const patient = await getPatientData(item.patientId);
        let nextEye = '';
        const remainingOD = patient?.remainingOD;
        const remainingOS = patient?.remainingOS;
        const isRegistered = patient != null;

        if (patient) {
          const lastInjection = patient.injections[0];

          if (lastInjection) {
            // Determine the next eye, which is contralateral to the last injection
            if (lastInjection.OD > 0) {
              nextEye = 'OS';
            } else if (lastInjection.OS > 0) {
              nextEye = 'OD';
            } else {
              // If last injection has both OD and OS zero, default to startOD
              nextEye = patient.startOD ? 'OD' : 'OS';
            }
          } else {
            // No last injection, use startOD
            nextEye = patient.startOD ? 'OD' : 'OS';
          }
        } else {
          // Patient not registered, default nextEye to empty string or some default value
          nextEye = '';
        }

        return {
          ...item,
          remainingOD,
          remainingOS,
          isRegistered,
          nextEye,
        };
      })
    );
    setProcessedData(updatedData);

    // Extract staffName and treatmentType from the first entry, if available
    if (data.length > 0) {
      setStaffName(data[0].staffName);
      setTreatmentType(data[0].treatmentType);
    }

    setLoading(false);
    modalRef.current?.showModal();
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    modalRef.current?.close();
    setLoading(true);

    // Update all staffName and treatmentType fields with current values
    const updatedData = processedData.map((item) => ({
      ...item,
      staffName: staffName,
      treatmentType: treatmentType,
    }));
    const sortedPdfBytes = await sortAndSavePdf(updatedData);
    const pdfUrl = createPdfUrl(sortedPdfBytes);
    setUrl(pdfUrl);
    setLoading(false);
    setIsProcessing(false);
    openButtonRef.current?.focus();
  };

  const handleClose = () => {
    modalRef.current?.close();
    openButtonRef.current?.focus();
  };

  const handleStaffNameChange = (value: string) => {
    setStaffName(value);
  };

  const handleTreatmentTypeChange = (value: string) => {
    setTreatmentType(value);
  };

  const handleNewReport = () => {
    // Reset all states to initial values
    setUrl('');
    setProcessedData([]);
    setIsProcessing(false);
    setLoading(false);
    setStaffName('');
    setTreatmentType('');
    reset();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        aria-label="Formulário principal para upload de dados"
      >
        <div className="form-control">
          <div className="flex justify-between">
            <label htmlFor="uploadedData" className="label label-text font-semibold">
              Arquivo XLS, XLSX ou CSV:
            </label>
            <div className="flex items-center space-x-2 mt-2">
              <TbFileTypeXls className="h-6 w-6" aria-hidden="true" focusable="false" />
              <TbFileTypeCsv className="h-6 w-6" aria-hidden="true" focusable="false" />
            </div>
          </div>
          <input
            {...register('uploadedData', {
              onChange: () => {
                setLoading(false);
                setUrl('');
                setProcessedData([]);
                setStaffName('');
                setTreatmentType('');
              },
            })}
            type="file"
            id="uploadedData"
            accept=".xls,.xlsx,.csv"
            className="file-input file-input-bordered w-full"
            required
            aria-required="true"
            aria-describedby="fileHelp"
          />
          <small id="fileHelp" className="text-gray-500">
            Selecione o arquivo contendo os dados dos pacientes.
          </small>
        </div>
        <ProcessButton
          loading={loading || isProcessing}
          url={url}
          onEdit={() => modalRef.current?.showModal()}
          onNewReport={handleNewReport}
          openButtonRef={openButtonRef}
        />
      </form>

      {/* Modal */}
      <dialog
        ref={modalRef}
        className="modal"
        aria-modal="true"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <form method="dialog" className="modal-box w-full max-w-5xl" onSubmit={(e) => e.preventDefault()}>
          <h3 id="modalTitle" className="font-bold text-xl mb-4 text-center">
            Verifique e Edite os Dados
          </h3>

          {/* Campo Nome do Profissional */}
          <div className="mb-4">
            <label htmlFor="staffName" className="font-semibold">
              Nome do Profissional
            </label>
            <input
              id="staffName"
              type="text"
              value={staffName}
              onChange={(e) => handleStaffNameChange(e.target.value)}
              className="input input-bordered w-full"
              aria-describedby="staffNameHelp"
            />
            <small id="staffNameHelp" className="text-gray-500">
              Este campo será aplicado a todas as entradas.
            </small>
          </div>

          {/* Campo Tipo de Tratamento */}
          <div className="mb-4">
            <label htmlFor="treatmentType" className="font-semibold">
              Tipo de Tratamento
            </label>
            <input
              id="treatmentType"
              type="text"
              value={treatmentType}
              onChange={(e) => handleTreatmentTypeChange(e.target.value)}
              className="input input-bordered w-full"
              aria-describedby="treatmentTypeHelp"
            />
            <small id="treatmentTypeHelp" className="text-gray-500">
              Este campo será aplicado a todas as entradas.
            </small>
          </div>

          {/* Tabela de Dados */}
          <div className="overflow-x-auto" role="region" aria-label="Tabela de dados dos pacientes">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="w-24">ID do Paciente</th>
                  <th className="w-48">Nome do Paciente</th>
                  <th>Injeções Restantes OD</th>
                  <th>Injeções Restantes OS</th>
                  <th>Próximo Olho</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.patientId}</td>
                    <td>{data.patientName}</td>
                    <td>
                      {data.isRegistered ? (
                        <span className="badge badge-info">{data.remainingOD}</span>
                      ) : (
                        <span className="text-gray-500 italic">Não cadastrado</span>
                      )}
                    </td>
                    <td>
                      {data.isRegistered ? (
                        <span className="badge badge-info">{data.remainingOS}</span>
                      ) : (
                        <span className="text-gray-500 italic">Não cadastrado</span>
                      )}
                    </td>
                    <td>
                      {data.isRegistered ? (
                        <span>{data.nextEye}</span>
                      ) : (
                        <span className="text-gray-500 italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Rodapé com informação total de pacientes */}
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={4} className="text-right">
                    Total de Pacientes:
                  </td>
                  <td className="text-center">{processedData.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="modal-action flex justify-end items-center mt-6">
            <button type="button" className="btn btn-ghost" onClick={handleClose} aria-label="Cancelar e fechar modal">
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleProcess}
              aria-label="Processar dados e gerar relatório"
            >
              Processar
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
