'use client';

import { ReactNode, useState } from 'react';

interface ProcessButtonProps {
  children?: ReactNode;
}

export function ProcessButton({}: ProcessButtonProps) {
  const [isLoading, setLoading] = useState(false);
  return (
    <>
      {isLoading ? (
        <button className="btn btn-primary w-full ">
          <span className="loading loading-spinner"></span>
          Carregando...
        </button>
      ) : (
        <button type="submit" className="btn btn-primary w-full" onClick={() => setLoading(true)}>
          Processar
        </button>
      )}
    </>
  );
}
