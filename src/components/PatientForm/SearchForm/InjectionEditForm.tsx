// components/PatientForm/SearchForm/InjectionEditForm.tsx

import { useState } from 'react';

import { Injection, PatientData } from './types';

interface InjectionEditFormProps {
  injection: Injection;
  setInjections: React.Dispatch<React.SetStateAction<Injection[]>>;
  setEditingInjection: React.Dispatch<React.SetStateAction<Injection | null>>;
  patientData: PatientData;
  showToast: (message: string, type: 'success' | 'error') => void;
  adjustDoseModalRef: React.RefObject<HTMLDialogElement>;
}

export function InjectionEditForm({
  injection,
  setEditingInjection,
  showToast,
  adjustDoseModalRef,
}: InjectionEditFormProps) {
  const [editingStatus, setEditingStatus] = useState<'done' | 'notDone' | 'pending'>(injection.status);
  const [editingType, setEditingType] = useState<string>(injection.type);

  const handleSave = () => {
    if (editingStatus === injection.status && editingType === injection.type) {
      showToast('Nenhuma alteração foi feita.', 'error');
      return;
    }

    if (editingStatus === 'pending') {
      showToast('Status "Pendente" não pode ser salvo.', 'error');
      return;
    }

    // Atualizar o objeto de injeção que está sendo editado
    const updatedInjection: Injection = {
      ...injection,
      status: editingStatus,
      type: editingType,
    };

    setEditingInjection(updatedInjection);

    // Abrir o diálogo para ajustar as doses restantes
    adjustDoseModalRef.current?.showModal();
  };

  const handleCancel = () => {
    setEditingInjection(null);
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        className="select select-bordered select-sm"
        value={editingStatus}
        onChange={(e) => setEditingStatus(e.target.value as 'done' | 'notDone' | 'pending')}
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
        value={editingType}
        onChange={(e) => setEditingType(e.target.value)}
      />
      <button className="btn btn-primary btn-sm" onClick={handleSave} aria-label="Salvar">
        Salvar
      </button>
      <button className="btn btn-ghost btn-sm" onClick={handleCancel} aria-label="Cancelar">
        Cancelar
      </button>
    </div>
  );
}
