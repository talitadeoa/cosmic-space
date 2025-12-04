// app/api/form/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token || !validateToken(token)) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, email, message } = data;

    // Validações básicas
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nome, email e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Enviar para Google Sheets
    const sheetData = {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    };

    const success = await appendToSheet(sheetData);

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao salvar dados' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Dados salvos com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar formulário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
