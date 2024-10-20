// server/getInjections.ts
'use server';

import prisma from '@/lib/prisma';

export type CreateOrUpdatePatientInput = {
  refId: string;
  remainingOD: number;
  remainingOS: number;
  startEye: 'OD' | 'OS';
};

// Função para criar ou atualizar um paciente, excluindo as injeções anteriores
export async function createOrUpdatePatient({
  refId,
  remainingOD,
  remainingOS,
  startEye,
}: CreateOrUpdatePatientInput): Promise<void> {
  'use server';

  await prisma.$transaction(async (prisma) => {
    // Excluir todas as injeções anteriores do paciente
    await prisma.injection.deleteMany({
      where: {
        patient: {
          refId,
        },
      },
    });

    // Atualiza ou cria o paciente com base no ID fornecido
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

// Função existente para atualizar injeções, mantida sem alterações
export async function updatePatientInjections(refId: string, nextEye: 'OD' | 'OS'): Promise<void> {
  'use server';

  await prisma.$transaction(async (prisma) => {
    // Excluir todas as injeções anteriores do paciente
    await prisma.injection.deleteMany({
      where: {
        patient: {
          refId,
        },
      },
    });

    // Atualizar o olho correto (OD ou OS)
    if (nextEye === 'OD') {
      await prisma.patient.update({
        where: { refId },
        data: {
          remainingOD: {
            decrement: 1,
          },
        },
      });
    } else if (nextEye === 'OS') {
      await prisma.patient.update({
        where: { refId },
        data: {
          remainingOS: {
            decrement: 1,
          },
        },
      });
    }
  });
}
