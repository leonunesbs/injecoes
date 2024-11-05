// components/PatientForm.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createOrUpdatePatient } from '@/utils/getInjections';
import { createPatientPdfBlob, fillPatientPdfTemplateWithData } from '../utils/patientPdfGenerator';

// Opções para Indicações, Medicações e Classificação Swalis
const indicationOptions = ['RD/EMD', 'RD/HV', 'DMRI', 'OV', 'MNVSR', 'Outros'];
const medicationOptions = ['Lucentis', 'Avastin', 'Eylia', 'Outro'];
const swalisOptions = ['A1', 'A2', 'B', 'C', 'D'];

// Map com as descrições das categorias Swalis
const swalisDescriptions: { [key: string]: string } = {
  A1: 'Paciente com risco de deterioração clínica iminente. Necessidade de hospitalização.',
  A2: 'Paciente com as atividades diárias completamente prejudicadas por dor, disfunção ou incapacidade. Risco de incurabilidade.',
  B: 'Paciente com prejuízo acentuado das atividades diárias por dor, disfunção ou incapacidade.',
  C: 'Paciente com prejuízo mínimo das atividades diárias por dor, disfunção ou incapacidade.',
  D: 'Não há prejuízo para as atividades diárias.',
};

// Map com as descrições das Indicações
const indicationDescriptions: { [key: string]: string } = {
  'RD/EMD': 'Edema macular diabético',
  'RD/HV': 'Hemorragia vítrea diabética',
  DMRI: 'Degeneração macular relacionada à idade',
  OV: 'Oclusão venosa',
  MNVSR: 'Membrana neovascular subretiniana',
};

const patientSchema = z
  .object({
    refId: z
      .string()
      .min(1, 'O ID do Paciente não pode ser vazio')
      .regex(/^\d+$/, 'O ID do Paciente deve ser um número natural')
      .transform((val) => val.replace(/^0+/, '')), // Remove zeros à esquerda
    name: z.string().min(1, 'O nome do paciente é obrigatório'),
    indication: z.string().min(1, 'A indicação é obrigatória'),
    indicationOther: z.string().optional(),
    medication: z.string().min(1, 'A medicação indicada é obrigatória'),
    medicationOther: z.string().optional(),
    swalisClassification: z.string().min(1, 'A Classificação Swalis é obrigatória'),
    swalisOther: z.string().optional(),
    observations: z.string().optional(),
    remainingODOption: z.string().min(1, 'Por favor, selecione uma opção').default('0'),
    remainingODCustom: z.number().min(0, 'Valor não pode ser negativo').optional(),
    remainingOSOption: z.string().min(1, 'Por favor, selecione uma opção').default('0'),
    remainingOSCustom: z.number().min(0, 'Valor não pode ser negativo').optional(),
    startEye: z.enum(['OD', 'OS']),
  })
  .superRefine((data, ctx) => {
    if (data.indication === 'Outros' && !data.indicationOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a indicação',
        path: ['indicationOther'],
      });
    }
    if (data.medication === 'Outro' && !data.medicationOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a medicação',
        path: ['medicationOther'],
      });
    }
    if (data.swalisClassification === 'Outros' && !data.swalisOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a classificação Swalis',
        path: ['swalisOther'],
      });
    }
    if (
      data.remainingODOption === 'Outro' &&
      (data.remainingODCustom === undefined || data.remainingODCustom === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a quantidade para OD',
        path: ['remainingODCustom'],
      });
    }
    if (
      data.remainingOSOption === 'Outro' &&
      (data.remainingOSCustom === undefined || data.remainingOSCustom === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor, especifique a quantidade para OS',
        path: ['remainingOSCustom'],
      });
    }
  });

type FormData = z.infer<typeof patientSchema>;

