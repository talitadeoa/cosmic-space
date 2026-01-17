import { NextRequest, NextResponse } from 'next/server';

/**
 * 🚀 DEPRECADO: Rota adapter para microserviço Python removido
 * 
 * Favor usar a USNO API diretamente:
 * - lib/usno-client.ts (cliente da USNO API)
 * - hooks/useLunarPhaseUSNO.ts (hook React)
 */

export const dynamic = 'force-dynamic';

/**
 * POST /api/compute/*
 * DEPRECADO - Use USNO API hooks instead
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deprecated endpoint',
      message: 'Use lib/usno-client.ts and hooks/useLunarPhaseUSNO.ts instead'
    },
    { status: 410 } // Gone
  );
}
