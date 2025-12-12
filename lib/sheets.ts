import { createSign } from "crypto";

// Integração com Google Sheets API usando Service Account (Bearer token)

interface SheetData {
  timestamp: string;
  name?: string;
  email?: string;
  message?: string;
  [key: string]: any;
}

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

const tokenCache: TokenCache = {
  accessToken: "",
  expiresAt: 0,
};

const base64url = (input: string | Buffer) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

async function getServiceAccountToken() {
  const saEmail = process.env.GOOGLE_SA_EMAIL;
  const saKeyRaw = process.env.GOOGLE_SA_KEY;

  if (!saEmail || !saKeyRaw) {
    console.error("Google Service Account credentials missing");
    return null;
  }

  // \n no .env vem escapado
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

  const json = (await tokenRes.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    console.error("Resposta sem access_token", json);
    return null;
  }

  tokenCache.accessToken = json.access_token;
  tokenCache.expiresAt = now + (json.expires_in ?? 3600);
  return tokenCache.accessToken;
}

export async function appendToSheet(data: SheetData): Promise<boolean> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.error("GOOGLE_SHEET_ID ausente");
      return false;
    }

    const accessToken = await getServiceAccountToken();
    if (!accessToken) {
      return false;
    }

    // Suporta dois formatos de entrada:
    // - formulário genérico (name, email, message)
    // - payloads arbitrários — nesses casos serializamos em JSON
    const nowIso = new Date().toISOString();
    const timestamp = data.timestamp ?? nowIso;
    const valuesRow =
      data.name && data.email && data.message
        ? [timestamp, data.name ?? "", data.email ?? "", data.message ?? "", nowIso, "Mensagem"]
        : data.email
        ? [timestamp, "", data.email, data.source ?? "landing", nowIso, "Lead"]
        : [timestamp, JSON.stringify(data), "", data.source ?? "", nowIso, "Payload"];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Dados!A:F/append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          values: [valuesRow],
          majorDimension: "ROWS",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Erro ao enviar dados para Sheets:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao processar Sheets:", error);
    return false;
  }
}

export async function getSheetData(spreadsheetId: string, apiKey?: string) {
  try {
    const accessToken = await getServiceAccountToken();
    const url = accessToken
      ? `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Dados`
      : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Dados?key=${apiKey ?? ""}`;

    const response = await fetch(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar dados do Sheets");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return null;
  }
}
