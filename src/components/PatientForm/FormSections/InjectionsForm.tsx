// components/PatientForm/FormSections/InjectionsForm.tsx

import { Controller, useFormContext } from 'react-hook-form';

export function InjectionsForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  return (
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
              <div className="flex flex-wrap gap-2 mt-2" role="group" aria-labelledby="remaining-od-option">
                {['0', '1', '2', '3', 'Outro'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => field.onChange(option)}
                    className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                    aria-pressed={field.value === option}
                    aria-controls={option === 'Outro' ? 'remainingODCustom' : undefined}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {field.value === 'Outro' && (
                <input
                  type="number"
                  id="remainingODCustom"
                  {...register('remainingODCustom', { valueAsNumber: true })}
                  placeholder="Quantidade"
                  className={`input input-bordered w-full mt-2 ${errors.remainingODCustom ? 'input-error' : ''}`}
                  aria-required={field.value === 'Outro'}
                />
              )}
            </>
          )}
        />
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
              <div className="flex flex-wrap gap-2 mt-2" role="group" aria-labelledby="remaining-os-option">
                {['0', '1', '2', '3', 'Outro'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => field.onChange(option)}
                    className={`btn btn-sm ${field.value === option ? 'btn-primary' : 'btn-outline'}`}
                    aria-pressed={field.value === option}
                    aria-controls={option === 'Outro' ? 'remainingOSCustom' : undefined}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {field.value === 'Outro' && (
                <input
                  type="number"
                  id="remainingOSCustom"
                  {...register('remainingOSCustom', { valueAsNumber: true })}
                  placeholder="Quantidade"
                  className={`input input-bordered w-full mt-2 ${errors.remainingOSCustom ? 'input-error' : ''}`}
                  aria-required={field.value === 'Outro'}
                />
              )}
            </>
          )}
        />
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
            <div className="flex items-center mt-2" role="group" aria-labelledby="start-eye">
              <button
                type="button"
                onClick={() => field.onChange('OD')}
                className={`btn btn-sm mr-2 ${field.value === 'OD' ? 'btn-primary' : 'btn-outline'}`}
                aria-pressed={field.value === 'OD'}
              >
                OD
              </button>
              <button
                type="button"
                onClick={() => field.onChange('OS')}
                className={`btn btn-sm ${field.value === 'OS' ? 'btn-primary' : 'btn-outline'}`}
                aria-pressed={field.value === 'OS'}
              >
                OS
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
