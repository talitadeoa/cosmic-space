import type { Metadata } from "next";
import "./globals.css";
import RadioPlayer from "@/components/RadioPlayer";
import NavMenu from '@/components/NavMenu';
import SfxProvider from '@/components/SfxProvider';
import AutoSyncLunar from '@/components/AutoSyncLunar';
import { GalaxySunsSync } from '@/components/GalaxySunsSync';

export const metadata: Metadata = {
  title: "Em breve",
  description: "Em breve"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
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
