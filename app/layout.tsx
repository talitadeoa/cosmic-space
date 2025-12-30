import type { Metadata } from 'next';
import './globals.css';
import { RadioPlayer } from '@/components/audio';
import { NavMenu } from '@/components/navigation';
import { SfxProvider } from '@/components/providers';
import { AutoSyncLunar } from '@/components/sync';
import { GalaxySunsSync } from '@/components/sync';

export const metadata: Metadata = {
  title: 'Flua',
  description: 'Conecte-se com os ciclos lunares e menstruais. Rastreie emoções, compreenda padrões cíclicos e explore a sabedoria cósmica.',
  keywords: ['ciclo lunar', 'ciclo menstrual', 'bem-estar feminino', 'rastreamento lunar', 'astrologia'],
  authors: [{ name: 'Talita' }],
  creator: 'Talita',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://flua.vercel.app',
    siteName: 'Flua',
    title: 'Flua',
    description: 'Conecte-se com os ciclos lunares e menstruais.',
    images: [
      {
        url: 'https://flua.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Flua',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flua',
    description: 'Conecte-se com os ciclos lunares e menstruais.',
    images: ['https://flua.vercel.app/og-image.png'],
  },
  icons: {
    icon: '/fluafavicon.ico',
    apple: '/flua-icon-192.jpeg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="pt-BR">
      <body className="min-h-[100dvh] bg-space-dark bg-cosmic-gradient text-slate-100">
        <SfxProvider>
          {isDev && <NavMenu />}
          <AutoSyncLunar />
          <GalaxySunsSync autoSync={true} />
          {children}
          <RadioPlayer />
        </SfxProvider>
      </body>
    </html>
  );
}
