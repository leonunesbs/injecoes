// utils/manageInjections.ts

'use server';

import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

// --- Tipos ---

export interface PatientData {
  id: string; // Patient.id
  refId: string; // Patient.refId
  name: string;
  remainingOD: number;
  remainingOS: number;
  startOD: boolean;
  // Incluir outros campos do paciente conforme necessário
}

export interface InjectionData {
  id: string;
  date: string;
  eye: 'OD' | 'OS';
  status: 'done' | 'notDone' | 'pending';
  // Incluir outros campos da injeção conforme necessário
}

// Tipo para criar ou atualizar um paciente
export type CreateOrUpdatePatientInput = {
  refId: string;
  name: string;
  remainingOD: number;
  remainingOS: number;
  startEye: 'OD' | 'OS';
};

// Função para obter dados de pacientes com suas injeções mais recentes
export async function getPatientsData(refIds: string[]): Promise<
  Prisma.PatientGetPayload<{
    include: {
      injections: true;
    };
  }>[]
> {
  const patients = await prisma.patient.findMany({
    where: {
      refId: {
        in: refIds,
      },
    },
    include: {
      injections: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });

  return patients;
}

// Função para criar ou atualizar um paciente e marcar injeções anteriores como 'notDone'
export async function createOrUpdatePatient(input: CreateOrUpdatePatientInput): Promise<void> {
  const { refId, name, remainingOD, remainingOS, startEye } = input;

  await prisma.$transaction(async (prisma) => {
    // Upsert do paciente
    const patient = await prisma.patient.upsert({
      where: { refId },
      update: {
        name,
        remainingOD,
        remainingOS,
        startOD: startEye === 'OD',
      },
      create: {
        refId,
        name,
        remainingOD,
        remainingOS,
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
    startOD: patient.startOD,
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
    eye: injection.OD ? 'OD' : 'OS',
    status: injection.done ? 'done' : injection.notDone ? 'notDone' : 'pending',
    // Incluir outros campos conforme necessário
  }));
}

// Função para atualizar o status da injeção
export async function updateInjectionStatus(injectionId: string, status: 'done' | 'notDone'): Promise<void> {
  await prisma.injection.update({
    where: { id: injectionId },
    data: {
      done: status === 'done',
      notDone: status === 'notDone',
    },
  });
}

// Função para atualizar as injeções do paciente
export async function updatePatientInjections(refId: string, nextEye: 'OD' | 'OS'): Promise<void> {
  await prisma.$transaction(async (prisma) => {
    // Primeiro, encontrar o paciente pelo refId para obter o id
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

    // Criar nova injeção com 'done = true'
    await prisma.injection.create({
      data: {
        patientId: patient.id,
        date: new Date(),
        OD: nextEye === 'OD' ? 1 : 0,
        OS: nextEye === 'OS' ? 1 : 0,
        done: true, // Injeção marcada como realizada
        notDone: false,
      },
    });
  });
}

// Função para marcar uma injeção como não realizada
export async function markInjectionNotDone(injectionId: string): Promise<void> {
  await prisma.injection.update({
    where: { id: injectionId },
    data: {
      done: false,
      notDone: true,
    },
  });
}

// Função para atualizar os dados do paciente
export async function updatePatientData(input: {
  id: string;
  name: string;
  remainingOD: number;
  remainingOS: number;
}): Promise<void> {
  const { id, name, remainingOD, remainingOS } = input;

  await prisma.patient.update({
    where: { id },
    data: {
      name,
      remainingOD,
      remainingOS,
    },
  });
}
