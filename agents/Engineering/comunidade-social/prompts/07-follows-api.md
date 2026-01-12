# Prompt 07: API - Seguir/Deixar de Seguir

## Objetivo
Criar endpoints para seguir e deixar de seguir usuários.

## Contexto
- Tabela `community_follows` criada em Task 2.1
- Autenticação via `getTokenPayload` de `@/lib/auth`
- Padrão de API existente em `app/api/community/posts/route.ts`

## Instrução

Crie o arquivo `app/api/community/follows/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenPayload, validateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/community/follows
 * Seguir um usuário
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Validar autenticação
    const isValid = await validateToken();
    if (!isValid) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const token = await getTokenPayload();
    const currentUserId = token?.userId;

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();
    const targetUserId = body.userId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Não pode seguir a si mesmo
    if (Number(currentUserId) === Number(targetUserId)) {
      return NextResponse.json(
        { error: 'Você não pode seguir a si mesmo' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar se usuário alvo existe
    const targetExists = await db`
      SELECT 1 FROM users WHERE id = ${targetUserId} LIMIT 1
    `;

    if (targetExists.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já segue
    const alreadyFollows = await db`
      SELECT 1 FROM community_follows 
      WHERE follower_id = ${currentUserId} 
        AND following_id = ${targetUserId}
      LIMIT 1
    `;

    if (alreadyFollows.length > 0) {
      return NextResponse.json(
        { error: 'Você já segue este usuário', isFollowing: true },
        { status: 409 }
      );
    }

    // Criar follow
    await db`
      INSERT INTO community_follows (follower_id, following_id)
      VALUES (${currentUserId}, ${targetUserId})
    `;

    // Buscar contadores atualizados do usuário alvo
    const updatedProfile = await db`
      SELECT followers_count, following_count
      FROM user_profiles
      WHERE user_id = ${targetUserId}
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      isFollowing: true,
      targetStats: {
        followersCount: updatedProfile[0]?.followers_count ?? 0,
        followingCount: updatedProfile[0]?.following_count ?? 0,
      },
    });

  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao seguir usuário' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/community/follows
 * Deixar de seguir um usuário
 * Body: { userId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Validar autenticação
    const isValid = await validateToken();
    if (!isValid) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const token = await getTokenPayload();
    const currentUserId = token?.userId;

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();
    const targetUserId = body.userId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar se segue
    const follows = await db`
      SELECT 1 FROM community_follows 
      WHERE follower_id = ${currentUserId} 
        AND following_id = ${targetUserId}
      LIMIT 1
    `;

    if (follows.length === 0) {
      return NextResponse.json(
        { error: 'Você não segue este usuário', isFollowing: false },
        { status: 409 }
      );
    }

    // Remover follow
    await db`
      DELETE FROM community_follows 
      WHERE follower_id = ${currentUserId} 
        AND following_id = ${targetUserId}
    `;

    // Buscar contadores atualizados do usuário alvo
    const updatedProfile = await db`
      SELECT followers_count, following_count
      FROM user_profiles
      WHERE user_id = ${targetUserId}
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      isFollowing: false,
      targetStats: {
        followersCount: updatedProfile[0]?.followers_count ?? 0,
        followingCount: updatedProfile[0]?.following_count ?? 0,
      },
    });

  } catch (error) {
    console.error('Erro ao deixar de seguir:', error);
    return NextResponse.json(
      { error: 'Erro ao deixar de seguir' },
      { status: 500 }
    );
  }
}
```

## Respostas da API

### POST (Seguir) - Sucesso
```json
{
  "success": true,
  "isFollowing": true,
  "targetStats": {
    "followersCount": 42,
    "followingCount": 15
  }
}
```

### DELETE (Deixar de seguir) - Sucesso
```json
{
  "success": true,
  "isFollowing": false,
  "targetStats": {
    "followersCount": 41,
    "followingCount": 15
  }
}
```

### Erros
- 401: Não autenticado
- 400: userId não fornecido ou auto-follow
- 404: Usuário alvo não existe
- 409: Já segue / Não segue

## Validação
- [ ] POST cria follow corretamente
- [ ] DELETE remove follow corretamente
- [ ] Contadores são atualizados (via trigger)
- [ ] Não permite auto-follow
- [ ] Retorna 401 se não autenticado
- [ ] Retorna 404 se usuário não existe
- [ ] Retorna 409 se já segue/não segue

## Próximo Passo
→ Task 2.3: API Lista de Seguidores/Seguindo
