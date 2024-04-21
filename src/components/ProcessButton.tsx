'use client';

import Link from 'next/link';
import { FaBolt, FaCircleInfo, FaFileMedical } from 'react-icons/fa6';

interface ProcessButtonProps {
  loading: boolean;
  url?: string;
}

export function ProcessButton({ loading, url }: ProcessButtonProps) {
  return (
    <div className="join join-vertical w-full">
      {url ? (
        <button
          type="button"
          className="btn  btn-accent w-full join-item"
          onClick={() => {
            window.open(url, '_blank');
          }}
        >
          <FaFileMedical className="h-4 w-4" />
          Visualizar relatório
        </button>
      ) : loading ? (
        <button type="button" className="btn  btn-primary w-full join-item">
          <span className="loading loading-ring"></span>
          Aguarde...
        </button>
      ) : (
        <button type="submit" className="btn  btn-primary w-full join-item">
          <FaBolt className="h-4 w-4" />
          Processar
        </button>
      )}
      <Link href={'https://bit.ly/4d3XjY3'} className="btn btn-ghost w-full join-item" target="_blank">
        <FaCircleInfo className="h-4 w-4" />
        Ajuda
      </Link>
    </div>
  );
}
