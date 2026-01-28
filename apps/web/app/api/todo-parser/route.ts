import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_ITEMS = 200;

const cleanTodoLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return '';

  return trimmed.replace(/^(\d+[\).:-]?|[-*])\s+/, '').trim();
};

const splitInlineList = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return [];

  if (/[;|\u2022]/.test(trimmed)) {
    return trimmed.split(/[;|\u2022]/);
  }

  if (/\s[-\u2013\u2014]\s+/.test(trimmed)) {
    return trimmed.split(/\s[-\u2013\u2014]\s+/);
  }

  return [trimmed];
};

const parseTodoText = (text: string) => {
  const lines = text.split(/\r?\n/);
  const items: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const parts = splitInlineList(line);
    if (parts.length === 0) continue;

    for (const part of parts) {
      const cleaned = cleanTodoLine(part);
      if (!cleaned) continue;

      const key = cleaned.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(cleaned);

      if (items.length >= MAX_ITEMS) break;
    }

    if (items.length >= MAX_ITEMS) break;
  }

  return items;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body?.text;

    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto invalido' }, { status: 400 });
    }

    const items = parseTodoText(text);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar texto de tarefas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
