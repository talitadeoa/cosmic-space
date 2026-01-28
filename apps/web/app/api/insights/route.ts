import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { getAllInsights } from '@/lib/forms';

export const dynamic = 'force-dynamic';

type InsightCategory = 'mensal' | 'trimestral' | 'anual';

type InsightCalendarItem = {
  category: InsightCategory;
  insight: string;
  moonPhase: string | null;
  period: string;
  calendarDate: string;
  createdAt: string;
};

const allowedCategories: InsightCategory[] = ['mensal', 'trimestral', 'anual'];

const parseIsoDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const parseCategories = (value: string | null): InsightCategory[] | null => {
  if (!value) return null;
  const items = value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const filtered = items.filter((item): item is InsightCategory =>
    (allowedCategories as string[]).includes(item)
  );
  return filtered.length ? filtered : [];
};

const toCalendarDate = (row: { tipo: InsightCategory; periodo: string; created_at: string }) => {
  // Usa o ano do created_at para mensal/trimestral enquanto não há coluna de ano.
  const createdAt = new Date(row.created_at);
  const createdYear = createdAt.getUTCFullYear();

  if (row.tipo === 'mensal') {
    const month = Number(row.periodo);
    if (!Number.isInteger(month) || month < 1 || month > 12) return null;
    return new Date(Date.UTC(createdYear, month - 1, 1));
  }

  if (row.tipo === 'trimestral') {
    const quarter = Number(row.periodo);
    if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) return null;
    const startMonth = (quarter - 1) * 3;
    return new Date(Date.UTC(createdYear, startMonth, 1));
  }

  if (row.tipo === 'anual') {
    const year = Number(row.periodo);
    if (!Number.isInteger(year)) return null;
    return new Date(Date.UTC(year, 0, 1));
  }

  return null;
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const categoriesParam = searchParams.get('categories');
    const moonPhase = searchParams.get('moonPhase');

    const startDate = parseIsoDate(startParam);
    const endDate = parseIsoDate(endParam);

    if ((startParam && !startDate) || (endParam && !endDate)) {
      return NextResponse.json(
        { error: 'Parâmetros start/end inválidos. Use ISO YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { error: 'Intervalo inválido: start deve ser menor que end.' },
        { status: 400 }
      );
    }

    const categories = parseCategories(categoriesParam);
    if (categoriesParam && categories && categories.length === 0) {
      return NextResponse.json(
        { error: 'Categorias inválidas. Use mensal,trimestral,anual.' },
        { status: 400 }
      );
    }

    const tokenPayload = await getTokenPayload(token);
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    const insights = await getAllInsights(userId);

    const mapped = insights
      .map((row) => {
        const calendarDate = toCalendarDate(row);
        if (!calendarDate) return null;
        return {
          category: row.tipo,
          insight: row.insight,
          moonPhase: row.moon_phase ?? null,
          period: row.periodo,
          calendarDate: formatIsoDate(calendarDate),
          createdAt: row.created_at,
        };
      })
      .filter((row): row is InsightCalendarItem => row !== null);

    const filtered = mapped.filter((row) => {
      if (categories && categories.length > 0 && !categories.includes(row.category)) {
        return false;
      }
      if (moonPhase && row.moonPhase !== moonPhase) {
        return false;
      }
      if (startDate) {
        const rowDate = parseIsoDate(row.calendarDate);
        if (!rowDate || rowDate < startDate) return false;
      }
      if (endDate) {
        const rowDate = parseIsoDate(row.calendarDate);
        if (!rowDate || rowDate > endDate) return false;
      }
      return true;
    });

    return NextResponse.json({
      items: filtered,
      range: {
        start: startDate ? formatIsoDate(startDate) : null,
        end: endDate ? formatIsoDate(endDate) : null,
      },
      categories: categories ?? allowedCategories,
    });
  } catch (error) {
    console.error('Erro ao buscar insights:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
