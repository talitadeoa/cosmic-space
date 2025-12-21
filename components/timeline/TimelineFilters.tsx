"use client";

import type { TimelineFiltersState, TimelineItemType, TimelinePeriod } from "@/types/timeline";

const typeOptions: { value: TimelineItemType; label: string }[] = [
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "anual", label: "Anual" },
  { value: "energia", label: "Energia" },
];

const periodOptions: { value: TimelinePeriod; label: string }[] = [
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "1y", label: "Último ano" },
];

const moonPhaseSuggestions = [
  "Lua Nova",
  "Lua Crescente",
  "Lua Cheia",
  "Lua Minguante",
];

type TimelineFiltersProps = {
  filters: TimelineFiltersState;
  typeError: string | null;
  onPeriodChange: (value: TimelinePeriod) => void;
  onMoonPhaseChange: (value: string | null) => void;
  onTypeToggle: (value: TimelineItemType) => void;
};

export default function TimelineFilters({
  filters,
  typeError,
  onPeriodChange,
  onMoonPhaseChange,
  onTypeToggle,
}: TimelineFiltersProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-black/40 p-4 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1.5fr]">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Período
          <select
            value={filters.period}
            onChange={(event) => onPeriodChange(event.target.value as TimelinePeriod)}
            className="w-full rounded-2xl border border-slate-700 bg-black/60 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          Fase lunar
          <input
            list="timeline-moon-phases"
            value={filters.moonPhase ?? ""}
            onChange={(event) =>
              onMoonPhaseChange(event.target.value ? event.target.value : null)
            }
            placeholder="Todas as fases"
            className="w-full rounded-2xl border border-slate-700 bg-black/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <datalist id="timeline-moon-phases">
            {moonPhaseSuggestions.map((phase) => (
              <option key={phase} value={phase} />
            ))}
          </datalist>
        </label>

        <div className="flex flex-col gap-2 text-sm text-slate-200">
          <span>Tipos</span>
          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={filters.types.includes(option.value)}
                  onChange={() => onTypeToggle(option.value)}
                  className="h-3.5 w-3.5 rounded border-slate-500 text-indigo-500 focus:ring-indigo-500"
                />
                {option.label}
              </label>
            ))}
          </div>
          {typeError ? (
            <span className="text-xs text-rose-400">{typeError}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
