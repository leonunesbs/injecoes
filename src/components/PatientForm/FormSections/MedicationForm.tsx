// components/PatientForm/FormSections/MedicationForm.tsx

import { Controller, useFormContext } from 'react-hook-form';

import { medicationOptions } from '../patientFormSchema';

export function MedicationForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="label">
        <span className="label-text font-semibold">Medicação Indicada</span>
      </label>
      <Controller
        name="medication"
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-wrap gap-2 mt-2" role="group" aria-labelledby="medication-label">
              {medicationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => field.onChange(option)}
                  className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                  aria-pressed={field.value === option}
                  aria-controls={option === 'Outro' ? 'medicationOther' : undefined}
                >
                  {option}
                </button>
              ))}
            </div>
            {field.value === 'Outro' && (
              <input
                type="text"
                id="medicationOther"
                {...register('medicationOther')}
                placeholder="Especifique a medicação"
                className={`input input-bordered w-full mt-2 ${errors.medicationOther ? 'input-error' : ''}`}
                aria-required={field.value === 'Outro'}
              />
            )}
          </>
        )}
      />
      {errors.medication && (
        <span id="medication-error" role="alert" className="text-error text-sm">
          <>{errors.medication.message}</>
        </span>
      )}
    </div>
  );
}
