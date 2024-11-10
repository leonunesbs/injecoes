// components/PatientForm/SearchForm/PatientEditForm.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { updatePatientData } from '@/utils/manageInjections';
import { PatientData } from './types';

interface PatientEditFormProps {
  patientData: PatientData;
  setPatientData: React.Dispatch<React.SetStateAction<PatientData | null>>;
  setIsEditing: (value: boolean) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const editPatientSchema = z
  .object({
    name: z.string().min(1, 'O nome não pode ser vazio.'),
    indication: z.string().min(1, 'A indicação não pode ser vazio.'),
    remainingODOption: z.string(),
    remainingODCustom: z
      .number({ invalid_type_error: 'Por favor, insira um número.' })
      .min(1, 'Por favor, insira um número maior que zero.')
      .optional(),
    remainingOSOption: z.string(),
    remainingOSCustom: z
      .number({ invalid_type_error: 'Por favor, insira um número.' })
      .min(1, 'Por favor, insira um número maior que zero.')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.remainingODOption === 'Outro') {
        return data.remainingODCustom !== undefined && data.remainingODCustom > 0;
      }
      return true;
    },
    {
      message: 'Por favor, insira a quantidade de injeções restantes para OD.',
      path: ['remainingODCustom'],
    }
  )
  .refine(
    (data) => {
      if (data.remainingOSOption === 'Outro') {
        return data.remainingOSCustom !== undefined && data.remainingOSCustom > 0;
      }
      return true;
    },
    {
      message: 'Por favor, insira a quantidade de injeções restantes para OS.',
      path: ['remainingOSCustom'],
    }
  );

type EditPatientFormData = z.infer<typeof editPatientSchema>;

export function PatientEditForm({ patientData, setPatientData, setIsEditing, showToast }: PatientEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: {
      name: patientData.name,
      indication: patientData.indication,
      remainingODOption: [0, 1, 2, 3].includes(patientData.remainingOD) ? patientData.remainingOD.toString() : 'Outro',
      remainingODCustom: [0, 1, 2, 3].includes(patientData.remainingOD) ? undefined : patientData.remainingOD,
      remainingOSOption: [0, 1, 2, 3].includes(patientData.remainingOS) ? patientData.remainingOS.toString() : 'Outro',
      remainingOSCustom: [0, 1, 2, 3].includes(patientData.remainingOS) ? undefined : patientData.remainingOS,
    },
  });

  const onSubmit = async (data: EditPatientFormData) => {
    try {
      const remainingOD =
        data.remainingODOption === 'Outro' ? data.remainingODCustom : parseInt(data.remainingODOption, 10);
      const remainingOS =
        data.remainingOSOption === 'Outro' ? data.remainingOSCustom : parseInt(data.remainingOSOption, 10);

      const updatedData: PatientData = {
        ...patientData,
        name: data.name,
        indication: data.indication,
        remainingOD: remainingOD!,
        remainingOS: remainingOS!,
      };

      await updatePatientData({
        id: patientData.id,
        name: updatedData.name,
        indication: updatedData.indication,
        remainingOD: updatedData.remainingOD,
        remainingOS: updatedData.remainingOS,
      });

      setPatientData(updatedData);
      setIsEditing(false);
      showToast('Dados do paciente atualizados com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to update patient data:', error);
      showToast('Falha ao atualizar os dados do paciente.', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-describedby="edit-patient-form-errors"
    >
      {/* Input read-only para o número do prontuário */}
      <div className="form-control md:col-span-1">
        <label className="label" htmlFor="editRefId">
          <span className="label-text">Prontuário</span>
        </label>
        <input
          id="editRefId"
          type="text"
          value={patientData.refId}
          readOnly
          className="input input-bordered w-full cursor-not-allowed"
        />
      </div>

      {/* Campo de nome */}
      <div className="form-control md:col-span-2">
        <label className="label" htmlFor="editName">
          <span className="label-text">Nome</span>
        </label>
        <input
          id="editName"
          type="text"
          {...register('name')}
          className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'editName-error' : undefined}
        />
        {errors.name && (
          <span id="editName-error" role="alert" className="text-error text-sm">
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Campo de Indicação */}
      <div className="form-control md:col-span-3">
        <label className="label" htmlFor="editIndication">
          <span className="label-text">Indicação</span>
        </label>
        <textarea
          id="editIndication"
          {...register('indication')}
          className={`textarea textarea-bordered w-full ${errors.indication ? 'textarea-error' : ''}`}
          aria-invalid={!!errors.indication}
          aria-describedby={errors.indication ? 'editIndication-error' : undefined}
        />
        {errors.indication && (
          <span id="editIndication-error" role="alert" className="text-error text-sm">
            {errors.indication.message}
          </span>
        )}
      </div>

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
                <div className="mt-2">
                  <input
                    type="number"
                    id="remainingODCustom"
                    {...register('remainingODCustom', { valueAsNumber: true })}
                    placeholder="Quantidade"
                    className={`input input-bordered w-full mt-2 ${errors.remainingODCustom ? 'input-error' : ''}`}
                    aria-required={field.value === 'Outro'}
                  />
                  {errors.remainingODCustom && (
                    <span id="remainingODCustom-error" role="alert" className="text-error text-sm">
                      {errors.remainingODCustom.message}
                    </span>
                  )}
                </div>
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
                <div className="mt-2">
                  <input
                    type="number"
                    id="remainingOSCustom"
                    {...register('remainingOSCustom', { valueAsNumber: true })}
                    placeholder="Quantidade"
                    className={`input input-bordered w-full mt-2 ${errors.remainingOSCustom ? 'input-error' : ''}`}
                    aria-required={field.value === 'Outro'}
                  />
                  {errors.remainingOSCustom && (
                    <span id="remainingOSCustom-error" role="alert" className="text-error text-sm">
                      {errors.remainingOSCustom.message}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        />
      </div>

      {/* Botões de ação */}
      <div className="flex items-end space-x-2 mt-4 md:col-span-3">
        <button className="btn btn-primary" type="submit" aria-label="Salvar">
          Salvar
        </button>
        <button className="btn btn-ghost" type="button" onClick={handleCancel} aria-label="Cancelar">
          Cancelar
        </button>
      </div>
    </form>
  );
}
