'use client';

import { ReactNode, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TbFileTypeCsv, TbFileTypeXls } from 'react-icons/tb';

import { Data } from '@/app/page';
import { processFiles } from '@/utils/fileProcessors';
import { createPdfFromData, createPdfUrl } from '@/utils/pdfGenerator';
import { sortPdfPages } from '@/utils/pdfSorter';
import { ProcessButton } from './ProcessButton';
import { ProgressBar } from './ProgressBar';

interface MainFormProps {
  children?: ReactNode;
}

type Inputs = {
  uploadedData: FileList;
};

export function MainForm({}: MainFormProps) {
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
  );
}
