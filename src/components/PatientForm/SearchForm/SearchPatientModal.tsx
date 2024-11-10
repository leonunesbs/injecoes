// components/PatientForm/SearchForm/SearchPatientModal.tsx

'use client';

import { useCallback, useRef, useState } from 'react';

import { fetchPatientData, fetchPatientInjections } from '@/utils/manageInjections';
import { AdjustDoseModal } from './AdjustDoseModal';
import { InjectionsTable } from './InjectionsTable';
import { PatientDataDisplay } from './PatientDataDisplay';
import { PatientEditForm } from './PatientEditForm';
import { PatientSearchForm } from './PatientSearchForm';
import { Injection, PatientData } from './types';

interface SearchPatientModalProps {
  modal: HTMLDialogElement | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export function SearchPatientModal({ modal, showToast }: SearchPatientModalProps) {
  const [searchLoading, setSearchLoading] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [patientInjections, setPatientInjections] = useState<Injection[]>([]);
  const [isEditingPatientData, setIsEditingPatientData] = useState(false);

  const adjustDoseModalRef = useRef<HTMLDialogElement>(null);

  // Estados relacionados à edição de injeções
  const [editingInjection, setEditingInjection] = useState<Injection | null>(null);

  const closeSearchModal = useCallback(() => {
    if (modal) {
      modal.close();
      modal.classList.remove('modal-open');
      setPatientData(null);
      setPatientInjections([]);
      setIsEditingPatientData(false);
      setEditingInjection(null);
    }
  }, [modal]);

  const handleSearchPatient = async (refId: string) => {
    setSearchLoading(true);
    try {
      const fetchedPatientData = await fetchPatientData(refId.trim());
      const injections = await fetchPatientInjections(refId.trim());

      setPatientData(fetchedPatientData);
      setPatientInjections(injections);
      setIsEditingPatientData(false);
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
      showToast('Paciente não encontrado ou erro ao buscar dados.', 'error');
    } finally {
      setSearchLoading(false);
    }
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

        <PatientSearchForm onSearch={handleSearchPatient} loading={searchLoading} onClose={closeSearchModal} />

        {patientData && (
          <>
            {isEditingPatientData ? (
              <PatientEditForm
                patientData={patientData}
                setPatientData={setPatientData}
                setIsEditing={setIsEditingPatientData}
                showToast={showToast}
              />
            ) : (
              <PatientDataDisplay patientData={patientData} setIsEditing={setIsEditingPatientData} />
            )}

            <InjectionsTable
              injections={patientInjections}
              setInjections={setPatientInjections}
              patientData={patientData}
              showToast={showToast}
              adjustDoseModalRef={adjustDoseModalRef}
              editingInjection={editingInjection}
              setEditingInjection={setEditingInjection}
            />
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={closeSearchModal} aria-label="Fechar Modal">
          Fechar
        </button>
      </form>

      <AdjustDoseModal
        ref={adjustDoseModalRef}
        editingInjection={editingInjection}
        setEditingInjection={setEditingInjection}
        setInjections={setPatientInjections}
        patientData={patientData}
        setPatientData={setPatientData}
        showToast={showToast}
      />
    </dialog>
  );
}
