import type { Metadata } from 'next';
import './globals.css';
import { RadioPlayer } from '@/components/audio';
import { NavMenu } from '@/components/navigation';
import { AppProviders } from '@/components/providers';
import { APP_URLS } from '@/lib/utils/urls';

export const metadata: Metadata = {
  title: 'Flua',
  description:
    'Conecte-se com os ciclos lunares. Rastreie emoções, compreenda padrões cíclicos e explore a sabedoria cósmica.',
  keywords: [
    'ciclo lunar',
    'bem-estar feminino',
    'rastreamento lunar',
    'astrologia',
  ],
  authors: [{ name: 'Talita' }],
  creator: 'Talita',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URLS.PRODUCTION,
    siteName: 'Flua',
    title: 'Flua',
    description: 'Conecte-se com os ciclos lunares e menstruais.',
    images: [
      {
        url: `${APP_URLS.PRODUCTION}${APP_URLS.OG_IMAGE}`,
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
    images: [`${APP_URLS.PRODUCTION}${APP_URLS.OG_IMAGE}`],
  },
  icons: {
    icon: APP_URLS.FAVICON,
    apple: APP_URLS.APPLE_ICON,
  },
  manifest: APP_URLS.MANIFEST,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="pt-BR">
      <body className="min-h-[100dvh] bg-space-dark bg-cosmic-gradient text-slate-100">
        <AppProviders>
          <NavMenu showDevRoutes={isDev} />
          {children}
          <RadioPlayer />
        </AppProviders>
      </body>
    </html>
  );
}
