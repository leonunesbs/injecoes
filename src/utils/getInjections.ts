// getInjections.ts
'use server';

import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

export async function getPatientData(patientId: string): Promise<Prisma.PatientGetPayload<{
  include: {
    injections: true;
  };
}> | null> {
  'use server';
  // Fetch patient with last application and startOD
  const patient = await prisma.patient.findUnique({
    where: {
      patientId,
    },
    include: {
      injections: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });
  return patient;
}
