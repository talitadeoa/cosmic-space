import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/galaxysuns/sync
 * Sincroniza dados lunares para GalaxySunsScreen
 * Busca fases lunares de múltiplos anos (backend entende que referencia 1 ano atrás)
 * 
 * Query params:
 *   - years: números de anos separados por vírgula (ex: 2024,2025,2026)
 *   - default: últimos 2 anos, presente, próximos 2 anos
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearsParam = searchParams.get("years");

  const currentYear = new Date().getFullYear();
  let years: number[] = [];

  if (yearsParam) {
    years = yearsParam
      .split(",")
      .map((y) => parseInt(y.trim(), 10))
      .filter((y) => !Number.isNaN(y));
  } else {
    years = [
      currentYear - 1,
      currentYear,
      currentYear + 1,
      currentYear + 2,
    ];
  }

  try {
    const results: Record<number, any> = {};

    for (const year of years) {
      try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // Buscar dados do calendário lunar interno
        const moonResponse = await fetch(
          `${new URL(request.url).origin}/api/moons?start=${startDate}&end=${endDate}&tz=UTC`
        );

        if (!moonResponse.ok) {
          throw new Error(`Erro ao carregar dados de ${year}`);
        }

        const { days } = await moonResponse.json();

        // Processar estatísticas
        const phaseCount: Record<string, number> = {
          luaNova: 0,
          luaCrescente: 0,
          luaCheia: 0,
          luaMinguante: 0,
        };

        const signCount: Record<string, number> = {};

        days.forEach((day: any) => {
          if (day.normalizedPhase) {
            phaseCount[day.normalizedPhase] =
              (phaseCount[day.normalizedPhase] || 0) + 1;
          }
          if (day.sign) {
            signCount[day.sign] = (signCount[day.sign] || 0) + 1;
          }
        });

        // Encontrar fase dominante
        const [dominantPhase] = Object.entries(phaseCount).reduce(
          (acc, [phase, count]) =>
            count > acc[1] ? [phase, count] : acc,
          ["luaNova" as string, 0]
        );

        // Encontrar signo dominante
        const [dominantSign] = Object.entries(signCount).reduce(
          (acc, [sign, count]) =>
            count > acc[1] ? [sign, count] : acc,
          ["" as string, 0]
        );

        results[year] = {
          year,
          totalLunations: days.length,
          dominantPhase: dominantPhase || null,
          dominantSign: dominantSign || null,
          moonPhases: phaseCount,
          signs: signCount,
          syncedAt: new Date().toISOString(),
        };
      } catch (yearError) {
        console.error(`❌ Erro ao processar ano ${year}:`, yearError);
        results[year] = {
          year,
          error: yearError instanceof Error ? yearError.message : "Erro desconhecido",
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
