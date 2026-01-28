'use client';

import { memo } from 'react';
import { Avatar } from './Avatar';

type Member = {
  id: string;
  name: string;
  avatarUrl?: string;
  status: 'online' | 'recently' | 'away';
};

type ActiveMembersProps = {
  members?: Member[];
  totalOnline?: number;
};

const defaultMembers: Member[] = [
  { id: '1', name: 'Luna', status: 'online' },
  { id: '2', name: 'Sol', status: 'online' },
  { id: '3', name: 'Estrela', status: 'online' },
  { id: '4', name: 'Aurora', status: 'recently' },
  { id: '5', name: 'Cosmos', status: 'recently' },
];

const statusColors = {
  online: 'bg-emerald-400',
  recently: 'bg-amber-400',
  away: 'bg-slate-500',
};

/**
 * Membros ativos na comunidade
 * Mostra presença e conexão em tempo real
 */
export const ActiveMembers = memo(function ActiveMembers({
  members = defaultMembers,
  totalOnline = 47,
}: ActiveMembersProps) {
  const onlineMembers = members.filter((m) => m.status === 'online');
  const recentMembers = members.filter((m) => m.status === 'recently');

  return (
    <section
      className="rounded-2xl border border-slate-800/70 bg-black/40 p-4 sm:p-5"
      aria-labelledby="active-members-heading"
    >
      <div className="flex items-center justify-between">
        <h2 id="active-members-heading" className="text-sm font-semibold text-white">
          Tripulação ativa
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs text-emerald-400">{totalOnline} online</span>
        </div>
      </div>

      {/* Avatars empilhados */}
      <div className="mt-4 flex items-center">
        <div className="flex -space-x-2">
          {onlineMembers.slice(0, 4).map((member) => (
            <div key={member.id} className="relative">
              <Avatar
                src={member.avatarUrl}
                alt={member.name}
                name={member.name}
                size="sm"
                className="ring-2 ring-slate-950"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${statusColors[member.status]}`}
              />
            </div>
          ))}
          {totalOnline > 4 && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300 ring-2 ring-slate-950">
              +{totalOnline - 4}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {recentMembers.length > 0 && (
        <div className="mt-4 border-t border-slate-800/50 pt-3">
          <p className="text-xs text-slate-500">Recentemente ativos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentMembers.map((member) => (
              <span
                key={member.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-900/50 px-2.5 py-1 text-xs text-slate-400"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusColors[member.status]}`} />
                {member.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
});
