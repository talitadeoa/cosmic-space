import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { saveLunarPhase } from '@/lib/forms';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const data = await request.json();
    const {
      data: dataFase,
      faseLua,
      signo,
      energia,
      checks,
      observacoes,
      energiaDaFase,
      intencoesLua,
      intencoesSemana,
      intencoesAno,
    } = data;

    // Validações básicas
    if (!dataFase || !faseLua || !signo) {
      return NextResponse.json(
        { error: 'Data, fase da lua e signo são obrigatórios' },
        { status: 400 }
      );
    }

    // Contar checks completados vs pendentes
    const checksArray = checks.split('\n').filter((line: string) => line.trim());
    const checkCount = checksArray.filter((line: string) => line.includes('[x]')).length;
    const openCount = checksArray.filter((line: string) => line.includes('[]')).length;
    const totalCount = checkCount + openCount;

    // Calcular porcentagem de progresso
    const progressPercentage = totalCount > 0 ? Math.round((checkCount / totalCount) * 100) : 0;
    const progressBar = Math.ceil(progressPercentage / 12.5); // 8 barras (100 / 12.5)
    const progressMoons =
      Array(progressBar).fill('🌕').join('') +
      Array(8 - progressBar)
        .fill('🌑')
        .join('');

    // Extrair user_id do token
    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    // 1. Salvar no Neon
    try {
      await saveLunarPhase(userId, {
        data: dataFase,
        faseLua,
        signo,
        energia,
        checks,
        observacoes,
        energiaDaFase,
        intencoesLua,
        intencoesSemana,
        intencoesAno,
      });
    } catch (neonError) {
      console.error('Erro ao salvar no Neon:', neonError);
      // Continua para salvar no Sheets mesmo se Neon falhar
    }

    // 2. Salvar no Google Sheets (manter compatibilidade)
    const sheetData = {
      data: dataFase,
      faseLua,
      signo,
      energia,
      checks,
      checkCount,
      openCount,
      totalCount,
      progressBar: progressMoons,
      energiaDaFase,
      intencoesLua,
      intencoesSemana,
      intencoesAno,
      observacoes,
      timestamp: new Date().toISOString(),
    };

    // Enviar para Google Sheets
    const success = await appendToSheet(sheetData);

    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Fase lunar registrada com sucesso',
        data: sheetData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar formulário de fase lunar:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