export function PatientForm() {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [modal, setModal] = useState<HTMLDialogElement | null>();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      refId: '',
      name: '',
      indication: 'RD/EMD',
      indicationOther: '',
      medication: 'Eylia',
      medicationOther: '',
      swalisClassification: 'A2',
      swalisOther: '',
      observations: '',
      remainingODOption: '0',
      remainingODCustom: undefined,
      remainingOSOption: '0',
      remainingOSCustom: undefined,
      startEye: 'OD',
    },
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const closeModal = useCallback(() => {
    if (modal) {
      modal.close();
      modal.classList.remove('modal-open');
    }
  }, [modal]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const newWindow = window.open('', '_blank');
    try {
      const indication = data.indication === 'Outros' ? data.indicationOther || '' : data.indication;
      const medication = data.medication === 'Outro' ? data.medicationOther || '' : data.medication;
      const swalisClassification =
        data.swalisClassification === 'Outros' ? data.swalisOther || '' : data.swalisClassification;

      const remainingOD =
        data.remainingODOption === 'Outro' ? data.remainingODCustom ?? 0 : parseInt(data.remainingODOption);
      const remainingOS =
        data.remainingOSOption === 'Outro' ? data.remainingOSCustom ?? 0 : parseInt(data.remainingOSOption);

      const patientData = {
        ...data,
        indication,
        medication,
        swalisClassification,
        remainingOD,
        remainingOS,
      };

      // Remove campos desnecessários
      delete patientData.indicationOther;
      delete patientData.medicationOther;
      delete patientData.swalisOther;
      delete patientData.remainingODCustom;
      delete patientData.remainingOSCustom;

      const modelPDFBytes = await fetch('/modeloAA.pdf').then((res) => res.arrayBuffer());
      const pdfBytes = await fillPatientPdfTemplateWithData(patientData, modelPDFBytes);
      const blobUrl = createPatientPdfBlob(pdfBytes);

      if (newWindow) {
        newWindow.location.href = blobUrl;
      } else {
        showToast('Por favor, permita pop-ups para visualizar o PDF.', 'error');
      }

      await createOrUpdatePatient(patientData);

      reset();
      showToast('Paciente salvo com sucesso!', 'success');
      closeModal();
    } catch (error) {
      console.error('Failed to submit:', error);
      showToast('Falha ao salvar o paciente.', 'error');
      if (newWindow) {
        newWindow.close();
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedSwalis = watch('swalisClassification');
  const selectedIndication = watch('indication');

  useEffect(() => {
    if (!modal && document) {
      setModal(document.getElementById('patient-form') as HTMLDialogElement);
    }
  }, [modal]);

  return (
    <div className="flex justify-end p-4">
      {toastMessage && (
        <div className={`toast toast-${toastType} fixed bottom-4 right-4 z-50`}>
          <div className={`alert alert-${toastType}`}>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary btn-outline"
        onClick={() => {
          modal?.showModal();
        }}
      >
        Novo Registro
      </button>

      <dialog
        id="patient-form"
        className="modal modal-open"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="modal-box max-w-2xl">
          <h3 id="modal-title" className="font-bold text-xl mb-4">
            Adicionar ou Atualizar Registro
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Paciente */}
              <div>
                <label className="label" htmlFor="name">
                  <span className="label-text font-semibold">Nome do Paciente</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="Nome do Paciente"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <span id="name-error" role="alert" className="text-error text-sm">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* ID do Paciente */}
              <div>
                <label className="label" htmlFor="refId">
                  <span className="label-text font-semibold">ID do Paciente</span>
                </label>
                <input
                  id="refId"
                  type="text"
                  {...register('refId')}
                  placeholder="ID do Paciente"
                  className={`input input-bordered w-full ${errors.refId ? 'input-error' : ''}`}
                  aria-invalid={!!errors.refId}
                  aria-describedby={errors.refId ? 'refId-error' : undefined}
                />
                {errors.refId && (
                  <span id="refId-error" role="alert" className="text-error text-sm">
                    {errors.refId.message}
                  </span>
                )}
              </div>
            </div>

            {/* Indicação */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Indicação</span>
              </label>
              <Controller
                name="indication"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {indicationOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => field.onChange(option)}
                          className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {field.value === 'Outros' && (
                      <input
                        type="text"
                        {...register('indicationOther')}
                        placeholder="Especifique a indicação"
                        className={`input input-bordered w-full mt-2 ${errors.indicationOther ? 'input-error' : ''}`}
                      />
                    )}
                  </>
                )}
              />
              {errors.indication && (
                <span id="indication-error" role="alert" className="text-error text-sm">
                  {errors.indication.message}
                </span>
              )}
              {errors.indicationOther && (
                <span id="indicationOther-error" role="alert" className="text-error text-sm">
                  {errors.indicationOther.message}
                </span>
              )}
              {selectedIndication && indicationDescriptions[selectedIndication] && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {indicationDescriptions[selectedIndication]}
                </p>
              )}
            </div>

            {/* Medicação Indicada */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Medicação Indicada</span>
              </label>
              <Controller
                name="medication"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {medicationOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => field.onChange(option)}
                          className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {field.value === 'Outro' && (
                      <input
                        type="text"
                        {...register('medicationOther')}
                        placeholder="Especifique a medicação"
                        className={`input input-bordered w-full mt-2 ${errors.medicationOther ? 'input-error' : ''}`}
                      />
                    )}
                  </>
                )}
              />
              {errors.medication && (
                <span id="medication-error" role="alert" className="text-error text-sm">
                  {errors.medication.message}
                </span>
              )}
              {errors.medicationOther && (
                <span id="medicationOther-error" role="alert" className="text-error text-sm">
                  {errors.medicationOther.message}
                </span>
              )}
            </div>

            {/* Classificação Swalis */}
            <div>
              <label className="label flex items-start justify-start">
                <span className="label-text font-semibold mr-2">Classificação Swalis</span>
                <Link
                  href="https://www.saude.ce.gov.br/wp-content/uploads/sites/9/2018/06/nota_tecnica_fluxo_acesso_cirurgias_eletivas_14_10_2020.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 26 24"
                    stroke="currentColor"
                    aria-label="Informações sobre Classificação Swalis"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M12 17h.01M12 12h.01M12 7h.01M12 6a9 9 0 100 18 9 9 0 000-18z"
                    />
                  </svg>
                </Link>
              </label>
              <Controller
                name="swalisClassification"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {swalisOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => field.onChange(option)}
                          className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {field.value === 'Outros' && (
                      <input
                        type="text"
                        {...register('swalisOther')}
                        placeholder="Especifique a classificação"
                        className={`input input-bordered w-full mt-2 ${errors.swalisOther ? 'input-error' : ''}`}
                      />
                    )}
                  </>
                )}
              />
              {errors.swalisClassification && (
                <span id="swalisClassification-error" role="alert" className="text-error text-sm">
                  {errors.swalisClassification.message}
                </span>
              )}
              {errors.swalisOther && (
                <span id="swalisOther-error" role="alert" className="text-error text-sm">
                  {errors.swalisOther.message}
                </span>
              )}
              {selectedSwalis && swalisDescriptions[selectedSwalis] && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{swalisDescriptions[selectedSwalis]}</p>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="label" htmlFor="observations">
                <span className="label-text font-semibold">Observações</span>
              </label>
              <textarea
                id="observations"
                {...register('observations')}
                placeholder="Observações"
                className={`textarea textarea-bordered w-full ${errors.observations ? 'textarea-error' : ''}`}
                aria-invalid={!!errors.observations}
                aria-describedby={errors.observations ? 'observations-error' : undefined}
              />
              {errors.observations && (
                <span id="observations-error" role="alert" className="text-error text-sm">
                  {errors.observations.message}
                </span>
              )}
            </div>

            {/* Injeções Restantes e Olho de Início */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Injeções Restantes OD */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Injeções (OD)</span>
                </label>
                <Controller
                  name="remainingODOption"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['0', '1', '2', '3', 'Outro'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => field.onChange(option)}
                            className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {field.value === 'Outro' && (
                        <input
                          type="number"
                          {...register('remainingODCustom', { valueAsNumber: true })}
                          placeholder="Quantidade"
                          className={`input input-bordered w-full mt-2 ${
                            errors.remainingODCustom ? 'input-error' : ''
                          }`}
                        />
                      )}
                    </>
                  )}
                />
                {errors.remainingODOption && (
                  <span id="remainingODOption-error" role="alert" className="text-error text-sm">
                    {errors.remainingODOption.message}
                  </span>
                )}
                {errors.remainingODCustom && (
                  <span id="remainingODCustom-error" role="alert" className="text-error text-sm">
                    {errors.remainingODCustom.message}
                  </span>
                )}
              </div>

              {/* Injeções Restantes OS */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Injeções (OS)</span>
                </label>
                <Controller
                  name="remainingOSOption"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['0', '1', '2', '3', 'Outro'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => field.onChange(option)}
                            className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {field.value === 'Outro' && (
                        <input
                          type="number"
                          {...register('remainingOSCustom', { valueAsNumber: true })}
                          placeholder="Quantidade"
                          className={`input input-bordered w-full mt-2 ${
                            errors.remainingOSCustom ? 'input-error' : ''
                          }`}
                        />
                      )}
                    </>
                  )}
                />
                {errors.remainingOSOption && (
                  <span id="remainingOSOption-error" role="alert" className="text-error text-sm">
                    {errors.remainingOSOption.message}
                  </span>
                )}
                {errors.remainingOSCustom && (
                  <span id="remainingOSCustom-error" role="alert" className="text-error text-sm">
                    {errors.remainingOSCustom.message}
                  </span>
                )}
              </div>

              {/* Olho de Início */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Começar por</span>
                </label>
                <Controller
                  name="startEye"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center mt-2">
                      <button
                        type="button"
                        onClick={() => field.onChange('OD')}
                        className={`btn btn-sm mr-2 ${field.value === 'OD' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        OD
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('OS')}
                        className={`btn btn-sm ${field.value === 'OS' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        OS
                      </button>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
              <strong>Importante:</strong> Ao confirmar, a única informação vigente será do registro criado por último.
              Caso sejam criados dois registros para o mesmo paciente com informações diferentes, será considerada a
              criada por último.
            </p>

            {/* Botões de ação */}
            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Salvar'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  closeModal();
                }}
              >
                Fechar
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            type="button"
            onClick={() => {
              closeModal();
            }}
          >
            Fechar
          </button>
        </form>
      </dialog>
    </div>
  );
}
