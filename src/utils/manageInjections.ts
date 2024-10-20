// getInjections.ts
'use server';

import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

export async function getPatientsData(refIds: string[]): Promise<
  Prisma.PatientGetPayload<{
    include: {
      injections: true;
    };
  }>[]
> {
  'use server';

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

export async function updatePatientInjections(refId: string, nextEye: 'OD' | 'OS'): Promise<void> {
  'use server';

  // Atualiza o paciente e cria a injeção dentro de uma única transação
  await prisma.$transaction(async (prisma) => {
    // Atualiza o olho correto (OD ou OS)
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

    // Cria o registro de injeção no banco
    await prisma.injection.create({
      data: {
        patient: {
          connect: {
            refId,
          },
        },
        date: new Date(),
        OD: nextEye === 'OD' ? 1 : 0,
        OS: nextEye === 'OS' ? 1 : 0,
      },
    });
  });
}
