'use client';

import { memo } from 'react';
import Link from 'next/link';

type ProfileStatsProps = {
  userId: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
};

export const ProfileStats = memo(function ProfileStats({
  userId,
  postsCount,
  followersCount,
  followingCount,
}: ProfileStatsProps) {
  const stats = [
    { label: 'Posts', value: postsCount, href: null },
    {
      label: 'Seguidores',
      value: followersCount,
      href: `/comunidade/perfil/${userId}/follows?type=followers`,
    },
    {
      label: 'Seguindo',
      value: followingCount,
      href: `/comunidade/perfil/${userId}/follows?type=following`,
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace('.0', '')}k`;
    }
    return num.toString();
  };

  return (
    <div className="flex justify-center gap-8 rounded-xl border border-slate-800/50 bg-black/30 p-4 sm:justify-start">
      {stats.map((stat) => {
        const content = (
          <div className="text-center">
            <span className="block text-xl font-bold text-white">{formatNumber(stat.value)}</span>
            <span className="text-xs text-slate-400">{stat.label}</span>
          </div>
        );

        if (stat.href) {
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-lg px-2 py-1 transition-colors hover:bg-slate-800/50"
            >
              {content}
            </Link>
          );
        }

        return <div key={stat.label}>{content}</div>;
      })}
    </div>
  );
});
