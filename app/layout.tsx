import type { Metadata } from 'next';
import './globals.css';
import { RadioPlayer } from '@/components/audio';
import { NavMenu } from '@/components/navigation';
import { SfxProvider } from '@/components/providers';
import { AutoSyncLunar } from '@/components/sync';
import { GalaxySunsSync } from '@/components/sync';

export const metadata: Metadata = {
  title: 'Em breve',
  description: 'Em breve',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-[100dvh] bg-space-dark bg-cosmic-gradient text-slate-100">
        <SfxProvider>
          <NavMenu />
          <AutoSyncLunar />
          <GalaxySunsSync autoSync={true} />
          {children}
          <RadioPlayer />
        </SfxProvider>
      </body>
    </html>
  );
}
