// components/PatientForm/FormSections/BasicInfoForm.tsx

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function BasicInfoForm() {
  const {
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const [loading, setLoading] = useState(false);
  const [inputsDisabled, setInputsDisabled] = useState(false);

  const handleRefIdBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const refId = event.target.value.trim();
    if (!refId) return;

    setLoading(true);
    setInputsDisabled(true);

    try {
      const response = await fetch(`/api/patients/${refId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
          setValue('name', data.name);
          clearErrors('name');
        }
      } else {
        // Paciente não encontrado ou outro erro
        console.error('Paciente não encontrado ou erro na requisição');
      }
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
    } finally {
      setLoading(false);
      setInputsDisabled(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Inverter a posição entre o ID do paciente e o nome */}
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
          onBlur={handleRefIdBlur}
          disabled={inputsDisabled}
        />
        {errors.refId && (
          <span id="refId-error" role="alert" className="text-error text-sm">
            {errors.refId.message as string}
          </span>
        )}
      </div>

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
          disabled={inputsDisabled}
        />
        {errors.name && (
          <span id="name-error" role="alert" className="text-error text-sm">
            {errors.name.message as string}
          </span>
        )}
      </div>

      {/* 2.3 Animação de loading */}
      {loading && (
        <div className="col-span-2 flex">
          <span className="loading loading-spinner loading-sm"></span>
          <span className="ml-2 text-sm">Buscando informações do paciente...</span>
        </div>
      )}
    </div>
  );
}
