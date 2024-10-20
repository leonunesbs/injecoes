// components/PatientForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createOrUpdatePatient } from '@/utils/getInjections'; // Nova função para criar/editar pacientes

interface PatientFormProps {}

type FormData = {
  refId: string;
  remainingOD: number;
  remainingOS: number;
  startEye: 'OD' | 'OS';
};

export function PatientForm({}: PatientFormProps) {
  const [eye, setEye] = useState<'OD' | 'OS'>('OD'); // Estado para o olho inicial
  const [loading, setLoading] = useState(false); // Estado para indicar o carregamento
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true); // Iniciar o estado de carregamento
    try {
      // Chamada para criar ou atualizar o paciente e as injeções
      await createOrUpdatePatient({
        refId: data.refId,
        remainingOD: data.remainingOD,
        remainingOS: data.remainingOS,
        startEye: eye,
      });
      console.log('Form submitted:', data);
      reset(); // Resetar o formulário após o envio
      const modal = document.getElementById('patient-form') as HTMLDialogElement;
      modal.close(); // Fechar o modal
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false); // Finalizar o estado de carregamento
    }
  };

  return (
    <div className="flex justify-end p-4">
      <button
        className="btn btn-primary btn-outline top-4 right-4 z-auto"
        onClick={() => {
          const modal = document.getElementById('patient-form') as HTMLDialogElement;
          modal.showModal();
        }}
      >
        Novo Registro
      </button>

      <dialog id="patient-form" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Adicionar ou Atualizar Paciente</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">ID do Paciente</span>
              </label>
              <input
                type="text"
                {...register('refId', { required: true })}
                placeholder="ID do Paciente"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Injeções Restantes (OD)</span>
              </label>
              <input
                type="number"
                {...register('remainingOD', { valueAsNumber: true })}
                placeholder="Injeções Restantes OD"
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Injeções Restantes (OS)</span>
              </label>
              <input
                type="number"
                {...register('remainingOS', { valueAsNumber: true })}
                placeholder="Injeções Restantes OS"
                className="input input-bordered w-full"
              />
            </div>

            <div className="flex items-center">
              <span className="label-text mr-4">Olho de Início:</span>
              <input
                type="checkbox"
                className="toggle"
                onChange={() => setEye(eye === 'OD' ? 'OS' : 'OD')}
                checked={eye === 'OD'}
              />
              <span className="ml-2">{eye === 'OD' ? 'OD' : 'OS'}</span>
            </div>

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
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
