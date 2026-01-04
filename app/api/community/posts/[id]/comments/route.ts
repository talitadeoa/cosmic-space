import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenPayload, validateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário inválido' }, { status: 401 });
    }

    const { id } = await context.params;
    const data = await request.json();
    const body = typeof data?.body === 'string' ? data.body.trim() : '';

    if (!body) {
      return NextResponse.json({ error: 'Comentário é obrigatório' }, { status: 400 });
    }

    const db = getDb();
    const commentRows = (await db`
      INSERT INTO community_comments (post_id, author_id, body)
      VALUES (${id}, ${userId}, ${body})
      RETURNING id, created_at
    `) as Array<{ id: string; created_at: string }>;

    const commentId = commentRows?.[0]?.id;
    if (!commentId) {
      return NextResponse.json({ error: 'Não foi possível criar o comentário' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, commentId, createdAt: commentRows?.[0]?.created_at },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
