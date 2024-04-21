'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TbFileTypeCsv, TbFileTypeXls } from 'react-icons/tb';

import { ProcessButton, ProgressBar } from '@/components';
import { processFiles } from '@/utils/fileProcessors';
import { createPdfFromData, createPdfUrl } from '@/utils/pdfGenerator';
import { sortPdfPages } from '@/utils/pdfSorter';

export interface Data {
  patientId: string | number;
  patientName: string;
  staffName: string;
  procedureDate: string;
  treatmentType: string;
}

type Inputs = {
  uploadedData: FileList;
};

export default function Page() {
  const { register, handleSubmit } = useForm<Inputs>({});

  async function sortAndSavePdf(processedData: Data[]): Promise<Uint8Array> {
    const modelPDFBytes = await fetch('/modelo.pdf').then((res) => res.arrayBuffer());
    const pdfDoc = await createPdfFromData(processedData, modelPDFBytes);
    const sortedPdf = await sortPdfPages(pdfDoc);
    return sortedPdf.save();
  }

  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async ({ uploadedData }) => {
    setLoading(true);
    const processedData = await processFiles(uploadedData);
    const sortedPdfBytes = await sortAndSavePdf(processedData);

    const url = createPdfUrl(sortedPdfBytes);
    setTimeout(() => {
      setLoading(false);
      window.open(url, '_blank');
    }, 2000);
  };

  return (
    <main>
      <section>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen relative">
          <h1 className="text-4xl text-center mb-14 font-black">HGF INJEÇÕES</h1>
          <div className="card dark:bg-base-200 w-full max-w-md shadow">
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-control">
                  <label htmlFor="uploadedData" className="label label-text">
                    Arquivo XLS, XLXS ou CSV:
                    <div className="join join-horizontal">
                      <TbFileTypeXls className="h-5 w-5 join-item" />
                      <TbFileTypeCsv className="h-5 w-5 join-item" />
                    </div>
                  </label>
                  <input
                    {...register('uploadedData')}
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    className="file-input file-input-bordered"
                    required
                  />
                </div>
                <ProgressBar loading={loading} />
                <ProcessButton loading={loading} />
              </form>
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
