// components/PatientForm.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createOrUpdatePatient } from '@/utils/getInjections';

// Define a schema with Zod for validation
const patientSchema = z.object({
  refId: z
    .string()
    .min(1, 'O ID do Paciente não pode ser vazio')
    .regex(/^\d+$/, 'O ID do Paciente deve ser um número natural')
    .transform((val) => val.replace(/^0+/, '')), // Remove zeros à esquerda
  remainingOD: z.number().min(0, 'Valor não pode ser negativo').default(0),
  remainingOS: z
    .number({
      required_error: 'O campo é obrigatório',
      invalid_type_error: 'O valor deve ser um número',
    })
    .min(0, 'Valor não pode ser negativo')
    .default(0),
  startEye: z.enum(['OD', 'OS']),
});

type FormData = z.infer<typeof patientSchema>;

export function PatientForm() {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const {
    register,
    handleSubmit,
    reset,
    control, // Added control for Controller usage
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      remainingOD: 0,
      remainingOS: 0,
      startEye: 'OD', // Default to 'OD'
    },
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000); // Toast disappears after 3 seconds
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await createOrUpdatePatient(data);
      console.log('Form submitted:', data);
      reset();
      showToast('Paciente salvo com sucesso!', 'success');
      const modal = document.getElementById('patient-form') as HTMLDialogElement;
      modal.close();
    } catch (error) {
      console.error('Failed to submit:', error);
      showToast('Falha ao salvar o paciente.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        className="btn btn-primary btn-outline top-4 right-4 z-auto"
        onClick={() => {
          const modal = document.getElementById('patient-form') as HTMLDialogElement;
          modal.showModal();
        }}
      >
        Novo Registro
      </button>

      <dialog id="patient-form" className="modal" aria-labelledby="modal-title" aria-describedby="modal-description">
        <div className="modal-box">
          <h3 id="modal-title" className="font-bold text-lg">
            Adicionar ou Atualizar Paciente
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* ID do Paciente */}
            <div>
              <label className="label" htmlFor="refId">
                <span className="label-text">ID do Paciente</span>
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
                <span id="refId-error" role="alert" className="text-error">
                  {errors.refId.message}
                </span>
              )}
            </div>

            {/* Injeções Restantes OD */}
            <div>
              <label className="label" htmlFor="remainingOD">
                <span className="label-text">Injeções Restantes (OD)</span>
              </label>
              <input
                id="remainingOD"
                type="number"
                {...register('remainingOD', { valueAsNumber: true })}
                className={`input input-bordered w-full ${errors.remainingOD ? 'input-error' : ''}`}
                aria-invalid={!!errors.remainingOD}
                aria-describedby={errors.remainingOD ? 'remainingOD-error' : undefined}
              />
              {errors.remainingOD && (
                <span id="remainingOD-error" role="alert" className="text-error">
                  {errors.remainingOD.message}
                </span>
              )}
            </div>

            {/* Injeções Restantes OS */}
            <div>
              <label className="label" htmlFor="remainingOS">
                <span className="label-text">Injeções Restantes (OS)</span>
              </label>
              <input
                id="remainingOS"
                type="number"
                {...register('remainingOS', { valueAsNumber: true })}
                className={`input input-bordered w-full ${errors.remainingOS ? 'input-error' : ''}`}
                aria-invalid={!!errors.remainingOS}
                aria-describedby={errors.remainingOS ? 'remainingOS-error' : undefined}
              />
              {errors.remainingOS && (
                <span id="remainingOS-error" role="alert" className="text-error">
                  {errors.remainingOS.message}
                </span>
              )}
            </div>

            {/* Olho de Início (Using Controller) */}
            <div className="flex items-center">
              <span className="label-text mr-4">Olho de Início:</span>
              <Controller
                name="startEye"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    onChange={() => field.onChange(field.value === 'OD' ? 'OS' : 'OD')}
                    checked={field.value === 'OD'}
                    aria-label={`Olho de início selecionado: ${field.value}`}
                  />
                )}
              />
              <span className="ml-2">{control._formValues.startEye === 'OD' ? 'OD' : 'OS'}</span>
            </div>

            {/* Botões de ação */}
            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Salvar'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const modal = document.getElementById('patient-form') as HTMLDialogElement;
                  modal.close();
                }}
              >
                Fechar
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Fechar</button>
        </form>
      </dialog>
    </div>
  );
}
