import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const USNO_API_URL = 'https://api.usno.navy.mil';
const TIMEOUT_MS = 10000;

/**
 * GET /api/moons/phases?year=2024&month=01
 * Proxy para a API USNO de fases lunares
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Validar parâmetros
    if (!year) {
      return NextResponse.json(
        { error: 'Missing required parameter: year' },
        { status: 400 }
      );
    }

    // Construir URL da USNO API
    const params = new URLSearchParams();
    params.append('year', year);
    if (month) {
      params.append('month', month);
    }

    const usnoUrl = `${USNO_API_URL}/moon/phases?${params.toString()}`;

    // Fazer requisição no servidor (sem CORS issues)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(usnoUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { error: `USNO API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Cache por 24 horas
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error calling USNO API:', error);

    // Se for timeout ou erro de rede
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'USNO API request timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch moon phases from USNO' },
      { status: 500 }
    );
  }
}
