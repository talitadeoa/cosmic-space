'use client';

import { FormEvent, useState } from 'react';

const isValidEmail = (email: string): boolean => /.+@.+\..+/.test(email);

export default function EmailSignupForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isValidEmail(email)) {
      setError('Hmm, isso não parece um e-mail válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao registrar email');
        return;
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error('Erro:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-label="Formulário de captura de e-mail"
    >
      <label className="block text-sm font-medium text-slate-200">
        <input
          type="email"
          name="email"
          autoComplete="email"
          aria-label="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          placeholder="seuemail@exemplo.com"
        />
      </label>

      {error && (
        <p className="text-xs sm:text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-xs sm:text-sm text-emerald-400" role="status">
          Pronto! Vou te avisar quando lançar ✨
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-500 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative">{isSubmitting ? 'Enviando...' : 'Quero ser avisado(a)'}</span>
      </button>
    </form>
  );
}
