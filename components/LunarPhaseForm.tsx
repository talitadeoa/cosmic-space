'use client';

import { FormEvent, useState } from 'react';

interface LunarPhaseFormData {
  data: string;
  faseLua: 'Nova' | 'Crescente' | 'Cheia' | 'Minguante';
  signo: string;
  energia: string;
  checks: string;
  observacoes: string;
  energiaDaFase: string;
  intencoesLua: string;
  intencoesSemana: string;
  intencoesAno: string;
}

interface LunarPhaseFormProps {
  onSuccess?: (data: LunarPhaseFormData) => void;
}

export default function LunarPhaseForm({ onSuccess }: LunarPhaseFormProps) {
  const [formData, setFormData] = useState<LunarPhaseFormData>({
    data: '',
    faseLua: 'Nova',
    signo: '',
    energia: '',
    checks: '',
    observacoes: '',
    energiaDaFase: '',
    intencoesLua: '',
    intencoesSemana: '',
    intencoesAno: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signos = [
    'Áries',
    'Touro',
    'Gêmeos',
    'Câncer',
    'Leão',
    'Virgem',
    'Libra',
    'Escorpião',
    'Sagitário',
    'Capricórnio',
    'Aquário',
    'Peixes',
  ];

  const energias = [
    'curiosa',
    'observações e notas',
    'social/extrovertida',
    'pitchs e convites',
    'poética',
    'manifesto',
    'roteiro',
    'textos',
    'analítica',
    'sistematização',
    'listas',
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validações
    if (!formData.data.trim()) {
      setError('Data é obrigatória');
      return;
    }

    if (!formData.signo.trim()) {
      setError('Signo é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/form/lunar-phase', {
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
      setFormData({
        data: '',
        faseLua: 'Nova',
        signo: '',
        energia: '',
        checks: '',
        observacoes: '',
        energiaDaFase: '',
        intencoesLua: '',
        intencoesSemana: '',
        intencoesAno: '',
      });
      onSuccess?.(formData);

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
      className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-slate-800 bg-black/40 p-4 sm:p-8 shadow-2xl backdrop-blur-md max-w-4xl"
      aria-label="Formulário de fase lunar"
    >
      <div>
        <h3 className="text-lg sm:text-2xl font-semibold text-slate-100 mb-4 sm:mb-6">
          📖 Registro da Fase Lunar
        </h3>
      </div>

      {/* Linha 1: Data e Fase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="data" className="block text-xs sm:text-sm font-medium text-slate-200">
            Data
          </label>
          <input
            type="date"
            id="data"
            name="data"
            value={formData.data}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          />
        </div>

        <div>
          <label htmlFor="faseLua" className="block text-xs sm:text-sm font-medium text-slate-200">
            Fase da Lua
          </label>
          <select
            id="faseLua"
            name="faseLua"
            value={formData.faseLua}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            <option value="Nova">🌑 Nova</option>
            <option value="Crescente">🌓 Crescente</option>
            <option value="Cheia">🌕 Cheia</option>
            <option value="Minguante">🌗 Minguante</option>
          </select>
        </div>
      </div>

      {/* Linha 2: Signo e Energia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="signo" className="block text-xs sm:text-sm font-medium text-slate-200">
            Signo
          </label>
          <select
            id="signo"
            name="signo"
            value={formData.signo}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            <option value="">Selecione um signo</option>
            {signos.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="energia" className="block text-xs sm:text-sm font-medium text-slate-200">
            Energia
          </label>
          <select
            id="energia"
            name="energia"
            value={formData.energia}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            <option value="">Selecione uma energia</option>
            {energias.map(e => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Checks - Textarea */}
      <div>
        <label htmlFor="checks" className="block text-xs sm:text-sm font-medium text-slate-200">
          Checks (tarefas completadas)
        </label>
        <p className="text-xs text-slate-400 mt-1 mb-2">
          Liste os itens com [x] para completado e [] para aberto
        </p>
        <textarea
          id="checks"
          name="checks"
          value={formData.checks}
          onChange={handleChange}
          placeholder={`[x] Tarefa completada
[] Tarefa pendente`}
          rows={6}
          className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none font-mono"
        />
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="observacoes" className="block text-xs sm:text-sm font-medium text-slate-200">
          Observações e Notas
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          placeholder="Descreva suas observações pessoais nesta fase..."
          rows={4}
          className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
        />
      </div>

      {/* Linha 3: Intenções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label htmlFor="energiaDaFase" className="block text-xs sm:text-sm font-medium text-slate-200">
            Energia da Fase
          </label>
          <textarea
            id="energiaDaFase"
            name="energiaDaFase"
            value={formData.energiaDaFase}
            onChange={handleChange}
            placeholder="Clima e energia geral da fase..."
            rows={3}
            className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
          />
        </div>

        <div>
          <label htmlFor="intencoesLua" className="block text-xs sm:text-sm font-medium text-slate-200">
            Intenções da Lua
          </label>
          <textarea
            id="intencoesLua"
            name="intencoesLua"
            value={formData.intencoesLua}
            onChange={handleChange}
            placeholder="Intenções para esta fase lunar..."
            rows={3}
            className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
          />
        </div>

        <div>
          <label htmlFor="intencoesSemana" className="block text-xs sm:text-sm font-medium text-slate-200">
            Intenções da Semana
          </label>
          <textarea
            id="intencoesSemana"
            name="intencoesSemana"
            value={formData.intencoesSemana}
            onChange={handleChange}
            placeholder="Intenções para esta semana..."
            rows={3}
            className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
          />
        </div>
      </div>

      {/* Intenções do Ano */}
      <div>
        <label htmlFor="intencoesAno" className="block text-xs sm:text-sm font-medium text-slate-200">
          Intenções do Ano
        </label>
        <textarea
          id="intencoesAno"
          name="intencoesAno"
          value={formData.intencoesAno}
          onChange={handleChange}
          placeholder="Intenções e metas para este ano..."
          rows={3}
          className="mt-2 w-full rounded-xl sm:rounded-2xl border border-slate-700 bg-black/40 px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
        />
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <p className="text-xs sm:text-sm text-rose-400" role="alert">
          ❌ {error}
        </p>
      )}

      {success && (
        <p className="text-xs sm:text-sm text-emerald-400" role="status">
          ✨ Fase lunar registrada com sucesso!
        </p>
      )}

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 px-4 py-3 sm:py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative">
          {isSubmitting ? 'Registrando...' : '🌙 Registrar Fase'}
        </span>
      </button>
    </form>
  );
}
