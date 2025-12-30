import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { saveIsland } from '@/lib/forms';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { islandKey, data } = body;

    if (!islandKey || !data) {
      return NextResponse.json(
        { error: 'Chave da ilha e dados são obrigatórios' },
        { status: 400 }
      );
    }

    // Extrair user_id do token
    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    // 1. Salvar no Neon
    try {
      await saveIsland(userId, islandKey, data);
    } catch (neonError) {
      console.error('Erro ao salvar no Neon:', neonError);
      // Continua para salvar no Sheets mesmo se Neon falhar
    }

    // 2. Salvar no Google Sheets (manter compatibilidade)
    const sheetData = {
      timestamp: new Date().toISOString(),
      ilhaChave: islandKey,
      titulo: data.titulo || '',
      tag: data.tag || '',
      descricao: data.descricao || '',
      energia: data.energia ?? '',
      prioridade: data.prioridade ?? '',
      tipo: 'ilha',
    };

    const success = await appendToSheet(sheetData);

    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar dados da ilha' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Dados da ilha salvos com sucesso',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar dados da ilha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
