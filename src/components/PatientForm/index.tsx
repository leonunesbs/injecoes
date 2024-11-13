// components/PatientForm.tsx

'use client';

import { useEffect, useState } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';

import { CreateOrUpdatePatientModal } from './CreateOrUpdatePatientModal';
import { SearchPatientModal } from './SearchForm/SearchPatientModal';

export function PatientForm() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [modal, setModal] = useState<HTMLDialogElement | null>(null);
  const [searchModal, setSearchModal] = useState<HTMLDialogElement | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!modal && document) {
      setModal(document.getElementById('patient-form') as HTMLDialogElement);
    }
    if (!searchModal && document) {
      setSearchModal(document.getElementById('search-patient-form') as HTMLDialogElement);
    }
  }, [modal, searchModal]);

  return (
    <div className="flex justify-end p-4">
      {toastMessage && (
        <div
          className={`toast toast-${toastType} fixed bottom-4 right-4 z-auto`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className={`alert alert-${toastType}`}>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
      <div className="join">
        <button
          className="btn btn-primary btn-outline join-item"
          onClick={() => {
            modal?.showModal();
          }}
          aria-haspopup="dialog"
        >
          Novo Registro
        </button>

        <button
          className="btn btn-secondary btn-outline join-item"
          onClick={() => {
            searchModal?.showModal();
          }}
          aria-haspopup="dialog"
        >
          Buscar Registro
        </button>
        <button
          onClick={async () => {
            await fetch('/api/logout', {
              method: 'GET',
              credentials: 'include',
            });
          }}
          className="btn btn-ghost btn-outline flex items-center gap-2 join-item"
        >
          <AiOutlineLogout size={18} />
          Sair
        </button>
      </div>
      {/* Modais */}
      <CreateOrUpdatePatientModal modal={modal} showToast={showToast} />
      <SearchPatientModal modal={searchModal} showToast={showToast} />
    </div>
  );
}
