// components/PatientForm/FormSections/BasicInfoForm.tsx

import { useFormContext } from 'react-hook-form';

export function BasicInfoForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <>{errors.name.message}</>
          </span>
        )}
      </div>

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
            <>{errors.refId.message}</>
          </span>
        )}
      </div>
    </div>
  );
}
