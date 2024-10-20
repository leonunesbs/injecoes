'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBolt, FaCircleInfo, FaFileMedical, FaPen, FaPlus } from 'react-icons/fa6';

interface ProcessButtonProps {
  loading: boolean;
  url?: string;
  onEdit?: () => void;
  onNewReport?: () => void;
  openButtonRef?: React.RefObject<HTMLButtonElement>; // Ref para gerenciar o foco
}

export function ProcessButton({ loading, url, onEdit, onNewReport, openButtonRef }: ProcessButtonProps) {
  const router = useRouter();
  const handleOpenPdf = () => {
    if (url) {
      router.push(url); // Abrir em uma nova aba
    }
  };

  return (
    <div className="flex flex-col w-full space-y-2">
      {url ? (
        <>
          {/* Botão para visualizar o relatório */}
          <button
            type="button"
            className="btn btn-accent w-full flex items-center justify-center"
            onClick={handleOpenPdf} // Chama a função que cria o Blob e abre a nova aba
            aria-label="Visualizar relatório gerado"
            ref={openButtonRef} // Foco será retornado aqui após o fechamento do modal
          >
            <FaFileMedical className="h-5 w-5 mr-2" aria-hidden="true" />
            Visualizar Relatório
          </button>

          {/* Botão para iniciar um novo relatório */}
          <button
            type="button"
            className="btn btn-primary w-full flex items-center justify-center"
            onClick={onNewReport}
            aria-label="Iniciar novo relatório"
          >
            <FaPlus className="h-5 w-5 mr-2" aria-hidden="true" />
            Novo Relatório
          </button>
        </>
      ) : loading ? (
        /* Botão de carregamento enquanto os dados estão sendo processados */
        <button
          type="button"
          className="btn btn-primary w-full flex items-center justify-center"
          disabled
          aria-label="Processamento em andamento, aguarde"
        >
          <span className="loading loading-ring mr-2" aria-hidden="true"></span>
          Processando...
        </button>
      ) : (
        <>
          {/* Botão de início para processar os dados */}
          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            aria-label="Iniciar processamento dos dados"
          >
            <FaBolt className="h-5 w-5 mr-2" aria-hidden="true" />
            Iniciar
          </button>

          {/* Botão para editar os dados antes de processar */}
          {onEdit && (
            <button
              type="button"
              className="btn btn-secondary w-full flex items-center justify-center"
              onClick={onEdit}
              aria-label="Editar os dados antes de processar"
            >
              <FaPen className="h-5 w-5 mr-2" aria-hidden="true" />
              Editar Dados
            </button>
          )}
        </>
      )}

      {/* Link de ajuda */}
      <Link
        href={'https://bit.ly/4d3XjY3'}
        className="btn btn-ghost w-full flex items-center justify-center"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Obter ajuda sobre como usar o sistema"
      >
        <FaCircleInfo className="h-5 w-5 mr-2" aria-hidden="true" />
        Ajuda
      </Link>
    </div>
  );
}
