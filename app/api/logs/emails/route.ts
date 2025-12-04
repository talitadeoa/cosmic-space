import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { getSheetData } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!spreadsheetId || !apiKey) {
      return NextResponse.json({ error: 'Sheets não configurado' }, { status: 500 });
    }

    const data = await getSheetData(spreadsheetId, apiKey);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar logs de emails:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
