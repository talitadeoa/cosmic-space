import { NextRequest, NextResponse } from "next/server";
import { getTokenPayload, validateToken } from "@/lib/auth";
import { listPhaseInputs, savePhaseInput } from "@/lib/phaseInputs";

export const dynamic = "force-dynamic";

const isValidMoonPhase = (value: string | null) =>
  value === "luaNova" || value === "luaCrescente" || value === "luaCheia" || value === "luaMinguante";

const isValidInputType = (value: string | null) => value === "energia" || value === "tarefa";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Usuario nao identificado" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const moonPhaseParam = params.get("moonPhase");
    const inputTypeParam = params.get("inputType");
    const limitParam = params.get("limit");

    const moonPhase = isValidMoonPhase(moonPhaseParam) ? moonPhaseParam : null;
    const inputType = isValidInputType(inputTypeParam) ? inputTypeParam : null;
    const limit =
      limitParam && Number.isInteger(Number(limitParam))
        ? Math.min(Math.max(Number(limitParam), 1), 200)
        : undefined;

    const items = await listPhaseInputs(userId, {
      moonPhase,
      inputType,
      limit,
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar phase inputs:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Usuario nao identificado" }, { status: 401 });
    }

    const body = await request.json();
    const { moonPhase, inputType, content, sourceId, vibe, metadata } = body ?? {};

    if (!isValidMoonPhase(moonPhase) || !isValidInputType(inputType) || !content) {
      return NextResponse.json(
        { error: "Dados invalidos para registrar input da fase" },
        { status: 400 },
      );
    }

    const item = await savePhaseInput(userId, {
      moonPhase,
      inputType,
      sourceId: typeof sourceId === "string" ? sourceId : null,
      content: String(content),
      vibe: typeof vibe === "string" && vibe.trim() ? vibe : null,
      metadata: typeof metadata === "object" && metadata ? metadata : null,
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar phase input:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
