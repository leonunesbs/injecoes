// components/PatientForm/SearchForm/PatientSearchForm.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface PatientSearchFormProps {
  onSearch: (refId: string) => void;
  loading: boolean;
  onClose: () => void;
}

const searchPatientSchema = z.object({
  refId: z
    .string()
    .min(1, 'O ID do Paciente não pode ser vazio')
    .regex(/^\d+$/, 'O ID do Paciente deve ser um número natural'),
});

type SearchPatientFormData = z.infer<typeof searchPatientSchema>;

export function PatientSearchForm({ onSearch, loading, onClose }: PatientSearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchPatientFormData>({
    resolver: zodResolver(searchPatientSchema),
  });

  const onSubmit = (data: SearchPatientFormData) => {
    onSearch(data.refId);
  };

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)} aria-describedby="search-form-errors">
      <div className="form-control">
        <label className="label" htmlFor="searchRefId">
          <span className="label-text font-semibold">ID do Paciente</span>
        </label>
        <input
          id="searchRefId"
          type="text"
          {...register('refId')}
          placeholder="ID do Paciente"
          className={`input input-bordered w-full mb-0 ${errors.refId ? 'input-error' : ''}`}
          aria-invalid={!!errors.refId}
          aria-describedby={errors.refId ? 'searchRefId-error' : undefined}
        />
        {errors.refId && (
          <span id="searchRefId-error" role="alert" className="text-error text-sm">
            {errors.refId.message}
          </span>
        )}
      </div>

      <div className="modal-action">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="loading loading-spinner"></span> : 'Buscar'}
        </button>

        <button type="button" className="btn" onClick={onClose} aria-label="Fechar Modal">
          Fechar
        </button>
      </div>
    </form>
  );
}
