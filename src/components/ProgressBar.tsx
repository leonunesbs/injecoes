import { useEffect, useState } from 'react';

interface ProgressBarProps {
  loading: boolean;
}

export function ProgressBar({ loading }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime: number;

    if (loading) {
      startTime = Date.now();
      const totalDuration = 2000; // Duração total em ms
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          const elapsedTime = Date.now() - startTime;
          // Calcula o progresso esperado baseado na relação quadrática do tempo
          // Aceleração: progresso = (tempo decorrido / tempo total)^2 * 100
          const expectedProgress = (elapsedTime / totalDuration) ** 2 * 100;
          return Math.min(expectedProgress, 100);
        });
      }, 20);

      return () => {
        setProgress(0);
        clearInterval(interval);
      };
    }
  }, [loading]);
  return (
    <div className="flex">
      {loading && <progress className="progress w-56 mx-auto progress-primary" value={progress} max="100"></progress>}
    </div>
  );
}
