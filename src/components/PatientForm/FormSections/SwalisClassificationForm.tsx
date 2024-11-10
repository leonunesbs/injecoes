// components/PatientForm/FormSections/SwalisClassificationForm.tsx

import Link from 'next/link';
import { Controller, useFormContext } from 'react-hook-form';

import { swalisDescriptions, swalisOptions } from '../patientFormSchema';

export function SwalisClassificationForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  return (
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
            <div className="flex flex-wrap gap-2 mt-2" role="group" aria-labelledby="swalis-classification">
              {swalisOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => field.onChange(option)}
                  className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                  aria-pressed={field.value === option}
                  aria-controls={option === 'Outros' ? 'swalisOther' : undefined}
                >
                  {option}
                </button>
              ))}
            </div>
            {field.value === 'Outros' && (
              <input
                type="text"
                id="swalisOther"
                {...register('swalisOther')}
                placeholder="Especifique a classificação"
                className={`input input-bordered w-full mt-2 ${errors.swalisOther ? 'input-error' : ''}`}
                aria-required={field.value === 'Outros'}
              />
            )}
            {field.value !== 'Outros' && swalisDescriptions[field.value] && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{swalisDescriptions[field.value]}</p>
            )}
          </>
        )}
      />
      {errors.swalisClassification && (
        <span id="swalisClassification-error" role="alert" className="text-error text-sm">
          <>{errors.swalisClassification.message}</>
        </span>
      )}
    </div>
  );
}
