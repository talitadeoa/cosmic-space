"use client";

import { motion } from "framer-motion";
import type { TimelineItem, TimelineItemType } from "@/types/timeline";

const typeLabels: Record<TimelineItemType, string> = {
  mensal: "Insight mensal",
  trimestral: "Insight trimestral",
  anual: "Insight anual",
  energia: "Energia lunar",
};

const typeGradients: Record<TimelineItemType, string> = {
  mensal: "from-indigo-500/30 via-sky-500/20 to-transparent",
  trimestral: "from-emerald-500/25 via-teal-500/20 to-transparent",
  anual: "from-rose-500/25 via-amber-500/20 to-transparent",
  energia: "from-violet-500/25 via-indigo-500/20 to-transparent",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatRecordedLabel = (item: TimelineItem) => {
  const date = item.phaseDate ?? item.recordedAt;
  return formatDate(date);
};

const formatPeriod = (item: TimelineItem) => {
  if (!item.period) return null;
  if (item.type === "mensal") return `Mês ${item.period}`;
  if (item.type === "trimestral") return `Trimestre ${item.period}`;
  if (item.type === "anual") return `Ano ${item.period}`;
  return null;
};

type TimelineItemCardProps = {
  item: TimelineItem;
  index: number;
};

export default function TimelineItemCard({ item, index }: TimelineItemCardProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-black/40 p-5 shadow-lg backdrop-blur"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${typeGradients[item.type]}`}
      />
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
            {typeLabels[item.type]}
          </span>
          <span className="text-xs text-slate-400">{formatRecordedLabel(item)}</span>
          {item.moonPhase ? (
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] text-indigo-200">
              {item.moonPhase}
            </span>
          ) : null}
        </div>

        {formatPeriod(item) ? (
          <p className="text-xs text-slate-400">{formatPeriod(item)}</p>
        ) : null}

        {item.insight ? (
          <p className="text-sm leading-relaxed text-slate-100">{item.insight}</p>
        ) : null}

        {item.energyLevel !== null && item.energyLevel !== undefined ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">Energia</span>
            <div className="h-2 flex-1 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-400 via-sky-400 to-rose-400"
                style={{ width: `${Math.min(Math.max(item.energyLevel, 0), 10) * 10}%` }}
              />
            </div>
            <span className="text-xs text-slate-200">{item.energyLevel}</span>
          </div>
        ) : null}
      </div>
    </motion.li>
  );
}
