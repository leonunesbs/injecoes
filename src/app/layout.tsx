import '@/styles/globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `HGF - Relatórios de Injeções`,
  description: `Processa planilhas e gera relatórios.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
