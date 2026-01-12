# Prompt 03: Componentes de Perfil

## Objetivo
Criar os componentes reutilizáveis para o perfil público expandido.

## Contexto
- Estilo existente: `app/comunidade/components/PostCard.tsx`
- Avatar existente: `app/comunidade/components/Avatar.tsx`
- Ícones existentes: `app/comunidade/components/icons.tsx`
- Cores: slate/indigo theme

## Instrução

Crie os seguintes arquivos em `app/comunidade/components/profile/`:

### 1. ProfileHeader.tsx

```typescript
'use client';

import { memo } from 'react';
import { Avatar } from '../Avatar';
import { CosmicLevelBadge } from './CosmicLevelBadge';
import { CalendarIcon, SparklesIcon } from '../icons';

type ProfileHeaderProps = {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  lunarSign: string | null;
  cosmicLevel: 'lua-nova' | 'quarto-crescente' | 'lua-cheia' | 'estrela-guia';
  cosmicPoints: number;
  joinedAt: string;
  streakDays: number;
  isOwnProfile: boolean;
  children?: React.ReactNode; // Para o FollowButton
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
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
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
            
            {lunarSign && (
              <p className="mt-1 text-sm text-indigo-300">
                🌙 {lunarSign}
              </p>
            )}

            {bio && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
                {bio}
              </p>
            )}

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
              <div className="mt-4 flex justify-center gap-3 sm:justify-start">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
```

### 2. ProfileStats.tsx

```typescript
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
    { label: 'Seguidores', value: followersCount, href: `/comunidade/perfil/${userId}/follows?type=followers` },
    { label: 'Seguindo', value: followingCount, href: `/comunidade/perfil/${userId}/follows?type=following` },
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
            <span className="block text-xl font-bold text-white">
              {formatNumber(stat.value)}
            </span>
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
```

### 3. CosmicLevelBadge.tsx

```typescript
'use client';

import { memo } from 'react';

type CosmicLevel = 'lua-nova' | 'quarto-crescente' | 'lua-cheia' | 'estrela-guia';

type CosmicLevelBadgeProps = {
  level: CosmicLevel;
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
};

const levelConfig: Record<CosmicLevel, {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  minPoints: number;
  maxPoints: number;
}> = {
  'lua-nova': {
    icon: '🌑',
    label: 'Lua Nova',
    color: 'text-slate-300',
    bgColor: 'bg-slate-800/80',
    borderColor: 'border-slate-600',
    minPoints: 0,
    maxPoints: 99,
  },
  'quarto-crescente': {
    icon: '🌓',
    label: 'Quarto Crescente',
    color: 'text-amber-300',
    bgColor: 'bg-amber-900/40',
    borderColor: 'border-amber-500/50',
    minPoints: 100,
    maxPoints: 499,
  },
  'lua-cheia': {
    icon: '🌕',
    label: 'Lua Cheia',
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-900/40',
    borderColor: 'border-indigo-400/50',
    minPoints: 500,
    maxPoints: 1999,
  },
  'estrela-guia': {
    icon: '⭐',
    label: 'Estrela Guia',
    color: 'text-amber-200',
    bgColor: 'bg-gradient-to-r from-amber-900/40 to-rose-900/40',
    borderColor: 'border-amber-400/50',
    minPoints: 2000,
    maxPoints: Infinity,
  },
};

export const CosmicLevelBadge = memo(function CosmicLevelBadge({
  level,
  points,
  size = 'md',
  showProgress = false,
  className = '',
}: CosmicLevelBadgeProps) {
  const config = levelConfig[level];
  
  const sizeClasses = {
    sm: 'text-lg px-2 py-1',
    md: 'text-xl px-3 py-1.5',
    lg: 'text-2xl px-4 py-2',
  };

  const progress = config.maxPoints === Infinity
    ? 100
    : ((points - config.minPoints) / (config.maxPoints - config.minPoints)) * 100;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div
        className={`
          inline-flex items-center gap-1.5 rounded-full border
          ${config.bgColor} ${config.borderColor} ${sizeClasses[size]}
        `}
        title={`${config.label} - ${points} pontos cósmicos`}
      >
        <span>{config.icon}</span>
        {size !== 'sm' && (
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        )}
      </div>

      {showProgress && config.maxPoints !== Infinity && (
        <div className="mt-2 w-full max-w-[120px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-center text-[10px] text-slate-500">
            {points} / {config.maxPoints + 1} pts
          </p>
        </div>
      )}
    </div>
  );
});
```

### 4. ProfilePostGrid.tsx

```typescript
'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChatBubbleIcon } from '../icons';

type Post = {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
  tags: string[];
  commentsCount: number;
};

type ProfilePostGridProps = {
  posts: Post[];
  emptyMessage?: string;
};

export const ProfilePostGrid = memo(function ProfilePostGrid({
  posts,
  emptyMessage = 'Nenhum post ainda',
}: ProfilePostGridProps) {
  const truncate = (text: string, length = 100) => {
    if (text.length <= length) return text;
    return `${text.slice(0, length).trim()}…`;
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
    return `${Math.floor(diffDays / 30)}m`;
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/50 bg-black/30 p-8 text-center">
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/comunidade/post/${post.id}`}
          className="group rounded-xl border border-slate-800/50 bg-black/30 p-4 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/5"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-white group-hover:text-indigo-300">
              {post.title || 'Pulso'}
            </h3>
            <span className="shrink-0 text-xs text-slate-500">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {truncate(post.body)}
          </p>

          <div className="mt-3 flex items-center justify-between">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <ChatBubbleIcon className="h-3 w-3" />
              {post.commentsCount}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
});
```

### 5. index.ts

```typescript
export { ProfileHeader } from './ProfileHeader';
export { ProfileStats } from './ProfileStats';
export { CosmicLevelBadge } from './CosmicLevelBadge';
export { ProfilePostGrid } from './ProfilePostGrid';
```

## Ícones Necessários

Adicione ao `icons.tsx` se não existir:

```typescript
export const CalendarIcon = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
```

## Validação
- [ ] Todos os componentes criados
- [ ] Export no index.ts
- [ ] Ícones disponíveis
- [ ] Responsivo (mobile-first)
- [ ] Acessibilidade (aria labels)

## Próximo Passo
→ Task 1.4: Página de Perfil Público
