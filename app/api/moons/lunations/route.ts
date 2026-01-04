import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { saveLunations, deleteLunations } from '@/lib/forms';

export const dynamic = 'force-dynamic';

const CSV_FILE_NAME = 'Calendario - Lunações.csv';
const MAX_DAYS = 550;

const parseCsv = (content: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === ',' || char === '\n' || char === '\r')) {
      row.push(field);
      field = '';

      if (char === ',') {
        continue;
      }

      if (char === '\r' && next === '\n') {
        i += 1;
      }

      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows;
};

const convertDateFormat = (dateStr: string): string | null => {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const parseIsoDate = (value: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const loadCsvLunations = (start: Date, end: Date) => {
  const csvPath = path.join(process.cwd(), CSV_FILE_NAME);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`Arquivo CSV não encontrado: ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(content);

  if (rows.length < 2) {
    throw new Error('CSV vazio ou sem dados válidos');
  }

  const dataRows = rows.slice(1);
  const startIso = formatIsoDate(start);
  const endIso = formatIsoDate(end);
  const days: Array<{
    date: string;
    moonPhase: string;
    sign: string;
    source: string;
  }> = [];

  for (const row of dataRows) {
    const rawDate = row[0]?.trim();
    const phase = row[1]?.trim();
    const sign = row[3]?.trim();

    if (!rawDate || !phase || !sign) continue;
    const isoDate = convertDateFormat(rawDate);
    if (!isoDate) continue;

    if (isoDate < startIso || isoDate > endIso) continue;

    days.push({
      date: isoDate,
      moonPhase: phase,
      sign,
      source: 'csv',
    });

    if (days.length >= MAX_DAYS) break;
  }

  return days;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const defaultYear = now.getUTCFullYear();

    const startParam = searchParams.get('start') || `${defaultYear}-01-01`;
    const endParam = searchParams.get('end') || `${defaultYear}-12-31`;
    const startDate = parseIsoDate(startParam);
    const endDate = parseIsoDate(endParam);

    if (!startDate || !endDate || startDate > endDate) {
      return NextResponse.json(
        { error: 'Parâmetros start/end inválidos. Use ISO YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const days = loadCsvLunations(startDate, endDate);

    return NextResponse.json({
      days,
      generatedAt: new Date().toISOString(),
      source: 'csv',
      range: { start: startParam, end: endParam },
    });
  } catch (error) {
    console.error('Erro ao buscar lunações:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { days, action } = body;

    if (!Array.isArray(days) || days.length === 0) {
      return NextResponse.json({ error: 'Array de dias obrigatório e não vazio' }, { status: 400 });
    }

    if (action === 'replace') {
      // Deletar e recriar para um range específico
      if (days.length === 0) {
        return NextResponse.json({ error: "Dias obrigatórios para 'replace'" }, { status: 400 });
      }

      const dates = days.map((d: any) => d.date || d.lunation_date);
      const minDate = dates.reduce((a: string, b: string) => (a < b ? a : b));
      const maxDate = dates.reduce((a: string, b: string) => (a > b ? a : b));

      // Deletar antigos
      await deleteLunations(minDate, maxDate);
    }

    // Salvar lunações
    const lunationsData = days.map((d: any) => {
      // Normalizar nomes de campos que podem vir de diferentes fontes
      const lunation_date = d.date || d.lunation_date;
      const moon_phase = d.moonPhase || d.moon_phase;
      const zodiac_sign = d.sign || d.zodiac_sign;

      // Validar dados obrigatórios
      if (!lunation_date || !moon_phase || !zodiac_sign) {
        console.warn('Lunação com dados incompletos:', d);
      }

      return {
        lunation_date,
        moon_phase,
        zodiac_sign,
        illumination: d.illumination ?? null,
        age_days: d.ageDays ?? d.age_days ?? null,
        description: d.description ?? null,
        source: d.source || 'synced',
      };
    });

    const saved = await saveLunations(lunationsData);

    return NextResponse.json(
      {
        success: true,
        message: `${saved.length} lunações salvas com sucesso`,
        count: saved.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar lunações:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar lunações', details: String(error) },
      { status: 500 }
    );
  }
}
