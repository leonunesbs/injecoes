// components/PatientForm/SearchForm/AdjustDoseModal.tsx

import { forwardRef, useState } from 'react';

import { adjustPatientDose, fetchPatientData, updateInjectionStatus } from '@/utils/manageInjections';
import { Injection, PatientData } from './types';

interface AdjustDoseModalProps {
  editingInjection: Injection | null;
  setEditingInjection: React.Dispatch<React.SetStateAction<Injection | null>>;
  setInjections: React.Dispatch<React.SetStateAction<Injection[]>>;
  patientData: PatientData | null;
  setPatientData: React.Dispatch<React.SetStateAction<PatientData | null>>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const AdjustDoseModal = forwardRef<HTMLDialogElement, AdjustDoseModalProps>(
  ({ editingInjection, setEditingInjection, setInjections, patientData, setPatientData, showToast }, ref) => {
    const [isAdjustingDose, setIsAdjustingDose] = useState(false);

    const handleConfirmAdjustDose = async (adjustDose: boolean) => {
      if (editingInjection && patientData) {
        setIsAdjustingDose(true);
        try {
          // Atualizar o status da injeção e o tipo
          await updateInjectionStatus(editingInjection.id, editingInjection.status, editingInjection.type);

          // Atualizar o estado local das injeções
          setInjections((prevInjections) =>
            prevInjections.map((inj) =>
              inj.id === editingInjection.id
                ? { ...inj, status: editingInjection.status, type: editingInjection.type }
                : inj
            )
          );

          // Ajustar a dose se o usuário confirmou
          if (adjustDose) {
            if (editingInjection.status === 'done') {
              await adjustPatientDose(patientData.id, editingInjection.eye, -1);
            } else if (editingInjection.status === 'notDone') {
              await adjustPatientDose(patientData.id, editingInjection.eye, 1);
            }

            // Atualizar os dados do paciente localmente
            const updatedPatientData = await fetchPatientData(patientData.refId);
            setPatientData(updatedPatientData);

            showToast('Status da injeção e doses restantes atualizados com sucesso!', 'success');
          } else {
            showToast('Status da injeção atualizado com sucesso!', 'success');
          }

          // Fechar o diálogo e resetar estados
          setEditingInjection(null);
          (ref as React.RefObject<HTMLDialogElement>).current?.close();
        } catch (error) {
          console.error('Failed to update injection status or adjust patient dose:', error);
          showToast('Falha ao atualizar o status da injeção ou ajustar a dose do paciente.', 'error');
        } finally {
          setIsAdjustingDose(false);
        }
      }
    };

    const handleCancelAdjustDose = () => {
      handleConfirmAdjustDose(false);
    };

    if (!editingInjection) return null;

    return (
      <dialog ref={ref} className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-xl mb-4 text-center">Ajustar Doses Restantes</h3>
          <p className="mb-4">
            Você alterou o status para{' '}
            <strong>{editingInjection.status === 'done' ? 'Realizado' : 'Não Realizado'}</strong>. Deseja{' '}
            {editingInjection.status === 'done' ? 'debitar' : 'creditar'} uma dose restante no olho{' '}
            <strong>{editingInjection.eye}</strong>?
          </p>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancelAdjustDose}
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
    );
  }
);

AdjustDoseModal.displayName = 'AdjustDoseModal';
