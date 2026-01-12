# Prompt 05: Link para Perfil nos Posts

## Objetivo
Modificar o `PostCard` para que o avatar e nome do autor sejam clicáveis e levem ao perfil público.

## Contexto
- PostCard atual em `app/comunidade/components/PostCard.tsx`
- Página de perfil em `/comunidade/perfil/[userId]`
- Tipo `CommunityPost` precisa incluir `authorId`

## Instrução

### 1. Atualizar tipo CommunityPost

Em `types/community.ts`:

```typescript
export type CommunityPost = {
  id: string;
  authorId?: string;  // ADICIONAR
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  title?: string | null;
  body: string;
  tags: string[];
  commentsCount: number;
};
```

### 2. Atualizar API de Posts

Em `app/api/community/posts/route.ts`, adicionar ao SELECT:

```sql
community_posts.author_id,  -- ADICIONAR
```

E no mapeamento de resposta:

```typescript
authorId: String(row.author_id),  // ADICIONAR
```

### 3. Modificar PostCard.tsx

```typescript
'use client';

import { memo, type FormEvent } from 'react';
import Link from 'next/link';  // ADICIONAR
import type { CommunityPost } from '@/types/community';
import { Avatar } from './Avatar';
import {
  SparklesIcon,
  HandThumbUpIcon,
  BookmarkIcon,
  BookmarkOutlineIcon,
  ChatBubbleIcon,
  PaperAirplaneIcon,
} from './icons';

type PostCardProps = {
  post: CommunityPost;
  formatRelativeTime: (date: string) => string;
  classifyPost: (post: CommunityPost) => string;
  truncate: (text: string, length?: number) => string;
  isSaved: boolean;
  reactions: { energia: number; apoio: number };
  commentValue: string;
  commentStatus: 'idle' | 'saving' | 'error';
  commentError: string;
  onToggleSave: () => void;
  onReaction: (type: 'energia' | 'apoio') => void;
  onCommentChange: (value: string) => void;
  onCommentSubmit: (event: FormEvent) => void;
};

export const PostCard = memo(function PostCard({
  post,
  formatRelativeTime,
  classifyPost,
  truncate,
  isSaved,
  reactions,
  commentValue,
  commentStatus,
  commentError,
  onToggleSave,
  onReaction,
  onCommentChange,
  onCommentSubmit,
}: PostCardProps) {
  const postType = classifyPost(post);
  
  // Componente de autor clicável
  const AuthorInfo = () => {
    const content = (
      <>
        <Avatar
          src={post.authorAvatarUrl}
          alt={`Avatar de ${post.authorName}`}
          name={post.authorName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
              {post.authorName}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <time className="text-xs text-slate-500" dateTime={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>
          <span className="mt-0.5 inline-block rounded-full border border-slate-700/70 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
            {postType}
          </span>
        </div>
      </>
    );

    // Se temos authorId, fazer link clicável
    if (post.authorId) {
      return (
        <Link
          href={`/comunidade/perfil/${post.authorId}`}
          className="group flex items-start gap-3"
          aria-label={`Ver perfil de ${post.authorName}`}
        >
          {content}
        </Link>
      );
    }

    // Fallback sem link
    return <div className="flex items-start gap-3">{content}</div>;
  };

  return (
    <article
      className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 transition-colors hover:border-indigo-400/40"
      aria-labelledby={`post-title-${post.id}`}
    >
      {/* Header: Avatar + Author + Meta */}
      <AuthorInfo />

      {/* Content */}
      <div className="mt-3">
        <h3
          id={`post-title-${post.id}`}
          className="text-base font-semibold leading-snug text-white sm:text-lg"
        >
          {post.title || 'Pulso da comunidade'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {truncate(post.body, 180)}
        </p>
      </div>

      {/* ... resto do componente permanece igual ... */}
    </article>
  );
});
```

### 4. Atualizar mapeamento na página

Em `app/comunidade/page.tsx`, atualizar `mapApiPost`:

```typescript
const mapApiPost = (post: any): CommunityPost => ({
  id: String(post.id),
  authorId: post.author?.id ? String(post.author.id) : undefined,  // ADICIONAR
  authorName: post.author?.name ?? 'Tripulação',
  authorAvatarUrl: post.author?.avatarUrl ?? null,
  createdAt: post.createdAt ?? new Date().toISOString(),
  title: post.title ?? null,
  body: post.body ?? '',
  tags: Array.isArray(post.tags) ? post.tags : [],
  commentsCount: Number(post.commentsCount ?? 0),
});
```

### 5. Atualizar resposta da API

Em `app/api/community/posts/route.ts`, modificar o mapeamento de posts:

```typescript
const posts = rows.map((row) => ({
  id: String(row.id),
  title: row.title,
  body: row.body,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  author: {
    id: String(row.author_id),  // ADICIONAR
    name: row.author_name,
    email: row.author_email,
    avatarUrl: row.author_avatar_url,
  },
  tags: row.tags,
  images: row.images,
  commentsCount: Number(row.comments_count),
}));
```

## Validação
- [ ] Clicar no avatar abre perfil
- [ ] Clicar no nome abre perfil
- [ ] Hover mostra efeito visual (text-indigo-300)
- [ ] Fallback funciona se authorId não existir
- [ ] Aria-label para acessibilidade

## Próximo Passo
→ Task 1.6: Verificar CosmicLevelBadge (já incluído no 03)
→ Task 1.7: Testes da Fase 1
