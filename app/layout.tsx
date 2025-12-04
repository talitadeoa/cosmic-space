import type { Metadata } from "next";
import "./globals.css";
import RadioPlayer from "@/components/RadioPlayer";

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
        {children}
        <RadioPlayer />
      </body>
    </html>
  );
}
