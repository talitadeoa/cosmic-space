import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/lunations
 * Retorna todas as lunações do banco de dados
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();

    const lunations = await db`SELECT * FROM lunations ORDER BY lunation_date ASC`;

    const results = Array.isArray(lunations) ? lunations : [];

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Erro ao buscar lunações:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar lunações',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lunations?date=YYYY-MM-DD
 * Retorna lunação para uma data específica
 */
export async function getByDate(date: string) {
  try {
    const db = getDb();

    const result = await db`SELECT * FROM lunations WHERE lunation_date = ${date}`;

    const results = Array.isArray(result) ? result : [];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Erro ao buscar lunação:', error);
    return null;
  }
}
