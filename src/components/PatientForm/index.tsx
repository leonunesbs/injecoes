// components/PatientForm.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiOutlineLogout, AiOutlineSearch } from 'react-icons/ai';
import { FaSyringe } from 'react-icons/fa6';

import { CreateOrUpdatePatientModal } from './CreateOrUpdatePatientModal';
import { SearchPatientModal } from './SearchForm/SearchPatientModal';

export function PatientForm() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [modal, setModal] = useState<HTMLDialogElement | null>(null);
  const [searchModal, setSearchModal] = useState<HTMLDialogElement | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'GET',
      credentials: 'include',
    });
    router.push('/login');
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
          className="btn btn-primary join-item"
          onClick={() => {
            modal?.showModal();
          }}
          aria-haspopup="dialog"
        >
          <FaSyringe size={16} />
          Nova Indicação
        </button>

        <button
          className="btn btn-ghost join-item"
          onClick={() => {
            searchModal?.showModal();
          }}
          aria-haspopup="dialog"
        >
          <AiOutlineSearch size={20} />
          <span className="hidden sm:block">Buscar Paciente</span>
        </button>
        <button onClick={handleLogout} className="btn btn-ghost  flex items-center gap-2 join-item">
          <AiOutlineLogout size={18} />
          <span className="hidden sm:block">Sair</span>
        </button>
      </div>
      {/* Modais */}
      <CreateOrUpdatePatientModal modal={modal} showToast={showToast} />
      <SearchPatientModal modal={searchModal} showToast={showToast} />
    </div>
  );
}
