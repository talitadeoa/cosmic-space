import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * GET /api/lunations
 * Retorna todas as lunações do banco de dados
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();

    const lunations = await db
      .selectFrom("lunations")
      .selectAll()
      .orderBy("lunation_date", "asc")
      .execute();

    return NextResponse.json({
      success: true,
      count: lunations.length,
      data: lunations,
    });
  } catch (error) {
    console.error("Erro ao buscar lunações:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar lunações",
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

    const lunation = await db
      .selectFrom("lunations")
      .selectAll()
      .where("lunation_date", "=", date)
      .executeTakeFirst();

    return lunation || null;
  } catch (error) {
    console.error("Erro ao buscar lunação:", error);
    return null;
  }
}
