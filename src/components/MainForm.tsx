'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TbFileTypeCsv, TbFileTypeXls } from 'react-icons/tb';

import { Data } from '@/app/page';
import { processFiles } from '@/utils/fileProcessors';
import { createPdfFromData, createPdfUrl } from '@/utils/pdfGenerator';
import { sortPdfPages } from '@/utils/pdfSorter';
import { ProcessButton } from './ProcessButton';
import { ProgressBar } from './ProgressBar';

interface MainFormProps {
  children?: ReactNode;
}

type Inputs = {
  uploadedData: FileList;
};

export function MainForm({}: MainFormProps) {
  const { register, handleSubmit, reset } = useForm<Inputs>({});
  const [url, setUrl] = useState('');
  const [processedData, setProcessedData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [treatmentType, setTreatmentType] = useState(''); // Adiciona o estado para tratamento
  const modalRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  async function sortAndSavePdf(processedData: Data[]): Promise<Uint8Array> {
    const modelPDFBytes = await fetch('/modelo.pdf').then((res) => res.arrayBuffer());
    const pdfDoc = await createPdfFromData(processedData, modelPDFBytes);
    const sortedPdf = await sortPdfPages(pdfDoc);
    return sortedPdf.save();
  }

  const onSubmit: SubmitHandler<Inputs> = async ({ uploadedData }) => {
    setLoading(true);
    const data = await processFiles(uploadedData);
    setProcessedData(data);

    // Extrair staffName e treatmentType da primeira entrada, se disponível
    if (data.length > 0) {
      setStaffName(data[0].staffName);
      setTreatmentType(data[0].treatmentType); // Define o tipo de tratamento para todas as entradas
    }

    setLoading(false);
    modalRef.current?.showModal();
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    modalRef.current?.close();
    setLoading(true);

    // Atualizar todos os campos staffName e treatmentType com os valores atuais
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

  const handleInputChange = (index: number, field: keyof Data, value: string) => {
    setProcessedData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleStaffNameChange = (value: string) => {
    setStaffName(value);
  };

  const handleTreatmentTypeChange = (value: string) => {
    setTreatmentType(value);
  };

  const handleNewReport = () => {
    // Redefinir todos os estados para os valores iniciais
    setUrl('');
    setProcessedData([]);
    setIsProcessing(false);
    setLoading(false);
    setStaffName('');
    setTreatmentType(''); // Resetar o tratamento
    reset(); // Redefinir o formulário
  };

  // Gerenciar o foco quando o modal é aberto
  useEffect(() => {
    if (modalRef.current && modalRef.current.open) {
      const firstInput = modalRef.current.querySelector('#staffName') as HTMLInputElement;
      firstInput?.focus();
    }
  }, [modalRef.current?.open]);

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
                setTreatmentType(''); // Resetar o tratamento
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
        <ProgressBar loading={loading || isProcessing} />
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
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>ID do Paciente</th>
                  <th>Nome do Paciente</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((data, index) => (
                  <tr key={index}>
                    <td>
                      <label htmlFor={`patientId-${index}`} className="sr-only">
                        ID do Paciente
                      </label>
                      <input
                        id={`patientId-${index}`}
                        type="text"
                        value={data.patientId}
                        onChange={(e) => handleInputChange(index, 'patientId', e.target.value)}
                        className="input input-bordered input-sm w-full"
                      />
                    </td>
                    <td>
                      <label htmlFor={`patientName-${index}`} className="sr-only">
                        Nome do Paciente
                      </label>
                      <input
                        id={`patientName-${index}`}
                        type="text"
                        value={data.patientName}
                        onChange={(e) => handleInputChange(index, 'patientName', e.target.value)}
                        className="input input-bordered input-sm w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
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
