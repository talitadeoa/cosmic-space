/**
 * Exemplo de componente que usa as utilities do ciclo lunar
 * Mostra marcos principais e dias específicos do ciclo
 */

'use client';

import React from 'react';
import { useLunarCycle, useMoonCalendarMonth } from '@/hooks/useLunarCycle';
import { formatCycleEvent } from '@/lib/lunar-cycle-utils';

interface MoonCycleExampleProps {
  date?: Date;
  showCalendar?: boolean;
  year?: number;
  month?: number;
}

export const MoonCycleExample: React.FC<MoonCycleExampleProps> = ({
  date = new Date(),
  showCalendar = false,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const cycle = useLunarCycle(date);
  const calendar = useMoonCalendarMonth(year, month);

  // Exemplos de uso
  const day3Minguante = cycle.findPhaseDay('luaMinguante', 3);
  const day8Crescente = cycle.findPhaseDay('luaCrescente', 8);

  return (
    <div className="space-y-8">
      {/* Marcos Principais */}
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">🌙 Marcos do Ciclo Lunar</h2>

        <div className="space-y-3">
          <div className="rounded bg-slate-800/50 p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-sky-300">Primeiro Dia (Lua Nova):</span>
              <br />
              {formatCycleEvent(cycle.keyDates.firstDay)}
            </p>
          </div>

          <div className="rounded bg-slate-800/50 p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-amber-300">Metade Crescente:</span>
              <br />
              {formatCycleEvent(cycle.keyDates.quarterGrowth)}
            </p>
          </div>

          <div className="rounded bg-slate-800/50 p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-yellow-300">Lua Cheia:</span>
              <br />
              {formatCycleEvent(cycle.keyDates.fullMoon)}
            </p>
          </div>

          <div className="rounded bg-slate-800/50 p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-blue-300">Metade Minguante:</span>
              <br />
              {formatCycleEvent(cycle.keyDates.quarterDark)}
            </p>
          </div>

          <div className="rounded bg-slate-800/50 p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-indigo-300">Último Dia:</span>
              <br />
              {formatCycleEvent(cycle.keyDates.lastDay)}
            </p>
          </div>
        </div>
      </section>

      {/* Exemplos de Dias Específicos */}
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">📍 Dias Específicos</h2>

        <div className="space-y-3">
          <div className="rounded bg-slate-800/50 p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-emerald-300">3º dia da Minguante:</span>
              <br />
              {formatCycleEvent(day3Minguante)}
            </p>
          </div>

          <div className="rounded bg-slate-800/50 p-3">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-lime-300">8º dia da Crescente:</span>
              <br />
              {formatCycleEvent(day8Crescente)}
            </p>
          </div>
        </div>
      </section>

      {/* Calendário do Mês */}
      {showCalendar && (
        <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            📅 Calendário Lunar - {month}/{year}
          </h2>

          <div className="grid gap-2">
            {calendar.slice(0, 15).map((event) => (
              <div
                key={event.dateStr}
                className={`rounded px-3 py-2 text-xs ${
                  event.phase === 'luaNova'
                    ? 'bg-slate-800 text-slate-300'
                    : event.phase === 'luaCrescente'
                      ? 'bg-amber-900/30 text-amber-100'
                      : event.phase === 'luaCheia'
                        ? 'bg-yellow-900/30 text-yellow-100'
                        : 'bg-blue-900/30 text-blue-100'
                }`}
              >
                {event.dateStr} • {event.phaseLabel} em {event.sign}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resumo */}
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">📊 Resumo do Ciclo</h2>
        <pre className="overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-300">
          {JSON.stringify(cycle.summary, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default MoonCycleExample;
