import { NextResponse } from 'next/server';

/**
 * API Health Check para a rota de Planeta
 * GET /api/cosmos/planeta
 * 
 * Retorna o status da rota de planeta e informações gerais
 */
export async function GET() {
  try {
    return NextResponse.json(
      {
        status: 'ok',
        route: '/cosmos/planeta',
        message: 'Planeta route is working correctly',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao acessar rota de Planeta:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro ao acessar rota de Planeta',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cosmos/planeta
 * 
 * Endpoint para operações futuras com a rota planeta
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json(
      {
        status: 'ok',
        message: 'Planeta POST endpoint',
        received: body,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar POST de Planeta:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro ao processar POST de Planeta',
      },
      { status: 500 }
    );
  }
}
