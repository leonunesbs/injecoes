import Image from 'next/image';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';

import { MainForm, PatientForm } from '@/components';

export type Data = {
  refId: string;
  patientName: string;
  staffName: string;
  treatmentType: string;
  remainingOD?: number;
  remainingOS?: number;
  procedureDate: string;
};

export default function Page() {
  return (
    <main>
      <PatientForm />
      <section>
        <div className="flex flex-col items-center justify-start px-6 py-8 mx-auto min-h-[90vh] relative">
          <div className="mb-4 items-center flex flex-col space-y-4 text-center">
            <div className="avatar">
              <div className="rounded-full ring ring-neutral ring-offset-2 ring-offset-base-100 shadow">
                <Image alt="AntiVEGF Logo" src={'/logo.jpg'} width={100} height={100} priority quality={80} />
              </div>
            </div>
            <h1 className="font-black font-mono text-2xl">Relatório de Injeções</h1>
          </div>
          <div className="card dark:bg-base-200 w-full max-w-md shadow">
            <div className="card-body">
              <div className="flex text-center w-full justify-center">
                <Link
                  href={'http://integrash.hgf.ce.gov.br/paciente/cs_relatorios.jsf'}
                  className="link link-primary flex items-center no-underline"
                  target="_blank"
                >
                  Acessar Integra <RxExternalLink className="ml-1 w-4 h-4" />
                </Link>
              </div>
              <MainForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
