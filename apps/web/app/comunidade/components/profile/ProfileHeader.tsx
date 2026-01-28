'use client';

import { memo } from 'react';
import { Avatar } from '../Avatar';
import { CosmicLevelBadge } from './CosmicLevelBadge';
import { CalendarIcon, SparklesIcon } from '../icons';

type CosmicLevel = 'lua-nova' | 'quarto-crescente' | 'lua-cheia' | 'estrela-guia';

type ProfileHeaderProps = {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  lunarSign: string | null;
  cosmicLevel: CosmicLevel;
  cosmicPoints: number;
  joinedAt: string;
  streakDays: number;
  isOwnProfile: boolean;
  children?: React.ReactNode;
};

export const ProfileHeader = memo(function ProfileHeader({
  displayName,
  avatarUrl,
  bio,
  lunarSign,
  cosmicLevel,
  cosmicPoints,
  joinedAt,
  streakDays,
  isOwnProfile,
  children,
}: ProfileHeaderProps) {
  const formatJoinedDate = (date: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(date));
    } catch {
      return 'data desconhecida';
    }
  };

  return (
    <header className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black p-6">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Avatar + Info Principal */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <Avatar
              src={avatarUrl}
              alt={displayName}
              name={displayName}
              size="xl"
              className="ring-4 ring-slate-800"
            />
            <CosmicLevelBadge
              level={cosmicLevel}
              points={cosmicPoints}
              className="absolute -bottom-2 -right-2"
              size="sm"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>

            {lunarSign && <p className="mt-1 text-sm text-indigo-300">🌙 {lunarSign}</p>}

            {bio && <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">{bio}</p>}

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-400 sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                Entrou em {formatJoinedDate(joinedAt)}
              </span>
              {streakDays > 0 && (
                <span className="inline-flex items-center gap-1.5 text-amber-400">
                  <SparklesIcon className="h-4 w-4" />
                  {streakDays} dias de streak
                </span>
              )}
            </div>

            {/* Ações (FollowButton via children) */}
            {children && (
              <div className="mt-4 flex justify-center gap-3 sm:justify-start">{children}</div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
