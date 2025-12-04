import type { Metadata } from "next";
import "./globals.css";
import RadioPlayer from "@/components/RadioPlayer";
import NavMenu from '@/components/NavMenu';
import SfxProvider from '@/components/SfxProvider';
import AutoSyncLunar from '@/components/AutoSyncLunar';

export const metadata: Metadata = {
  title: "Cosmic Universe Portal",
  description: "Mini-portal imersivo com universo 2D/3D interativo."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-space-dark bg-cosmic-gradient text-slate-100">
        <SfxProvider>
          <NavMenu />
          <AutoSyncLunar />
          {children}
          <RadioPlayer />
        </SfxProvider>
      </body>
    </html>
  );
}
