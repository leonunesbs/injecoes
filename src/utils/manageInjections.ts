// utils/manageInjections.ts

'use server';

import prisma from '@/lib/prisma';

// --- Tipos ---

export interface PatientData {
  id: string; // Patient.id
  refId: string; // Patient.refId
  name: string;
  indication: string;
  remainingOD: number;
  remainingOS: number;
  startOD: boolean;
  injections: InjectionData[]; // Incluindo injeções
  // Incluir outros campos do paciente conforme necessário
}

export interface InjectionData {
  id: string;
  date: string;
  eye: 'OD' | 'OS';
  status: 'done' | 'notDone' | 'pending';
  done: boolean;
  OD: number;
  OS: number;
  type: string;
  // Incluir outros campos da injeção conforme necessário
}

export interface Injection {
  id: string;
  date: string;
  eye: 'OD' | 'OS';
  status: 'done' | 'notDone' | 'pending';
  type: string; // Novo campo
}

// Tipo para criar ou atualizar um paciente
export type CreateOrUpdatePatientInput = {
  refId: string;
  name: string;
  remainingOD: number;
  remainingOS: number;
  indication: string;
  startEye: 'OD' | 'OS';
};

// Função para obter dados de pacientes com suas injeções mais recentes
export async function getPatientsData(refIds: string[]): Promise<PatientData[]> {
  const patients = await prisma.patient.findMany({
    where: {
      refId: {
        in: refIds,
      },
    },
    include: {
      injections: {
        orderBy: { date: 'desc' },
      },
    },
  });

  // Mapear os dados para o tipo PatientData
  return patients.map((patient) => ({
    id: patient.id,
    refId: patient.refId,
    name: patient.name,
    remainingOD: patient.remainingOD,
    remainingOS: patient.remainingOS,
    startOD: patient.startOD,
    indication: patient.indication,
    injections: patient.injections.map((injection) => ({
      id: injection.id,
      date: injection.date.toISOString(),
      eye: injection.OD > 0 ? 'OD' : 'OS',
      status: injection.done ? 'done' : injection.notDone ? 'notDone' : 'pending',
      done: injection.done,
      OD: injection.OD,
      OS: injection.OS,
      type: injection.type,
    })),
  }));
}

// Função auxiliar para determinar o próximo olho a ser tratado
export async function determineNextEye(patient: PatientData): Promise<'OD' | 'OS' | ''> {
  if (!patient) return '';

  const { injections, remainingOD, remainingOS, startOD } = patient;

  // Filtrar apenas as injeções com status 'done'
  const doneInjections = injections.filter((inj) => inj.done);

  const lastDoneInjection = doneInjections[0];

  if (lastDoneInjection) {
    if (lastDoneInjection.eye === 'OD' && remainingOS > 0) return 'OS';
    if (lastDoneInjection.eye === 'OS' && remainingOD > 0) return 'OD';
  } else {
    // Se não houver injeções realizadas, iniciar pelo olho definido em startOD
    if (startOD) {
      return remainingOD > 0 ? 'OD' : remainingOS > 0 ? 'OS' : '';
    } else {
      return remainingOS > 0 ? 'OS' : remainingOD > 0 ? 'OD' : '';
    }
  }

  return '';
}

// Função para criar ou atualizar um paciente e marcar injeções anteriores como 'notDone'
export async function createOrUpdatePatient(input: CreateOrUpdatePatientInput): Promise<void> {
  const { refId, name, remainingOD, remainingOS, startEye, indication } = input;

  await prisma.$transaction(async (prisma) => {
    // Upsert do paciente
    const patient = await prisma.patient.upsert({
      where: { refId },
      update: {
        name,
        remainingOD,
        remainingOS,
        indication,
        startOD: startEye === 'OD',
      },
      create: {
        refId,
        name,
        remainingOD,
        remainingOS,
        indication,
        startOD: startEye === 'OD',
      },
    });

    // Marcar injeções pendentes anteriores como 'notDone = true' para este paciente
    await prisma.injection.updateMany({
      where: {
        patientId: patient.id,
        done: false,
        notDone: false,
      },
      data: {
        notDone: true,
      },
    });
  });
}

