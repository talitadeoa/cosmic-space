import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { getTimelineEntries } from '@/lib/timeline';
import { allowedTypes, parseTimelineQuery, periodDays } from '@/lib/timelineQuery';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const { period, types, moonPhase, page, pageSize, typesParam } =
      parseTimelineQuery(searchParams);

    if (typesParam && types.length === 0) {
      return NextResponse.json(
        { error: 'Tipos invalidos. Use mensal,trimestral,anual,energia.' },
        { status: 400 }
      );
    }

    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - periodDays[period]);

    const { items, total } = await getTimelineEntries({
      userId,
      start,
      end,
      types: types.length ? types : allowedTypes,
      moonPhase,
      page,
      pageSize,
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      items,
      page,
      pageSize,
      totalItems: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar timeline:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
