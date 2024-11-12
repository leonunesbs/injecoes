// src/app/api/patients/[refId]/route.ts

import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { refId: string } }) {
  const { refId } = params;

  if (!refId) {
    return NextResponse.json({ error: 'Invalid refId' }, { status: 400 });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: {
        refId,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ name: patient.name }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Patient not found or another error',
      },
      { status: 404 }
    );
  }
}
