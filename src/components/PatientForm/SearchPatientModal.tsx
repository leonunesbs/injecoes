// components/PatientForm/SearchPatientModal.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  adjustPatientDose,
  fetchPatientData,
  fetchPatientInjections,
  updateInjectionStatus,
  updatePatientData,
} from '@/utils/manageInjections';

interface Injection {
  id: string;
  date: string;
  eye: 'OD' | 'OS';
  status: 'done' | 'notDone' | 'pending';
  type: string;
}

interface PatientData {
  id: string;
  refId: string;
  name: string;
  remainingOD: number;
  remainingOS: number;
}

interface SearchPatientModalProps {
  modal: HTMLDialogElement | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

// Esquema de validação com Zod para o formulário de busca
const searchPatientSchema = z.object({
  refId: z
    .string()
    .min(1, 'O ID do Paciente não pode ser vazio')
    .regex(/^\d+$/, 'O ID do Paciente deve ser um número natural'),
});

type SearchPatientFormData = z.infer<typeof searchPatientSchema>;

// Esquema de validação para edição dos dados do paciente
const editPatientSchema = z
  .object({
    name: z.string().min(1, 'O nome não pode ser vazio.'),
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

export function SearchPatientModal({ modal, showToast }: SearchPatientModalProps) {
  const [searchLoading, setSearchLoading] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [patientInjections, setPatientInjections] = useState<Injection[]>([]);

  const [isEditingPatientData, setIsEditingPatientData] = useState(false);
  const [editingInjectionId, setEditingInjectionId] = useState<string | null>(null);
  const [editingInjectionStatus, setEditingInjectionStatus] = useState<'done' | 'notDone' | 'pending'>('pending');
  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(null);
  const [editingInjectionType, setEditingInjectionType] = useState<string>('');

  const adjustDoseModalRef = useRef<HTMLDialogElement>(null);

  // Estados de carregamento
  const [isSavingPatientData, setIsSavingPatientData] = useState(false);
  const [isAdjustingDose, setIsAdjustingDose] = useState(false);

  // Mapeamento de status para labels em português
  const statusLabels: { [key: string]: string } = {
    done: 'Realizado',
    notDone: 'Não Realizado',
    pending: 'Pendente',
  };

  // Formulário de busca
  const {
    register: registerSearch,
    handleSubmit: handleSubmitSearch,
    formState: { errors: errorsSearch },
    reset: resetSearchForm,
    setError: setSearchError,
  } = useForm<SearchPatientFormData>({
    resolver: zodResolver(searchPatientSchema),
  });

  // Formulário de edição do paciente
  const {
    register: registerEditPatient,
    handleSubmit: handleSubmitEditPatient,
    formState: { errors: errorsEditPatient },
    reset: resetEditPatientForm,
    setValue: setEditPatientValue,
    control: controlEditPatient,
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  const closeSearchModal = useCallback(() => {
    if (modal) {
      modal.close();
      modal.classList.remove('modal-open');
      resetSearchForm();
      resetEditPatientForm();
      setPatientData(null);
      setPatientInjections([]);
      setIsEditingPatientData(false);
      setEditingInjectionId(null);
      setSelectedInjection(null);
    }
  }, [modal, resetSearchForm, resetEditPatientForm]);

  const onSubmitSearch = async (data: SearchPatientFormData) => {
    setSearchLoading(true);
    try {
      const patientData = await fetchPatientData(data.refId.trim());
      const injections = await fetchPatientInjections(data.refId.trim());

      setPatientData(patientData);
      setPatientInjections(injections);
      setIsEditingPatientData(false);
      resetEditPatientForm();
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
      if ((error as any).message === 'Paciente não encontrado') {
        setSearchError('refId', {
          type: 'manual',
          message: 'Paciente não encontrado.',
        });
      } else {
        setSearchError('refId', {
          type: 'manual',
          message: 'Falha ao buscar o paciente.',
        });
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEditPatientData = () => {
    if (patientData) {
      setIsEditingPatientData(true);
      setEditPatientValue('name', patientData.name);

      // Setar valores para remainingODOption e remainingODCustom
      if ([0, 1, 2, 3].includes(patientData.remainingOD)) {
        setEditPatientValue('remainingODOption', patientData.remainingOD.toString());
        setEditPatientValue('remainingODCustom', undefined);
      } else {
        setEditPatientValue('remainingODOption', 'Outro');
        setEditPatientValue('remainingODCustom', patientData.remainingOD);
      }

      // Setar valores para remainingOSOption e remainingOSCustom
      if ([0, 1, 2, 3].includes(patientData.remainingOS)) {
        setEditPatientValue('remainingOSOption', patientData.remainingOS.toString());
        setEditPatientValue('remainingOSCustom', undefined);
      } else {
        setEditPatientValue('remainingOSOption', 'Outro');
        setEditPatientValue('remainingOSCustom', patientData.remainingOS);
      }
    }
  };

  const onSubmitEditPatient = async (data: EditPatientFormData) => {
    if (patientData) {
      setIsSavingPatientData(true);
      try {
        const remainingOD =
          data.remainingODOption === 'Outro' ? data.remainingODCustom : parseInt(data.remainingODOption);
        const remainingOS =
          data.remainingOSOption === 'Outro' ? data.remainingOSCustom : parseInt(data.remainingOSOption);

        const updatedData = {
          ...patientData,
          name: data.name,
          remainingOD: remainingOD!,
          remainingOS: remainingOS!,
        };

        await updatePatientData({
          id: patientData.id,
          name: updatedData.name,
          remainingOD: updatedData.remainingOD,
          remainingOS: updatedData.remainingOS,
        });

        setPatientData(updatedData as PatientData);
        setIsEditingPatientData(false);
        showToast('Dados do paciente atualizados com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to update patient data:', error);
        showToast('Falha ao atualizar os dados do paciente.', 'error');
      } finally {
        setIsSavingPatientData(false);
      }
    }
  };

  const handleCancelEditPatientData = () => {
    setIsEditingPatientData(false);
    resetEditPatientForm();
  };

  const handleEditInjection = (injection: Injection) => {
    setEditingInjectionId(injection.id);
    setEditingInjectionStatus(injection.status);
    setSelectedInjection(injection);
    setEditingInjectionType(injection.type);
  };

  const handleSaveInjection = () => {
    if (editingInjectionId && editingInjectionStatus && selectedInjection && patientData) {
      if (editingInjectionStatus === selectedInjection.status && editingInjectionType === selectedInjection.type) {
        showToast('Nenhuma alteração foi feita.', 'error');
        return;
      }

      if (editingInjectionStatus === 'pending') {
        showToast('Status "Pendente" não pode ser salvo.', 'error');
        return;
      }

      // Abrir o diálogo para ajustar as doses restantes
      adjustDoseModalRef.current?.showModal();
    }
  };

  const handleConfirmAdjustDose = async (adjustDose: boolean) => {
    if (editingInjectionId && editingInjectionStatus && selectedInjection && patientData) {
      setIsAdjustingDose(true);
      try {
        // Atualizar o status da injeção e o tipo
        if (editingInjectionStatus !== 'pending') {
          await updateInjectionStatus(editingInjectionId, editingInjectionStatus, editingInjectionType);
        }

        // Atualizar o estado local das injeções
        setPatientInjections((prevInjections) =>
          prevInjections.map((inj) =>
            inj.id === editingInjectionId ? { ...inj, status: editingInjectionStatus, type: editingInjectionType } : inj
          )
        );

        // Ajustar a dose se o usuário confirmou
        if (adjustDose) {
          if (editingInjectionStatus === 'done') {
            await adjustPatientDose(patientData.id, selectedInjection.eye, -1);
          } else if (editingInjectionStatus === 'notDone') {
            await adjustPatientDose(patientData.id, selectedInjection.eye, 1);
          }

          // Atualizar os dados do paciente localmente
          const updatedPatientData = await fetchPatientData(patientData.refId);
          setPatientData(updatedPatientData);

          showToast('Status da injeção e doses restantes atualizados com sucesso!', 'success');
        } else {
          showToast('Status da injeção atualizado com sucesso!', 'success');
        }

        // Fechar o diálogo e resetar estados
        setEditingInjectionId(null);
        setSelectedInjection(null);
        setEditingInjectionStatus('pending');
        adjustDoseModalRef.current?.close();
      } catch (error) {
        console.error('Failed to update injection status or adjust patient dose:', error);
        showToast('Falha ao atualizar o status da injeção ou ajustar a dose do paciente.', 'error');
      } finally {
        setIsAdjustingDose(false);
      }
    }
  };

  const handleCancelAdjustDose = () => {
    // O usuário optou por não ajustar as doses
    handleConfirmAdjustDose(false);
  };

  const handleCancelEditInjection = () => {
    setEditingInjectionId(null);
    setSelectedInjection(null);
    setEditingInjectionStatus('pending');
  };

  return (
    <dialog
      id="search-patient-form"
      className="modal"
      aria-labelledby="search-modal-title"
      aria-describedby="search-modal-description"
      role="dialog"
    >
      <div className="modal-box w-full max-w-4xl">
        <h3 id="search-modal-title" className="font-bold text-xl mb-4">
          Buscar Registro
        </h3>
        {/* Formulário para buscar paciente */}
        <form
          className="space-y-6"
          noValidate
          onSubmit={handleSubmitSearch(onSubmitSearch)}
          aria-describedby="search-form-errors"
        >
          <div className="form-control">
            <label className="label" htmlFor="searchRefId">
              <span className="label-text font-semibold">ID do Paciente</span>
            </label>
            <input
              id="searchRefId"
              type="text"
              {...registerSearch('refId')}
              placeholder="ID do Paciente"
              className={`input input-bordered w-full mb-0 ${errorsSearch.refId ? 'input-error' : ''}`}
              aria-invalid={!!errorsSearch.refId}
              aria-describedby={errorsSearch.refId ? 'searchRefId-error' : undefined}
            />
            {errorsSearch.refId && (
              <span id="searchRefId-error" role="alert" className="text-error text-sm">
                {errorsSearch.refId.message}
              </span>
            )}
          </div>

          {/* Botão de busca */}
          <div className="modal-action">
            <button type="submit" className="btn btn-primary" disabled={searchLoading}>
              {searchLoading ? <span className="loading loading-spinner"></span> : 'Buscar'}
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => {
                closeSearchModal();
              }}
              aria-label="Fechar Modal"
            >
              Fechar
            </button>
          </div>
        </form>

        {patientData && (
          <div className="mt-6">
            <h4 className="font-bold text-lg flex items-center justify-between">
              Dados do Paciente
              {!isEditingPatientData && (
                <button
                  className="btn btn-sm btn-primary btn-outline"
                  onClick={handleEditPatientData}
                  aria-label="Editar Dados do Paciente"
                >
                  Editar
                </button>
              )}
            </h4>
            {isEditingPatientData ? (
              <form
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
                noValidate
                onSubmit={handleSubmitEditPatient(onSubmitEditPatient)}
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
                    {...registerEditPatient('name')}
                    className={`input input-bordered w-full ${errorsEditPatient.name ? 'input-error' : ''}`}
                    aria-invalid={!!errorsEditPatient.name}
                    aria-describedby={errorsEditPatient.name ? 'editName-error' : undefined}
                  />
                  {errorsEditPatient.name && (
                    <span id="editName-error" role="alert" className="text-error text-sm">
                      {errorsEditPatient.name.message}
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
                    control={controlEditPatient}
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
                              {...registerEditPatient('remainingODCustom', { valueAsNumber: true })}
                              placeholder="Quantidade"
                              className={`input input-bordered w-full mt-2 ${
                                errorsEditPatient.remainingODCustom ? 'input-error' : ''
                              }`}
                              aria-required={field.value === 'Outro'}
                            />
                            {errorsEditPatient.remainingODCustom && (
                              <span id="remainingODCustom-error" role="alert" className="text-error text-sm">
                                {errorsEditPatient.remainingODCustom.message}
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
                    control={controlEditPatient}
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
                              {...registerEditPatient('remainingOSCustom', { valueAsNumber: true })}
                              placeholder="Quantidade"
                              className={`input input-bordered w-full mt-2 ${
                                errorsEditPatient.remainingOSCustom ? 'input-error' : ''
                              }`}
                              aria-required={field.value === 'Outro'}
                            />
                            {errorsEditPatient.remainingOSCustom && (
                              <span id="remainingOSCustom-error" role="alert" className="text-error text-sm">
                                {errorsEditPatient.remainingOSCustom.message}
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
                  <button className="btn btn-primary" type="submit" aria-label="Salvar" disabled={isSavingPatientData}>
                    {isSavingPatientData ? <span className="loading loading-spinner"></span> : 'Salvar'}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={handleCancelEditPatientData}
                    aria-label="Cancelar"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p>
                    <strong>ID:</strong> {patientData.refId}
                  </p>
                  <p>
                    <strong>Nome:</strong> {patientData.name}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Injeções Restantes OD:</strong> {patientData.remainingOD}
                  </p>
                  <p>
                    <strong>Injeções Restantes OS:</strong> {patientData.remainingOS}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {patientInjections.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-lg mb-2">Histórico de Injeções</h4>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Olho</th>
                    <th>Status</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {patientInjections.map((injection) => (
                    <tr key={injection.id}>
                      <td>{format(new Date(injection.date), 'dd/MM/yyyy')}</td>
                      <td>{injection.eye}</td>
                      <td>
                        <span
                          className={`badge ${
                            injection.status === 'done'
                              ? 'badge-success'
                              : injection.status === 'notDone'
                                ? 'badge-error'
                                : 'badge-warning'
                          }`}
                        >
                          {statusLabels[injection.status]}
                        </span>
                      </td>
                      <td>{injection.type}</td>
                      <td>
                        {editingInjectionId === injection.id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              className="select select-bordered select-sm"
                              value={editingInjectionStatus}
                              onChange={(e) =>
                                setEditingInjectionStatus(e.target.value as 'done' | 'notDone' | 'pending')
                              }
                            >
                              <option value="done">Realizado</option>
                              <option value="notDone">Não Realizado</option>
                              <option value="pending" disabled>
                                Pendente
                              </option>
                            </select>
                            <input
                              type="text"
                              className="input input-bordered input-sm"
                              placeholder="Tipo de Injeção"
                              value={editingInjectionType}
                              onChange={(e) => setEditingInjectionType(e.target.value)}
                            />
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={handleSaveInjection}
                              aria-label="Salvar"
                            >
                              Salvar
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={handleCancelEditInjection}
                              aria-label="Cancelar"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm btn-outline"
                            onClick={() => {
                              handleEditInjection(injection);
                            }}
                            aria-label="Editar"
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!searchLoading && patientData && patientInjections.length === 0 && (
          <div className="mt-6">
            <p className="text-gray-600">Nenhuma injeção encontrada para este paciente.</p>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          type="button"
          onClick={() => {
            closeSearchModal();
          }}
          aria-label="Fechar Modal"
        >
          Fechar
        </button>
      </form>

      {/* Modal de Ajuste de Dose */}
      <dialog ref={adjustDoseModalRef} className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-xl mb-4 text-center">Ajustar Doses Restantes</h3>
          <p className="mb-4">
            Você alterou o status para{' '}
            <strong>{editingInjectionStatus === 'done' ? 'Realizado' : 'Não Realizado'}</strong>. Deseja{' '}
            {editingInjectionStatus === 'done' ? 'debitar' : 'creditar'} uma dose restante no olho{' '}
            <strong>{selectedInjection?.eye}</strong>?
          </p>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleConfirmAdjustDose(false)}
              disabled={isAdjustingDose}
              aria-label="Não ajustar doses"
            >
              {isAdjustingDose ? <span className="loading loading-spinner"></span> : 'Não'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleConfirmAdjustDose(true)}
              disabled={isAdjustingDose}
              aria-label="Sim, ajustar doses"
            >
              {isAdjustingDose ? <span className="loading loading-spinner"></span> : 'Sim'}
            </button>
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={handleCancelAdjustDose} aria-label="Fechar Modal de Ajuste de Dose">
            Fechar
          </button>
        </form>
      </dialog>
    </dialog>
  );
}
