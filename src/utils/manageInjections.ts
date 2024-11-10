'use server';

import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

export type CreateOrUpdatePatientInput = {
  refId: string;
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

// Função para criar ou atualizar um paciente e marcar injeções anteriores como `done` ou `notDone`
export async function createOrUpdatePatient({
  refId,
  remainingOD,
  remainingOS,
  startEye,
}: CreateOrUpdatePatientInput): Promise<void> {
  await prisma.$transaction(async (prisma) => {
    // Marcar injeções pendentes anteriores como `notDone = true`
    await prisma.injection.updateMany({
      where: {
        patient: { refId },
        done: false,
        notDone: false,
      },
      data: {
        notDone: true,
      },
    });

    // Atualiza ou cria o paciente
    await prisma.patient.upsert({
      where: { refId },
      update: {
        remainingOD,
        remainingOS,
        startOD: startEye === 'OD',
      },
      create: {
        refId,
        remainingOD,
        remainingOS,
        startOD: startEye === 'OD',
      },
    });
  });
}

// Função para atualizar injeções, considerando `done` e `notDone` quando aplicável
export async function updatePatientInjections(refId: string, nextEye: 'OD' | 'OS'): Promise<void> {
  await prisma.$transaction(async (prisma) => {
    // Marcar as injeções pendentes anteriores como `notDone = true` antes do novo processamento, se necessário
    await prisma.injection.updateMany({
      where: {
        patient: { refId },
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
        where: { refId },
        data: {
          remainingOD: { decrement: 1 },
        },
      });
    } else if (nextEye === 'OS') {
      await prisma.patient.update({
        where: { refId },
        data: {
          remainingOS: { decrement: 1 },
        },
      });
    }

    // Criar nova injeção com `done = true`
    await prisma.injection.create({
      data: {
        patient: { connect: { refId } },
        date: new Date(),
        OD: nextEye === 'OD' ? 1 : 0,
        OS: nextEye === 'OS' ? 1 : 0,
        done: true, // Injeção marcada como realizada
        notDone: false,
      },
    });
  });
}

export async function markInjectionNotDone(injectionId: string): Promise<void> {
  await prisma.injection.update({
    where: { id: injectionId },
    data: {
      done: false,
      notDone: true,
    },
  });
}
