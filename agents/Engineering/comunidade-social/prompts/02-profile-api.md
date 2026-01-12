# Prompt 02: API - Perfil Público por ID

## Objetivo
Criar endpoint para buscar perfil público de qualquer usuário pelo ID.

## Contexto
- API de perfil próprio existe em `app/api/community/profile/route.ts`
- Schema de perfil em `infra/db/06-community.sql` + extensão em `08-user-profile-extended.sql`
- Autenticação via `getTokenPayload` de `@/lib/auth`

## Instrução

Crie o arquivo `app/api/community/profile/[userId]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_POSTS_LIMIT = 5;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const db = getDb();
    
    // Verificar se usuário logado (para saber se segue)
    let currentUserId: number | null = null;
    try {
      const token = await getTokenPayload();
      currentUserId = token?.userId ?? null;
    } catch {
      // Usuário não logado - ok, continua
    }

    // Buscar perfil
    const profileRows = await db`
      SELECT
        user_profiles.user_id,
        user_profiles.display_name,
        user_profiles.avatar_url,
        user_profiles.bio,
        user_profiles.lunar_sign,
        user_profiles.cosmic_level,
        user_profiles.cosmic_points,
        user_profiles.posts_count,
        user_profiles.followers_count,
        user_profiles.following_count,
        user_profiles.streak_days,
        user_profiles.created_at AS joined_at,
        users.email
      FROM user_profiles
      JOIN users ON users.id = user_profiles.user_id
      WHERE user_profiles.user_id = ${userId}
      LIMIT 1
    `;

    const profile = profileRows?.[0];

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário logado segue este perfil
    let isFollowing = false;
    if (currentUserId && currentUserId !== Number(userId)) {
      const followCheck = await db`
        SELECT 1 FROM community_follows
        WHERE follower_id = ${currentUserId}
          AND following_id = ${userId}
        LIMIT 1
      `;
      isFollowing = followCheck.length > 0;
    }

    // Buscar posts recentes do usuário
    const recentPosts = await db`
      SELECT
        community_posts.id,
        community_posts.title,
        community_posts.body,
        community_posts.created_at,
        COALESCE(
          json_agg(DISTINCT community_tags.name)
            FILTER (WHERE community_tags.name IS NOT NULL),
          '[]'::json
        ) AS tags,
        (
          SELECT COUNT(*)
          FROM community_comments
          WHERE community_comments.post_id = community_posts.id
        ) AS comments_count
      FROM community_posts
      LEFT JOIN community_post_tags ON community_post_tags.post_id = community_posts.id
      LEFT JOIN community_tags ON community_tags.id = community_post_tags.tag_id
      WHERE community_posts.author_id = ${userId}
        AND community_posts.status = 'published'
      GROUP BY community_posts.id
      ORDER BY community_posts.created_at DESC
      LIMIT ${DEFAULT_POSTS_LIMIT}
    `;

    return NextResponse.json({
      profile: {
        userId: String(profile.user_id),
        displayName: profile.display_name ?? profile.email?.split('@')[0] ?? 'Tripulação',
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        lunarSign: profile.lunar_sign,
        cosmicLevel: profile.cosmic_level ?? 'lua-nova',
        cosmicPoints: profile.cosmic_points ?? 0,
        joinedAt: profile.joined_at,
        stats: {
          postsCount: profile.posts_count ?? 0,
          followersCount: profile.followers_count ?? 0,
          followingCount: profile.following_count ?? 0,
        },
        streakDays: profile.streak_days ?? 0,
        isFollowing,
        isOwnProfile: currentUserId === Number(userId),
      },
      recentPosts: recentPosts.map((post) => ({
        id: String(post.id),
        title: post.title,
        body: post.body,
        createdAt: post.created_at,
        tags: post.tags,
        commentsCount: Number(post.comments_count),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar perfil público:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}
```

## Resposta da API

```typescript
{
  profile: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    lunarSign: string | null;
    cosmicLevel: 'lua-nova' | 'quarto-crescente' | 'lua-cheia' | 'estrela-guia';
    cosmicPoints: number;
    joinedAt: string;
    stats: {
      postsCount: number;
      followersCount: number;
      followingCount: number;
    };
    streakDays: number;
    isFollowing: boolean;
    isOwnProfile: boolean;
  };
  recentPosts: Array<{
    id: string;
    title: string | null;
    body: string;
    createdAt: string;
    tags: string[];
    commentsCount: number;
  }>;
}
```

## Validação
- [ ] Endpoint criado em `app/api/community/profile/[userId]/route.ts`
- [ ] Retorna 404 se perfil não existe
- [ ] Retorna `isFollowing` correto
- [ ] Retorna `isOwnProfile` correto
- [ ] Posts recentes carregam corretamente

## Próximo Passo
→ Task 1.3: Componentes de Perfil
