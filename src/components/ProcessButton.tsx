'use client';

import { ReactNode } from 'react';

interface ProcessButtonProps {
  children?: ReactNode;
  loading: boolean;
}

export function ProcessButton({ loading }: ProcessButtonProps) {
  return (
    <>
      {loading ? (
        <button className="btn btn-primary w-full ">
          <span className="loading loading-spinner"></span>
          Carregando...
        </button>
      ) : (
        <button type="submit" className="btn btn-primary w-full">
          Processar
        </button>
      )}
    </>
  );
}
