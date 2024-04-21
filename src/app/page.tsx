import Link from 'next/link';

import { MainForm } from '@/components';

export interface Data {
  patientId: string | number;
  patientName: string;
  staffName: string;
  procedureDate: string;
  treatmentType: string;
}

export default function Page() {
  return (
    <main>
      <section>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen relative">
          <h1 className="text-4xl text-center mb-14 font-black">HGF INJEÇÕES</h1>
          <div className="card dark:bg-base-200 w-full max-w-md shadow">
            <div className="card-body">
              <MainForm />
            </div>
          </div>
          <span className="absolute bottom-0 bg-primary text-primary-content w-full text-center text-xs py-1">
            Coded with ❤️ by{' '}
            <Link href={'https://github.com/leonunesbs'} className="link no-underline  font-bold" target="_blank">
              @leonunesbs
            </Link>
          </span>
        </div>
      </section>
    </main>
  );
}
