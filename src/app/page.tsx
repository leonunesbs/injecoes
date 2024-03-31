'use client';

import { useState } from 'react';

import { QueueForm, QueueTable } from '@/components';

export interface Data {
  patientId: string;
  patientName: string;
  staffName: string;
  procedureDate: string;
  treatmentType: string;
}

export default function Home() {
  const [queuedData, setQueuedData] = useState<Data[]>([]);

  return (
    <main className="py-10 px-4 space-y-10 w-full">
      <div className="flex gap-4">
        <div className="min-w-96 space-y-4">
          <QueueForm queuedData={queuedData} setQueuedData={setQueuedData} />
        </div>
        <QueueTable queuedData={queuedData} />
      </div>
    </main>
  );
}
