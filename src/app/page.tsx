import Image from 'next/image';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';

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
          <div className="mb-4 items-center flex flex-col space-y-4 text-center">
            <div className="avatar ">
              <div className="rounded-full ring ring-neutral ring-offset-2 ring-offset-base-100 shadow">
                <Image
                  alt="Vítreo Logo"
                  src={'/logo.jpg'}
                  width={150}
                  height={150}
                  priority
                  blurDataURL="/logo.jpg"
                  placeholder="blur"
                  quality={80}
                />
              </div>
            </div>
            <h1 className="font-black font-mono text-2xl">Relatório de Injeções</h1>
          </div>
          <div className="card dark:bg-base-200 w-full max-w-md shadow">
            <div className="card-body">
              <div className="flex text-center w-full justify-center">
                <Link
                  href={'https://google.com'}
                  className="link link-primary flex items-center no-underline"
                  target="_blank"
                >
                  Acessar Integra <RxExternalLink className="ml-1 w-4 h-4" />
                </Link>
              </div>
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
