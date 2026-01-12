import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface EmotionPayload {
  emotion_id?: string;
  id?: string;
  emoji: string;
  label: string;
  color?: string;
  description?: string;
  context?: string;
  notes?: string;
}

interface SyncEmotionRequest {
  emotion: string | EmotionPayload;
  timestamp?: string;
  context?: string;
  notes?: string;
}

interface CurrentEmotionRow {
  emotion_id: string;
  emoji: string;
  label: string;
  color: string | null;
  description: string | null;
  updated_at: string;
}

interface EmotionHistoryRow {
  id: number;
  emotion_id: string;
  emoji: string;
  label: string;
  color: string | null;
  description: string | null;
  context: string | null;
  notes: string | null;
  recorded_at: string;
  date: string;
}

/**
 * GET /api/emotion-sync
 * Retorna a emoção atual e histórico recente do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const db = getDb();

    // Buscar emoção atual
    const currentRows = (await db`
      SELECT emotion_id, emoji, label, color, description, updated_at
      FROM user_current_emotion
      WHERE user_id = ${userId}
      LIMIT 1
    `) as CurrentEmotionRow[];

    // Buscar histórico recente (últimos 30 dias)
    const historyRows = (await db`
      SELECT 
        id, 
        emotion_id, 
        emoji, 
        label, 
        color, 
        description,
        context,
        notes,
        recorded_at,
        date
      FROM user_emotions
      WHERE user_id = ${userId}
        AND recorded_at >= NOW() - INTERVAL '30 days'
      ORDER BY recorded_at DESC
      LIMIT 100
    `) as EmotionHistoryRow[];

    const current = currentRows.length > 0 ? {
      id: currentRows[0].emotion_id,
      emoji: currentRows[0].emoji,
      label: currentRows[0].label,
      color: currentRows[0].color,
      description: currentRows[0].description,
      updatedAt: currentRows[0].updated_at,
    } : null;

    const history = historyRows.map((row: EmotionHistoryRow) => ({
      emotion: {
        id: row.emotion_id,
        emoji: row.emoji,
        label: row.label,
        color: row.color,
        description: row.description,
      },
      context: row.context,
      notes: row.notes,
      timestamp: row.recorded_at,
      date: row.date,
    }));

    return NextResponse.json({
      current,
      history,
      count: history.length,
    });
  } catch (error) {
    console.error('Erro ao buscar emoções:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * POST /api/emotion-sync
 * Salva uma nova emoção e atualiza a emoção atual
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const body = await request.json() as SyncEmotionRequest;
    
    // Aceita tanto string JSON quanto objeto
    let emotionData: EmotionPayload;
    if (typeof body.emotion === 'string') {
      try {
        emotionData = JSON.parse(body.emotion);
      } catch {
        return NextResponse.json({ error: 'Formato de emoção inválido' }, { status: 400 });
      }
    } else {
      emotionData = body.emotion;
    }

    // Validar dados obrigatórios
    if (!emotionData.emoji || !emotionData.label) {
      // Tentar mapear de id se disponível
      const emotionId = emotionData.emotion_id || emotionData.id;
      if (emotionId) {
        emotionData = {
          ...emotionData,
          emotion_id: emotionId,
        };
      } else {
        return NextResponse.json({ error: 'Emoção inválida: emoji e label são obrigatórios' }, { status: 400 });
      }
    }

    const recordedAt = body.timestamp ? new Date(body.timestamp) : new Date();
    const date = recordedAt.toISOString().split('T')[0];

    const db = getDb();
    const emotionId = emotionData.emotion_id || emotionData.id || emotionData.label.toLowerCase();

    // Inserir no histórico
    await db`
      INSERT INTO user_emotions (
        user_id,
        emotion_id,
        emoji,
        label,
        color,
        description,
        context,
        notes,
        recorded_at,
        date
      ) VALUES (
        ${userId},
        ${emotionId},
        ${emotionData.emoji},
        ${emotionData.label},
        ${emotionData.color || null},
        ${emotionData.description || null},
        ${body.context || emotionData.context || null},
        ${body.notes || emotionData.notes || null},
        ${recordedAt},
        ${date}
      )
    `;

    // Atualizar emoção atual (upsert)
    await db`
      INSERT INTO user_current_emotion (
        user_id,
        emotion_id,
        emoji,
        label,
        color,
        description,
        updated_at
      ) VALUES (
        ${userId},
        ${emotionId},
        ${emotionData.emoji},
        ${emotionData.label},
        ${emotionData.color || null},
        ${emotionData.description || null},
        ${recordedAt}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        emotion_id = EXCLUDED.emotion_id,
        emoji = EXCLUDED.emoji,
        label = EXCLUDED.label,
        color = EXCLUDED.color,
        description = EXCLUDED.description,
        updated_at = EXCLUDED.updated_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Emoção sincronizada',
      emotion: {
        id: emotionId,
        emoji: emotionData.emoji,
        label: emotionData.label,
      },
      recordedAt: recordedAt.toISOString(),
    });
  } catch (error) {
    console.error('Erro ao sincronizar emoção:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * DELETE /api/emotion-sync
 * Remove a emoção atual do usuário (limpa o estado)
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const db = getDb();

    await db`
      DELETE FROM user_current_emotion
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Emoção atual removida',
    });
  } catch (error) {
    console.error('Erro ao remover emoção:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
