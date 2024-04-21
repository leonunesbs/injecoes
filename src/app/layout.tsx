import '@/styles/globals.css';

import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: `Vítreo - Relatório de Injeções`,
  robots: {
    index: false,
    follow: true,
    nocache: true,
  },
  generator: 'Next.js',
  applicationName: `Vítreo - Relatório de Injeções`,
  referrer: 'origin-when-cross-origin',
  keywords: ['Next.js', 'React', 'JavaScript', 'HGF', 'njeções intravítreas'],
  authors: [{ name: 'Leonardo Nunes', url: 'https://github.com/leonunesbs' }],
  creator: 'Leonardo Nunes',
  publisher: 'Leonardo Nunes',
  openGraph: {
    title: 'Vítreo Injeções',
    description: `Processa planilhas e gera relatórios.`,
    url: 'https://vitreo.in',
    siteName: `Vítreo - Relatório de Injeções`,
    images: [
      {
        url: 'https://vitreo.in/logo.jpg',
        width: 400,
        height: 400,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: [
      'favicon.ico',
      {
        url: '/facicon-32x32.png',
        sizes: '32x32',
      },
      {
        url: '/facicon-16x16.png',
        sizes: '16x16',
      },
    ],
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    other: {
      rel: 'mask-icon',
      url: '/safari-pinned-tab.svg',
      color: '#5773ff',
    },
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#fff',

  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
