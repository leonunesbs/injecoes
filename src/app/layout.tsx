import '@/styles/globals.css';

import { Metadata, Viewport } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AntiVEGF - Relatório de Injeções para Residentes do HGF',
  description: `AntiVEGF é uma plataforma restrita ao serviço de oftalmologia do Hospital Geral de Fortaleza (HGF), projetada para auxiliar os médicos residentes em suas atividades diárias, permitindo a organização de relatórios de injeções intravítreas de forma prática e rápida.`,
  category: 'medical, technology, healthcare',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  generator: 'Next.js',
  applicationName: 'AntiVEGF - Plataforma para Médicos Residentes',
  referrer: 'no-referrer-when-downgrade',
  keywords: [
    'AntiVEGF',
    'injeções intravítreas',
    'oftalmologia',
    'HGF',
    'Hospital Geral de Fortaleza',
    'residência médica',
    'glaucoma',
    'oftalmologia HGF',
    'Next.js',
    'JavaScript',
    'planilhas médicas',
    'relatórios médicos',
  ],
  authors: [{ name: 'Leonardo Nunes', url: 'https://github.com/leonunesbs' }],
  creator: 'Leonardo Nunes',
  publisher: 'Leonardo Nunes',
  openGraph: {
    title: 'AntiVEGF - Plataforma Médica para Relatórios de Injeções',
    description:
      'Plataforma restrita ao HGF para auxílio em relatórios de injeções intravítreas para médicos residentes.',
    url: 'https://antivegf.vercel.app',
    siteName: 'AntiVEGF - Plataforma para Residentes',
    images: [
      {
        url: 'https://antivegf.vercel.app/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'AntiVEGF - Relatórios Médicos para Residentes',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hgf_ce',
    title: 'AntiVEGF - Plataforma Médica',
    description: 'Plataforma médica do HGF para organizar relatórios de injeções intravítreas.',
    images: [
      {
        url: 'https://antivegf.vercel.app/logo.jpg',
        alt: 'AntiVEGF - Plataforma Médica',
      },
    ],
  },
  alternates: {
    canonical: 'https://antivegf.vercel.app',
    languages: {
      'pt-BR': 'https://antivegf.vercel.app',
    },
  },
  icons: {
    icon: [
      'favicon.ico',
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
      },
      {
        url: '/favicon-16x16.png',
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
      color: '#4d4d4f',
    },
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'AntiVEGF',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4d4d4f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-base-100 text-base-content antialiased flex flex-col">
        {children}

        <span className="bg-primary text-primary-content w-full text-center text-xs py-1">
          Coded with ❤️ by{' '}
          <Link href={'https://github.com/leonunesbs'} className="link no-underline  font-bold" target="_blank">
            @leonunesbs
          </Link>
        </span>
      </body>
    </html>
  );
}
