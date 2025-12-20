import { createSign } from "crypto";
import type { LunationData } from "./forms";

const base64url = (input: string | Buffer) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

const tokenCache: TokenCache = {
  accessToken: "",
  expiresAt: 0,
};

async function getServiceAccountToken() {
  const saEmail = process.env.GOOGLE_SA_EMAIL;
  const saKeyRaw = process.env.GOOGLE_SA_KEY;

  if (!saEmail || !saKeyRaw) {
    console.error("Google Service Account credentials missing");
    return null;
  }

  const saKey = saKeyRaw.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);

  if (tokenCache.accessToken && now < tokenCache.expiresAt - 60) {
    return tokenCache.accessToken;
  }

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: saEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsignedToken = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload)
  )}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const signature = signer.sign(saKey);
  const jwt = `${unsignedToken}.${base64url(signature)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errorData = await tokenRes.json().catch(() => null);
    console.error("Erro ao obter token do Google", {
      status: tokenRes.status,
      error: errorData,
    });
    return null;
  }

  const json = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) {
    console.error("Resposta sem access_token", json);
    return null;
  }

  tokenCache.accessToken = json.access_token;
  tokenCache.expiresAt = now + (json.expires_in ?? 3600);
  return tokenCache.accessToken;
}

/**
 * Lê lunações do Google Sheets
 * Espera formato: Data, FasedaLua, LuaEmoji, Signo, SignoEmoji
 */
export async function getLunationsFromSheets(
  sheetRange: string = "Lunações"
): Promise<LunationData[]> {
  try {
    const spreadsheetId = process.env.GOOGLE_LUNATIONS_SHEET_ID;

    if (!spreadsheetId) {
      console.error("GOOGLE_LUNATIONS_SHEET_ID não configurada");
      return [];
    }

    const accessToken = await getServiceAccountToken();
    if (!accessToken) {
      console.error("Não foi possível obter token de acesso ao Google");
      return [];
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetRange}'`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Erro ao buscar lunações do Sheets:", {
        status: response.status,
        error: errorData,
      });
      return [];
    }

    const data = (await response.json()) as {
      values?: string[][];
    };

    if (!data.values || data.values.length < 2) {
      console.warn("Nenhuma lunação encontrada no Sheets");
      return [];
    }

    // Pular header (primeira linha)
    const rows = data.values.slice(1);

    const lunations: LunationData[] = rows
      .map((row) => {
        // row[0] = Data, row[1] = Fase, row[2] = Emoji Lua, row[3] = Signo, row[4] = Emoji Signo
        if (!row[0] || !row[1] || !row[3]) {
          return null; // Pular linhas incompletas
        }

        return {
          lunation_date: convertDateFormat(row[0]),
          moon_phase: row[1].trim(),
          moon_emoji: row[2]?.trim() || undefined,
          zodiac_sign: row[3].trim(),
          zodiac_emoji: row[4]?.trim() || undefined,
          source: "google-sheets",
        } as LunationData;
      })
      .filter((l): l is LunationData => l !== null);

    console.log(`✅ ${lunations.length} lunações lidas do Google Sheets`);
    return lunations;
  } catch (error) {
    console.error("Erro ao ler lunações do Sheets:", error);
    return [];
  }
}

/**
 * Converte data de DD/MM/YYYY para YYYY-MM-DD
 */
function convertDateFormat(dateStr: string): string {
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) {
    throw new Error(`Formato de data inválido: ${dateStr}`);
  }

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
