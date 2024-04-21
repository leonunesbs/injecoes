'use client';

import Link from 'next/link';
import { FaBolt, FaCircleInfo } from 'react-icons/fa6';

interface ProcessButtonProps {
  loading: boolean;
}

export function ProcessButton({ loading }: ProcessButtonProps) {
  return (
    <div className="space-y-2">
      {loading ? (
        <button className="btn  btn-primary w-full">
          <span className="loading loading-ring"></span>
          Aguarde...
        </button>
      ) : (
        <button type="submit" className="btn  btn-primary w-full join-item">
          <FaBolt className="h-4 w-4" />
          Processar
        </button>
      )}
      <Link href={'https://bit.ly/4d3XjY3'} className="btn btn-ghost w-full" target="_blank">
        <FaCircleInfo className="h-4 w-4" />
        Ajuda
      </Link>
    </div>
  );
}
