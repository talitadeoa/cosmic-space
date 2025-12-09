"use client";

import Link from "next/link";
import { CelestialObject } from "../components/CelestialObject";

export default function SolPreviewPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <Link
          href="/cosmos"
          className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-100 transition hover:border-sky-200/60 hover:bg-sky-500/15"
        >
          ← Voltar
        </Link>
      </div>

      <div className="relative aspect-square w-[min(70vh,72vw)] max-w-xl">
        <div className="absolute inset-0 -z-10 blur-3xl bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.25),rgba(8,47,73,0))]" />
        <div className="absolute inset-[16%] rounded-full border border-sky-100/20" />
        <CelestialObject type="sol" size="md" interactive />
      </div>
    </main>
  );
}