// Função para buscar dados do paciente
export async function fetchPatientData(refId: string): Promise<PatientData> {
  const patient = await prisma.patient.findUnique({
    where: { refId },
    include: {
      injections: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  return {
    id: patient.id,
    refId: patient.refId,
    name: patient.name,
    remainingOD: patient.remainingOD,
    remainingOS: patient.remainingOS,
    indication: patient.indication,
    startOD: patient.startOD,
    injections: patient.injections.map((injection) => ({
      id: injection.id,
      date: injection.date.toISOString(),
      eye: injection.OD > 0 ? 'OD' : 'OS',
      status: injection.done ? 'done' : injection.notDone ? 'notDone' : 'pending',
      done: injection.done,
      OD: injection.OD,
      OS: injection.OS,
      type: injection.type,
    })),
    // Incluir outros campos conforme necessário
  };
}

// Função para buscar injeções do paciente
export async function fetchPatientInjections(refId: string): Promise<InjectionData[]> {
  // Primeiro, encontrar o paciente pelo refId para obter o id
  const patient = await prisma.patient.findUnique({
    where: { refId },
  });

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  const injections = await prisma.injection.findMany({
    where: {
      patientId: patient.id,
    },
    orderBy: { date: 'desc' },
  });

  // Mapear injeções para o formato desejado
  return injections.map((injection) => ({
    id: injection.id,
    date: injection.date.toISOString(),
    eye: injection.OD > 0 ? 'OD' : 'OS',
    status: injection.done ? 'done' : injection.notDone ? 'notDone' : 'pending',
    done: injection.done,
    OD: injection.OD,
    OS: injection.OS,
    type: injection.type,
    // Incluir outros campos conforme necessário
  }));
}

// Função para atualizar o status da injeção
export async function updateInjectionStatus(
  injectionId: string,
  status: 'done' | 'notDone',
  type?: string
): Promise<void> {
  await prisma.injection.update({
    where: { id: injectionId },
    data: {
      done: status === 'done',
      notDone: status === 'notDone',
      ...(type !== undefined && { type }),
    },
  });
}

// Função para atualizar as injeções do paciente
export async function updatePatientInjections(refId: string, nextEye: 'OD' | 'OS', type: string): Promise<void> {
  await prisma.$transaction(async (prisma) => {
    const patient = await prisma.patient.findUnique({
      where: { refId },
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Marcar injeções pendentes anteriores como 'notDone = true'
    await prisma.injection.updateMany({
      where: {
        patientId: patient.id,
        done: false,
        notDone: false,
      },
      data: {
        notDone: true,
      },
    });

    // Atualizar o olho correto (OD ou OS) e reduzir a contagem de doses restantes
    if (nextEye === 'OD') {
      await prisma.patient.update({
        where: { id: patient.id },
        data: {
          remainingOD: { decrement: 1 },
        },
      });
    } else if (nextEye === 'OS') {
      await prisma.patient.update({
        where: { id: patient.id },
        data: {
          remainingOS: { decrement: 1 },
        },
      });
    }

    // Criar nova injeção com 'done = true' e incluir o tipo
    await prisma.injection.create({
      data: {
        patientId: patient.id,
        date: new Date(),
        OD: nextEye === 'OD' ? 1 : 0,
        OS: nextEye === 'OS' ? 1 : 0,
        done: true,
        notDone: false,
        type, // Novo campo
      },
    });
  });
}

// Função para atualizar os dados do paciente
export async function updatePatientData(input: {
  id: string;
  name: string;
  indication: string;
  remainingOD: number;
  remainingOS: number;
}): Promise<void> {
  const { id, name, remainingOD, remainingOS, indication } = input;

  await prisma.patient.update({
    where: { id },
    data: {
      name,
      indication,
      remainingOD,
      remainingOS,
    },
  });
}

// Função para ajustar as doses restantes do paciente
export async function adjustPatientDose(patientId: string, eye: 'OD' | 'OS', adjustment: number): Promise<void> {
  if (eye === 'OD') {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        remainingOD: { increment: adjustment },
      },
    });
  } else if (eye === 'OS') {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        remainingOS: { increment: adjustment },
      },
    });
  }
}
