# Prompt 12: API - Adicionar/Remover Reações

## Objetivo
Criar endpoint para gerenciar reações em posts (toggle).

## Contexto
- Tabela `community_reactions` criada em Task 3.1
- Tipos de reação: energia, apoio, lua, estrela
- Comportamento: toggle (adiciona se não existe, remove se existe)

## Instrução

Crie o arquivo `app/api/community/posts/[id]/reactions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenPayload, validateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_REACTION_TYPES = ['energia', 'apoio', 'lua', 'estrela'] as const;
type ReactionType = typeof VALID_REACTION_TYPES[number];

function isValidReactionType(type: string): type is ReactionType {
  return VALID_REACTION_TYPES.includes(type as ReactionType);
}

/**
 * GET /api/community/posts/:id/reactions
 * Retorna contagem de reações e quais o usuário logado reagiu
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;
    const db = getDb();

    // Verificar se post existe
    const postExists = await db`
      SELECT 1 FROM community_posts WHERE id = ${postId} LIMIT 1
    `;

    if (postExists.length === 0) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Buscar contagens
    const counts = await db`
      SELECT
        COUNT(*) FILTER (WHERE type = 'energia') AS energia,
        COUNT(*) FILTER (WHERE type = 'apoio') AS apoio,
        COUNT(*) FILTER (WHERE type = 'lua') AS lua,
        COUNT(*) FILTER (WHERE type = 'estrela') AS estrela,
        COUNT(*) AS total
      FROM community_reactions
      WHERE post_id = ${postId}
    `;

    // Verificar reações do usuário logado
    let userReactions: string[] = [];
    try {
      const token = await getTokenPayload();
      if (token?.userId) {
        const userReactionRows = await db`
          SELECT type FROM community_reactions
          WHERE post_id = ${postId} AND user_id = ${token.userId}
        `;
        userReactions = userReactionRows.map((r) => r.type);
      }
    } catch {
      // Usuário não logado - ok
    }

    const reactionCounts = counts[0] ?? { energia: 0, apoio: 0, lua: 0, estrela: 0, total: 0 };

    return NextResponse.json({
      postId,
      counts: {
        energia: Number(reactionCounts.energia),
        apoio: Number(reactionCounts.apoio),
        lua: Number(reactionCounts.lua),
        estrela: Number(reactionCounts.estrela),
        total: Number(reactionCounts.total),
      },
      userReactions,
    });

  } catch (error) {
    console.error('Erro ao buscar reações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/posts/:id/reactions
 * Toggle de reação (adiciona se não existe, remove se existe)
 * Body: { type: 'energia' | 'apoio' | 'lua' | 'estrela' }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const userId = token?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    const { id: postId } = await context.params;
    const body = await request.json();
    const { type } = body;

    // Validar tipo
    if (!type || !isValidReactionType(type)) {
      return NextResponse.json(
        { error: `Tipo de reação inválido. Use: ${VALID_REACTION_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar se post existe
    const postExists = await db`
      SELECT 1 FROM community_posts WHERE id = ${postId} LIMIT 1
    `;

    if (postExists.length === 0) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se reação já existe
    const existingReaction = await db`
      SELECT id FROM community_reactions
      WHERE post_id = ${postId} 
        AND user_id = ${userId}
        AND type = ${type}
      LIMIT 1
    `;

    let action: 'added' | 'removed';

    if (existingReaction.length > 0) {
      // Remover reação existente
      await db`
        DELETE FROM community_reactions
        WHERE post_id = ${postId} 
          AND user_id = ${userId}
          AND type = ${type}
      `;
      action = 'removed';
    } else {
      // Adicionar nova reação
      await db`
        INSERT INTO community_reactions (post_id, user_id, type)
        VALUES (${postId}, ${userId}, ${type})
      `;
      action = 'added';
    }

    // Buscar contagens atualizadas
    const counts = await db`
      SELECT
        COUNT(*) FILTER (WHERE type = 'energia') AS energia,
        COUNT(*) FILTER (WHERE type = 'apoio') AS apoio,
        COUNT(*) FILTER (WHERE type = 'lua') AS lua,
        COUNT(*) FILTER (WHERE type = 'estrela') AS estrela,
        COUNT(*) AS total
      FROM community_reactions
      WHERE post_id = ${postId}
    `;

    // Buscar reações atuais do usuário
    const userReactionRows = await db`
      SELECT type FROM community_reactions
      WHERE post_id = ${postId} AND user_id = ${userId}
    `;
    const userReactions = userReactionRows.map((r) => r.type);

    const reactionCounts = counts[0] ?? { energia: 0, apoio: 0, lua: 0, estrela: 0, total: 0 };

    return NextResponse.json({
      success: true,
      action,
      type,
      counts: {
        energia: Number(reactionCounts.energia),
        apoio: Number(reactionCounts.apoio),
        lua: Number(reactionCounts.lua),
        estrela: Number(reactionCounts.estrela),
        total: Number(reactionCounts.total),
      },
      userReactions,
    });

  } catch (error) {
    console.error('Erro ao reagir:', error);
    return NextResponse.json(
      { error: 'Erro ao processar reação' },
      { status: 500 }
    );
  }
}
```

## Respostas da API

### GET - Contagens
```json
{
  "postId": "123",
  "counts": {
    "energia": 15,
    "apoio": 8,
    "lua": 3,
    "estrela": 1,
    "total": 27
  },
  "userReactions": ["energia", "lua"]
}
```

### POST - Toggle Reação (adicionou)
```json
{
  "success": true,
  "action": "added",
  "type": "energia",
  "counts": {
    "energia": 16,
    "apoio": 8,
    "lua": 3,
    "estrela": 1,
    "total": 28
  },
  "userReactions": ["energia", "lua"]
}
```

### POST - Toggle Reação (removeu)
```json
{
  "success": true,
  "action": "removed",
  "type": "energia",
  "counts": {
    "energia": 15,
    "apoio": 8,
    "lua": 3,
    "estrela": 1,
    "total": 27
  },
  "userReactions": ["lua"]
}
```

## Validação
- [ ] GET retorna contagens corretas
- [ ] GET retorna reações do usuário logado
- [ ] GET funciona para usuário não logado
- [ ] POST toggle adiciona reação
- [ ] POST toggle remove reação existente
- [ ] POST valida tipo de reação
- [ ] POST requer autenticação
- [ ] POST retorna contagens atualizadas

## Próximo Passo
→ Task 3.3: Modificar GET Posts para Incluir Reações
