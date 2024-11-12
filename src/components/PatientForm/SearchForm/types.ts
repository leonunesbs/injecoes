// components/PatientForm/SearchForm/types.ts

export interface Injection {
  id: string;
  date: string;
  eye: 'OD' | 'OS' | '';
  status: 'done' | 'notDone' | 'pending';
  type: string;
}

export interface PatientData {
  id: string;
  refId: string;
  name: string;
  indication: string;
  remainingOD: number;
  remainingOS: number;
}
