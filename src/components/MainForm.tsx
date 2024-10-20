// src/app/components/MainForm.tsx
'use client';

import { ReactNode, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TbFileTypeCsv, TbFileTypeXls } from 'react-icons/tb';

import { processFiles } from '@/utils/fileProcessors';
import { getPatientsData, updatePatientInjections } from '@/utils/manageInjections';
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
};

export function MainForm({}: MainFormProps) {
  const { register, handleSubmit, reset } = useForm<Inputs>({});
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const [processedData, setProcessedData] = useState<MainFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Ordena e salva o PDF com os dados processados.
   * @param processedData - A lista de dados dos pacientes.
   * @returns Os bytes do PDF ordenado.
   */
  async function sortAndSavePdf(processedData: MainFormData[]): Promise<Uint8Array> {
    const modelPDFBytes = await fetch('/modelo.pdf').then((res) => res.arrayBuffer());
    const pdfDoc = await createPdfFromData(processedData, modelPDFBytes);
    const sortedPdf = await sortPdfPages(pdfDoc);
    return sortedPdf.save();
  }

  /**
   * Função chamada ao submeter o formulário.
   * Processa os arquivos, obtém os dados dos pacientes e prepara para a visualização.
   * @param uploadedData - Os arquivos carregados pelo usuário.
   */
  const onSubmit: SubmitHandler<Inputs> = async ({ uploadedData }) => {
    setLoading(true);
    const data = await processFiles(uploadedData);

    const updatedData = await getPatientsData(data.map((item) => item.patientId)).then((patients) => {
      return data.map((item) => {
        const patient = patients.find((p) => p.patientId === item.patientId);
        let nextEye = '';
        const remainingOD = patient?.remainingOD;
        const remainingOS = patient?.remainingOS;
        const isRegistered = patient != null;

        if (patient) {
          const lastInjection = patient.injections[0];

          if (lastInjection) {
            // Determinar o próximo olho, contralateral ao último aplicado
            if (lastInjection.OD > 0) {
              nextEye = 'OS';
            } else if (lastInjection.OS > 0) {
              nextEye = 'OD';
            } else {
              // Se ambas as injeções estiverem zero, usar startOD
              nextEye = patient.startOD ? 'OD' : 'OS';
            }
          } else {
            // Sem última aplicação, usar startOD
            nextEye = patient.startOD ? 'OD' : 'OS';
          }
        } else {
          // Paciente não cadastrado
          nextEye = '';
        }

        return {
          ...item,
          remainingOD,
          remainingOS,
          isRegistered,
          nextEye,
        };
      });
    });

    setProcessedData(updatedData);

    // Extrair staffName e treatmentType da primeira entrada, se disponível
    if (data.length > 0) {
      setStaffName(data[0].staffName);
      setTreatmentType(data[0].treatmentType);
    }

    setLoading(false);
    modalRef.current?.showModal();
  };

  /**
   * Função chamada ao clicar no botão "Processar".
   * Atualiza as injeções restantes e cria registros de injeção no banco de dados.
   */
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

    try {
      // Para cada paciente, debitar a injeção no olho correto e criar um registro
      await Promise.all(
        updatedData.map(async (item) => {
          if (item.isRegistered && item.nextEye) {
            await updatePatientInjections(item.patientId, item.nextEye as 'OD' | 'OS');
          }
        })
      );

      // Gerar o PDF
      const sortedPdfBytes = await sortAndSavePdf(updatedData);

      // Criar a URL do Blob para visualização
      const pdfBlobUrl = createPdfUrl(sortedPdfBytes);
      setBlobUrl(pdfBlobUrl);
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao processar os dados dos pacientes.');
    } finally {
      setLoading(false);
      setIsProcessing(false);
      openButtonRef.current?.focus();
    }
  };

  /**
   * Função para fechar o modal.
   */
  const handleClose = () => {
    modalRef.current?.close();
    openButtonRef.current?.focus();
  };

  /**
   * Função para lidar com mudanças no campo "Nome do Profissional".
   * @param value - O novo valor do campo.
   */
  const handleStaffNameChange = (value: string) => {
    setStaffName(value);
  };

  /**
   * Função para lidar com mudanças no campo "Tipo de Tratamento".
   * @param value - O novo valor do campo.
   */
  const handleTreatmentTypeChange = (value: string) => {
    setTreatmentType(value);
  };

  /**
   * Função para iniciar um novo relatório.
   */
  const handleNewReport = () => {
    // Resetar todos os estados para os valores iniciais
    setBlobUrl(undefined);
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
              <TbFileTypeXls className="h-6 w-6" aria-hidden="true" />
              <TbFileTypeCsv className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <input
            {...register('uploadedData', {
              onChange: () => {
                setLoading(false);
                setBlobUrl(undefined); // Resetar a URL do Blob ao carregar um novo arquivo
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
          url={blobUrl}
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
