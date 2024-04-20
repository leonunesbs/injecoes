'use client';

import Link from 'next/link';

interface ProcessButtonProps {
  loading: boolean;
}

export function ProcessButton({ loading }: ProcessButtonProps) {
  return (
    <>
      <div className="join join-vertical w-full">
        {loading ? (
          <button className="btn  btn-outline btn-primary w-full join-item">
            <span className="loading loading-spinner"></span>
            Carregando...
          </button>
        ) : (
          <button type="submit" className="btn  btn-outline btn-primary w-full join-item">
            Processar
          </button>
        )}
        <Link
          href={'https://github.com/leonunesbs/injecoes?tab=readme-ov-file#manual-de-uso'}
          className="btn  btn-outline btn-neutral w-full join-item"
          target="_blank"
        >
          Ajuda
        </Link>
      </div>
    </>
  );
}
