import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar lógica de GET para listar projetos
    return NextResponse.json(
      { message: 'Lista de projetos' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar lógica de POST para criar novo projeto
    return NextResponse.json(
      { message: 'Projeto criado' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
}
