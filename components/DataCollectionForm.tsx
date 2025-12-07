// components/DataCollectionForm.tsx
'use client';

import { FormEvent, useState } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface DataCollectionFormProps {
  onSuccess?: () => void;
}

export default function DataCollectionForm({ onSuccess }: DataCollectionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validações
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.email.match(/.+@.+\..+/)) {
      setError('Email inválido');
      return;
    }

    if (!formData.message.trim()) {
      setError('Mensagem é obrigatória');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar formulário');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      onSuccess?.();

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao enviar formulário'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl sm:rounded-3xl border border-slate-800 bg-black/40 p-4 sm:p-6 shadow-2xl backdrop-blur-md"
      aria-label="Formulário de coleta de dados"
    >
      <h3 className="text-base sm:text-lg font-semibold text-slate-100">
        Compartilhe sua experiência
      </h3>

      <div>
        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-slate-200">
          Nome
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Seu nome completo"
          className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-200">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu.email@exemplo.com"
          className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-slate-200">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Compartilhe suas observações, ideias ou feedback..."
          rows={4}
          className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs sm:text-sm text-rose-400" role="alert">
          ❌ {error}
        </p>
      )}

      {success && (
        <p className="text-xs sm:text-sm text-emerald-400" role="status">
          ✨ Obrigado! Seus dados foram salvos com sucesso
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-500 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative">
          {isSubmitting ? 'Enviando...' : 'Enviar Dados'}
        </span>
      </button>
      <div className="mt-3 text-xs text-slate-500">© {new Date().getFullYear()} Cosmic Space — Todos os direitos reservados</div>
    </form>
  );
}
