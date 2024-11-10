// components/PatientForm/SearchForm/PatientDataDisplay.tsx

import { PatientData } from './types';

interface PatientDataDisplayProps {
  patientData: PatientData;
  setIsEditing: (value: boolean) => void;
}

export function PatientDataDisplay({ patientData, setIsEditing }: PatientDataDisplayProps) {
  return (
    <div className="mt-6">
      <h4 className="font-bold text-lg flex items-center justify-between">
        Dados do Paciente
        <button
          className="btn btn-sm btn-primary btn-outline"
          onClick={() => setIsEditing(true)}
          aria-label="Editar Dados do Paciente"
        >
          Editar
        </button>
      </h4>
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
    </div>
  );
}
