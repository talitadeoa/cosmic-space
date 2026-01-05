'use client';

import { memo } from 'react';
import { CalendarIcon } from './icons';

type Stream = {
  id: string;
  title: string;
  description: string;
  cadence: string;
};

type StreamCardProps = {
  stream: Stream;
};

/**
 * Card para streams editoriais (Cartas da Galáxia, etc.)
 */
export const StreamCard = memo(function StreamCard({ stream }: StreamCardProps) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 transition-colors hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{stream.title}</h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-700/70 px-2 py-0.5 text-[10px] text-slate-400">
          <CalendarIcon className="h-3 w-3" />
          {stream.cadence}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{stream.description}</p>
    </div>
  );
});

type StreamListProps = {
  streams: Stream[];
};

/**
 * Lista de streams editoriais
 */
export const StreamList = memo(function StreamList({ streams }: StreamListProps) {
  return (
    <section
      id="cartas"
      className="rounded-2xl border border-slate-800/70 bg-black/40 p-4 sm:p-5"
      aria-labelledby="streams-heading"
    >
      <h2 id="streams-heading" className="text-lg font-semibold text-white">
        Cartas & Trilhas
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Acompanhe trilhas editoriais com histórias longas e arquivadas por ciclo.
      </p>

      <div className="mt-4 space-y-3">
        {streams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </section>
  );
});
