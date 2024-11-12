// components/PatientForm/SearchForm/InjectionsTable.tsx

import { format } from 'date-fns';

import { InjectionEditForm } from './InjectionEditForm';
import { Injection, PatientData } from './types';

interface InjectionsTableProps {
  injections: Injection[];
  setInjections: React.Dispatch<React.SetStateAction<Injection[]>>;
  patientData: PatientData;
  showToast: (message: string, type: 'success' | 'error') => void;
  adjustDoseModalRef: React.RefObject<HTMLDialogElement>;
  editingInjection: Injection | null;
  setEditingInjection: React.Dispatch<React.SetStateAction<Injection | null>>;
}

export function InjectionsTable({
  injections,
  setInjections,
  patientData,
  showToast,
  adjustDoseModalRef,
  editingInjection,
  setEditingInjection,
}: InjectionsTableProps) {
  const statusLabels: { [key: string]: string } = {
    done: 'Realizado',
    notDone: 'Não Realizado',
    pending: 'Pendente',
  };

  return (
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
            {injections.map((injection) => (
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
                  {editingInjection && editingInjection.id === injection.id ? (
                    <InjectionEditForm
                      injection={editingInjection}
                      setInjections={setInjections}
                      setEditingInjection={setEditingInjection}
                      patientData={patientData}
                      showToast={showToast}
                      adjustDoseModalRef={adjustDoseModalRef}
                    />
                  ) : (
                    <button
                      className="btn btn-primary btn-sm btn-outline"
                      onClick={() => setEditingInjection(injection)}
                      aria-label="Editar"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {injections.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">
                  Nenhuma injeção encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
