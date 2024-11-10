// src/app/components/MainForm.tsx
'use client';

import { ReactNode, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TbFileTypeCsv, TbFileTypeXls } from 'react-icons/tb';

import { processFiles } from '@/utils/fileProcessors';
import { determineNextEye, getPatientsData, updatePatientInjections } from '@/utils/manageInjections';
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
  refId: string;
  patientName: string;
  staffName: string;
  treatmentType: string;
  procedureDate: string;
  remainingOD?: number;
  remainingOS?: number;
  isRegistered: boolean;
  nextEye: string; // 'OD' or 'OS' or ''
};

export function MainForm({}: MainFormProps) {
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const [processedData, setProcessedData] = useState<MainFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);
  const confirmModalRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Função para processar os dados de pacientes carregados
   * @param uploadedData - Dados carregados pelo usuário
   * @returns Array de dados processados dos pacientes
   */
  const processPatientData = async (uploadedData: any[]): Promise<MainFormData[]> => {
    const patients = await getPatientsData(uploadedData.map((item) => item.refId));

    return uploadedData.map((item) => {
      const patient = patients.find((p) => p.refId === item.refId);

      const nextEye = patient ? determineNextEye(patient) : '';

      return {
        ...item,
        remainingOD: patient?.remainingOD,
        remainingOS: patient?.remainingOS,
        isRegistered: !!patient,
        nextEye,
      };
    });
  };

  /**
   * Função chamada ao submeter o formulário.
   * @param uploadedData - Arquivos carregados pelo usuário
   */
  const onSubmit: SubmitHandler<Inputs> = async ({ uploadedData }) => {
    setLoading(true);
    try {
      const data = await processFiles(uploadedData);
      const updatedData = await processPatientData(data);

      if (data.length > 0) {
        setStaffName(data[0].staffName);
        setTreatmentType(data[0].treatmentType);
      }

      setProcessedData(updatedData);
      modalRef.current?.showModal();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para ordenar e salvar o PDF processado
   * @param processedData - Dados processados dos pacientes
   */
  const sortAndSavePdf = async (processedData: MainFormData[]): Promise<Uint8Array> => {
    const modelPDFBytes = await fetch('/modelo.pdf').then((res) => res.arrayBuffer());
    const pdfDoc = await createPdfFromData(processedData, modelPDFBytes);
    const sortedPdf = await sortPdfPages(pdfDoc);
    return sortedPdf.save();
  };

  /**
   * Função para processar as injeções e gerar PDF após confirmação
   */
  const handleConfirmProcess = async () => {
    confirmModalRef.current?.close();
    setLoading(true);
    const updatedData = processedData.map((item) => ({
      ...item,
      staffName,
      treatmentType,
    }));

    try {
      interface UpdatedDataItem extends MainFormData {
        staffName: string;
        treatmentType: string;
      }

      await Promise.all(
        updatedData.map(async (item: UpdatedDataItem) => {
          if (item.isRegistered && item.nextEye) {
            await updatePatientInjections(item.refId, item.nextEye as 'OD' | 'OS');
          }
        })
      );

      const sortedPdfBytes = await sortAndSavePdf(updatedData);
      const pdfBlobUrl = createPdfUrl(sortedPdfBytes);
      setBlobUrl(pdfBlobUrl);
    } catch (error) {
      console.error('Erro ao processar os dados dos pacientes:', error);
      alert('Ocorreu um erro ao processar os dados.');
    } finally {
      setLoading(false);
      setIsProcessing(false);
      openButtonRef.current?.focus();
    }
  };

  const handleProcess = () => {
    modalRef.current?.close();
    confirmModalRef.current?.showModal();
  };

  const handleClose = () => {
    modalRef.current?.close();
    openButtonRef.current?.focus();
  };

  const handleCloseConfirm = () => {
    confirmModalRef.current?.close();
    modalRef.current?.showModal();
  };

  const resetForm = () => {
    setBlobUrl(undefined);
    setProcessedData([]);
    setIsProcessing(false);
    setLoading(false);
    setStaffName('');
    setTreatmentType('');
    reset();
  };
  const handleNewReport = () => {
    resetForm();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-control">
          <div className="flex justify-between mb-2">
            <label htmlFor="uploadedData" className="label label-text font-semibold">
              Arquivo XLS, XLSX ou CSV:
            </label>
            <div className="flex items-center space-x-2 mt-2">
              <TbFileTypeXls className="h-6 w-6" aria-hidden="true" />
              <TbFileTypeCsv className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <input
            {...register('uploadedData')}
            type="file"
            id="uploadedData"
            accept=".xls,.xlsx,.csv"
            className="file-input file-input-bordered w-full"
            required
            aria-required="true"
          />
          <small id="fileHelp" className="text-gray-500">
            Selecione o arquivo contendo os dados dos pacientes.
          </small>
        </div>
        <ProcessButton
          loading={loading || isProcessing}
          url={blobUrl}
          onNewReport={handleNewReport}
          openButtonRef={openButtonRef}
        />
      </form>

      {/* Modal Inicial */}
      <dialog ref={modalRef} className="modal">
        <form method="dialog" className="modal-box w-full max-w-5xl">
          <h3 className="font-bold text-xl mb-4 text-center">Verifique e Edite os Dados</h3>
          <div className="mb-4">
            <label htmlFor="staffName" className="font-semibold">
              Nome do Profissional
            </label>
            <input
              id="staffName"
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="treatmentType" className="font-semibold">
              Tipo de Tratamento
            </label>
            <input
              id="treatmentType"
              type="text"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ID do Paciente</th>
                  <th>Nome do Paciente</th>
                  <th>Injeções Restantes OD</th>
                  <th>Injeções Restantes OS</th>
                  <th>Próximo Olho</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((data, index) => {
                  const isLastInjection = (data.remainingOD || 0) + (data.remainingOS || 0) === 1;
                  const lastInjectionEye = data.remainingOD === 1 ? 'OD' : data.remainingOS === 1 ? 'OS' : '';

                  const nextEyeStatus =
                    data.remainingOD === 0 && data.remainingOS === 0
                      ? 'Finalizou'
                      : (data.remainingOD ?? 0) < 0 || (data.remainingOS ?? 0) < 0
                        ? 'Erro'
                        : isLastInjection
                          ? `Última (${lastInjectionEye})`
                          : data.nextEye || 'N/A';

                  return (
                    <tr key={index}>
                      <td>{data.refId}</td>
                      <td>{data.patientName}</td>
                      <td>{data.remainingOD ?? <span className="text-gray-500 italic">Não cadastrado</span>}</td>
                      <td>{data.remainingOS ?? <span className="text-gray-500 italic">Não cadastrado</span>}</td>
                      <td>
                        <span className={nextEyeStatus === 'Erro' ? 'text-red-600 font-bold' : ''}>
                          {nextEyeStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="text-right font-bold">
                    Número de pacientes programados: {processedData.length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleProcess}>
              Processar
            </button>
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Modal de Confirmação */}
      <dialog ref={confirmModalRef} className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-xl mb-4 text-center">Confirmação de Processamento</h3>
          <p className="text-center mb-4">
            Tem certeza que deseja processar os dados? <strong>Esta ação é irreversível</strong> e todos os pacientes
            terão as injeções processadas e todos os registros atualizados.
          </p>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleCloseConfirm}>
              Voltar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmProcess}>
              Confirmar
            </button>
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
