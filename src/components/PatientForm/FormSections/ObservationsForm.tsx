// components/PatientForm/FormSections/ObservationsForm.tsx

import { useFormContext } from 'react-hook-form';

export function ObservationsForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
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
          <>{errors.observations.message}</>
        </span>
      )}
    </div>
  );
}
