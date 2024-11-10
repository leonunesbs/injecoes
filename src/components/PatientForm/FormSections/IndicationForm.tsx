// components/PatientForm/FormSections/IndicationForm.tsx

import { Controller, useFormContext } from 'react-hook-form';

import { indicationDescriptions, indicationOptions } from '../patientFormSchema';

export function IndicationForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="label">
        <span className="label-text font-semibold">Indicação</span>
      </label>
      <Controller
        name="indication"
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-wrap gap-2 mt-2" role="group" aria-labelledby="indication-label">
              {indicationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => field.onChange(option)}
                  className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                  aria-pressed={field.value === option}
                  aria-controls={option === 'Outros' ? 'indicationOther' : undefined}
                >
                  {option}
                </button>
              ))}
            </div>
            {field.value === 'Outros' && (
              <input
                type="text"
                id="indicationOther"
                {...register('indicationOther')}
                placeholder="Especifique a indicação"
                className={`input input-bordered w-full mt-2 ${errors.indicationOther ? 'input-error' : ''}`}
                aria-required={field.value === 'Outros'}
              />
            )}
            {field.value !== 'Outros' && indicationDescriptions[field.value] && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{indicationDescriptions[field.value]}</p>
            )}
          </>
        )}
      />
      {errors.indication && (
        <span id="indication-error" role="alert" className="text-error text-sm">
          <>{errors.indication.message}</>
        </span>
      )}
    </div>
  );
}
