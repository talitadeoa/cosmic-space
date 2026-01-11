'use client';

import { memo } from 'react';
import { SparklesIcon, UserGroupIcon, FireIcon, GlobeIcon } from './icons';

type Stat = {
  label: string;
  value: string | number;
  icon: 'members' | 'posts' | 'streak' | 'orbits';
  trend?: string;
};

type CommunityStatsProps = {
  stats?: Stat[];
};

const iconMap = {
  members: UserGroupIcon,
  posts: SparklesIcon,
  streak: FireIcon,
  orbits: GlobeIcon,
};

const defaultStats: Stat[] = [
  { label: 'Membros', value: '2.4k', icon: 'members', trend: '+12%' },
  { label: 'Posts hoje', value: 47, icon: 'posts', trend: '+8' },
  { label: 'Streak', value: '15 dias', icon: 'streak' },
  { label: 'Órbitas ativas', value: 128, icon: 'orbits' },
];

/**
 * Estatísticas da comunidade em tempo real
 * Mostra engajamento e atividade
 */
export const CommunityStats = memo(function CommunityStats({
  stats = defaultStats,
}: CommunityStatsProps) {
  return (
    <section
      className="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/60 via-slate-950/80 to-black/60 p-4"
      aria-labelledby="community-stats-heading"
    >
      <h2 id="community-stats-heading" className="sr-only">
        Estatísticas da comunidade
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <div
              key={stat.label}
              className="group relative flex flex-col items-center rounded-xl border border-slate-800/50 bg-black/30 p-3 text-center transition-all hover:border-indigo-400/40 hover:bg-indigo-500/5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 transition-transform group-hover:scale-110">
                <Icon className="h-4 w-4 text-indigo-300" />
              </div>
              <span className="mt-2 text-lg font-bold text-white">{stat.value}</span>
              <span className="text-[11px] text-slate-400">{stat.label}</span>
              {stat.trend && (
                <span className="absolute right-2 top-2 text-[10px] font-medium text-emerald-400">
                  {stat.trend}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
