// utils/manageInjections.ts

'use server';

import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

// --- Tipos ---

export interface InjectionData {
  id: string;
  date: string;
  eye: 'OD' | 'OS' | ''; // Inclui string vazia
  status: 'done' | 'notDone' | 'pending';
  done: boolean;
  OD: number;
  OS: number;
  type: string;
}

export interface PatientData {
  id: string;
  refId: string;
  name: string;
  indication: string;
  remainingOD: number;
  remainingOS: number;
  startOD: boolean;
  injections: InjectionData[];
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
      eye: injection.OD > 0 ? 'OD' : injection.OS > 0 ? 'OS' : '', // Ajuste para lidar com OD e OS iguais a 0
      status: injection.done ? 'done' : injection.notDone ? 'notDone' : 'pending',
      done: injection.done,
      OD: injection.OD,
      OS: injection.OS,
      type: injection.type,
    })),
  }));
}

// Função ajustada determineNextEye para consultar o banco de dados
export async function determineNextEye(refId: string): Promise<'OD' | 'OS' | ''> {
  // Buscar os dados do paciente, incluindo injeções
  const patient = await prisma.patient.findUnique({
    where: { refId },
    include: {
      injections: {
        where: {
          done: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!patient) return '';

  const { injections, remainingOD, remainingOS, startOD } = patient;

  // O array 'injections' contém apenas as injeções com 'done: true'
  const lastDoneInjection = injections[0];

  if (remainingOD <= 0 && remainingOS <= 0) {
    // Sem injeções restantes
    return '';
  }

  if (lastDoneInjection) {
    const lastEye = lastDoneInjection.OD > 0 ? 'OD' : 'OS';

    if (lastEye === 'OD' && remainingOS > 0) return 'OS';
    if (lastEye === 'OS' && remainingOD > 0) return 'OD';
    // Se o último olho foi 'OD', mas não há injeções OS restantes
    if (lastEye === 'OD' && remainingOD > 0) return 'OD';
    if (lastEye === 'OS' && remainingOS > 0) return 'OS';
  } else {
    // Se não houver injeções realizadas, iniciar pelo olho definido em startOD
    if (startOD) {
      return remainingOD > 0 ? 'OD' : remainingOS > 0 ? 'OS' : '';
    } else {
      return remainingOS > 0 ? 'OS' : remainingOD > 0 ? 'OD' : '';
    }
  }

  // Se nenhuma das condições acima for atendida
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

    // Marcar injeções pendentes anteriores como 'notDone' para este paciente
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
      eye: injection.OD > 0 ? 'OD' : injection.OS > 0 ? 'OS' : '', // Ajuste para lidar com OD e OS iguais a 0
      status: injection.done ? 'done' : injection.notDone ? 'notDone' : 'pending',
      done: injection.done,
      OD: injection.OD,
      OS: injection.OS,
      type: injection.type,
    })),
  };
}

// Função para buscar injeções do paciente
export async function fetchPatientInjections(refId: string): Promise<InjectionData[]> {
  // Primeiro, encontrar o paciente pelo refId para obter o id
  const patient = await prisma.patient.findUnique({
    where: { refId },
    select: { id: true },
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
    eye: injection.OD > 0 ? 'OD' : injection.OS > 0 ? 'OS' : '', // Ajuste para lidar com OD e OS iguais a 0
    status: injection.done ? 'done' : injection.notDone ? 'notDone' : 'pending',
    done: injection.done,
    OD: injection.OD,
    OS: injection.OS,
    type: injection.type,
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

// Função para atualizar injeções de múltiplos pacientes com uma única transação
export async function updateMultiplePatientInjections(updatedData: any[]): Promise<void> {
  // Mapear os refIds dos pacientes para busca em lote
  const refIds = updatedData.map((item) => item.refId);

  await prisma.$transaction(
    async (prisma) => {
      // Buscar todos os pacientes de uma vez
      const patients = await prisma.patient.findMany({
        where: { refId: { in: refIds } },
        select: {
          id: true,
          refId: true,
          remainingOD: true,
          remainingOS: true,
        },
      });

      // Mapear pacientes por refId para acesso rápido durante o processamento
      const patientMap = new Map(patients.map((patient) => [patient.refId, patient]));

      // Preparar operações de atualização de injeções pendentes para todos os pacientes de uma só vez
      const updateInjections = prisma.injection.updateMany({
        where: {
          patientId: { in: patients.map((p) => p.id) },
          done: false,
          notDone: false,
        },
        data: {
          notDone: true,
        },
      });

      // Preparar dados para criar novas injeções e atualizar doses
      const newInjectionsData: Prisma.InjectionCreateManyInput[] = [];
      const patientUpdates: Prisma.PatientUpdateArgs[] = [];

      for (const item of updatedData) {
        const patient = patientMap.get(item.refId);
        // Se o paciente não for encontrado, pula para o próximo item
        if (!patient) {
          continue;
        }

        // Determinar o próximo olho usando a função atualizada determineNextEye
        const nextEye = await determineNextEye(item.refId);

        // Se não houver próximo olho, pula o processamento deste paciente
        if (!nextEye) {
          continue;
        }

        // Preparar nova injeção para este paciente
        newInjectionsData.push({
          patientId: patient.id,
          date: new Date(),
          OD: nextEye === 'OD' ? 1 : 0,
          OS: nextEye === 'OS' ? 1 : 0,
          done: true,
          notDone: false,
          type: item.treatmentType,
        });

        // Preparar atualização de doses restantes para o olho correto
        if (nextEye === 'OD') {
          patientUpdates.push({
            where: { id: patient.id },
            data: { remainingOD: { decrement: 1 } },
          });
        } else if (nextEye === 'OS') {
          patientUpdates.push({
            where: { id: patient.id },
            data: { remainingOS: { decrement: 1 } },
          });
        }
      }

      // Executar as atualizações e criações em uma transação única
      await Promise.all([
        updateInjections,
        prisma.injection.createMany({ data: newInjectionsData }),
        ...patientUpdates.map((update) => prisma.patient.update(update)),
      ]);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
      maxWait: 5000, // default: 2000
      timeout: 15000, // default: 5000
    }
  );
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
