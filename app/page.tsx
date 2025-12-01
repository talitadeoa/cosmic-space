"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

function isValidEmail(email: string): boolean {
  // Validação básica apenas para formato geral.
  return /.+@.+\..+/.test(email);
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isValidEmail(email)) {
      setError("Hmm, isso não parece um e-mail válido.");
      return;
    }

    setIsSubmitting(true);

    // Aqui você pode futuramente trocar por uma chamada real de API,
    // por exemplo: fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) })
    console.log("E-mail capturado:", email);

    // Simula um pequeno delay e depois marca como sucesso.
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 600);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-3xl border border-slate-800 bg-black/40 px-6 py-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">
            Em breve
          </p>
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
            Um novo jeito de navegar{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-rose-300 bg-clip-text text-transparent">
              sua constelação
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 md:text-base">
            Deixa seu e-mail se quiser acompanhar de perto 👀
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Formulário de captura de e-mail"
        >
          <label className="block text-sm font-medium text-slate-200">
            Seu e-mail
            <input
              type="email"
              name="email"
              autoComplete="email"
              aria-label="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              placeholder="seuemail@exemplo.com"
            />
          </label>

          {error && (
            <p className="text-sm text-rose-400" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p
              className="text-sm text-emerald-400"
              role="status"
            >
              Pronto! Vou te avisar quando lançar ✨
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">
              {isSubmitting ? "Enviando..." : "Quero ser avisado(a)"}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
