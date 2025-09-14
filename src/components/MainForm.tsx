// src/app/components/MainForm.tsx
'use client';

import { ReactNode, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TbFileTypeCsv, TbFileTypeXls } from 'react-icons/tb';

import { processFiles } from '@/utils/fileProcessors';
import { determineNextEye, getPatientsData, updateMultiplePatientInjections } from '@/utils/manageInjections';
import { createPdfFromData, createPdfUrl } from '@/utils/pdfGenerator';
import { sortPdfPages } from '@/utils/pdfSorter';
import { ProcessButton } from './ProcessButton';

interface MainFormProps {
  children?: ReactNode;
}

type Inputs = {
  uploadedData: FileList;
  pdfModel: string;
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
  nextEye: 'OD' | 'OS' | '';
};

export function MainForm({}: MainFormProps) {
  const { register, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: {
      pdfModel: 'modelo-ofta.pdf',
    },
  });
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const [processedData, setProcessedData] = useState<MainFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const [selectedPdfModel, setSelectedPdfModel] = useState('modelo-ofta.pdf');
  const modalRef = useRef<HTMLDialogElement>(null);
  const confirmModalRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Função para processar os dados de pacientes carregados
   * @param uploadedData - Dados carregados pelo usuário
   * @returns Array de dados processados dos pacientes
   */
  const processPatientData = async (uploadedData: MainFormData[]): Promise<MainFormData[]> => {
    const patients = await getPatientsData(uploadedData.map((item) => item.refId));

    const processedData = await Promise.all(
      uploadedData.map(async (item) => {
        const patient = patients.find((p) => p.refId === item.refId);

        // Usar a função determineNextEye com refId
        const nextEye = patient ? await determineNextEye(item.refId) : '';

        return {
          ...item,
          remainingOD: patient?.remainingOD,
          remainingOS: patient?.remainingOS,
          isRegistered: !!patient,
          nextEye,
        };
      })
    );

    return processedData;
  };

  /**
   * Função chamada ao submeter o formulário.
   * @param uploadedData - Arquivos carregados pelo usuário
   * @param pdfModel - Modelo de PDF selecionado
   */
  const onSubmit: SubmitHandler<Inputs> = async ({ uploadedData, pdfModel }) => {
    setLoading(true);
    setSelectedPdfModel(pdfModel);
    try {
      const data = await processFiles(uploadedData);

      if (data.length > 0) {
        setStaffName(data[0].staffName);
        setTreatmentType(data[0].treatmentType);
      }

      // Processar os dados dos pacientes usando determineNextEye
      const processedPatients = await processPatientData(data as MainFormData[]);
      setProcessedData(processedPatients);

      modalRef.current?.showModal();
    } catch (error) {
      console.error('Erro ao processar os arquivos:', error);
      alert('Ocorreu um erro ao processar os arquivos.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para ordenar e salvar o PDF processado
   * @param processedData - Dados processados dos pacientes
   */
  const sortAndSavePdf = async (processedData: MainFormData[]): Promise<Uint8Array> => {
    const modelPDFBytes = await fetch(`/${selectedPdfModel}`).then((res) => res.arrayBuffer());
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
      await updateMultiplePatientInjections(updatedData);

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
    setSelectedPdfModel('modelo-ofta.pdf');
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

        <div className="form-control">
          <label htmlFor="pdfModel" className="label label-text font-semibold">
            Modelo de PDF:
          </label>
          <select
            {...register('pdfModel')}
            id="pdfModel"
            className="select select-bordered w-full"
            required
            aria-required="true"
          >
            <option value="modelo-ofta.pdf">Modelo Ofta</option>
            <option value="modelo-cristalia.pdf">Modelo Cristalia</option>
            <option value="modelo-generico.pdf">Modelo Genérico</option>
          </select>
          <small id="pdfModelHelp" className="text-gray-500">
            Selecione o modelo de PDF que será utilizado para gerar o relatório.
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
                  const totalRemaining = (data.remainingOD || 0) + (data.remainingOS || 0);
                  const isLastInjection = totalRemaining === 1;
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
                      <td>
                        {data.remainingOD !== undefined ? (
                          data.remainingOD
                        ) : (
                          <span className="text-gray-500 italic">Não cadastrado</span>
                        )}
                      </td>
                      <td>
                        {data.remainingOS !== undefined ? (
                          data.remainingOS
                        ) : (
                          <span className="text-gray-500 italic">Não cadastrado</span>
                        )}
                      </td>
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
          <button>Fechar</button>
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
          <button>Fechar</button>
        </form>
      </dialog>
    </>
  );
}
