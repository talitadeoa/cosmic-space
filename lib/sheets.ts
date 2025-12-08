// lib/sheets.ts
// Integração com Google Sheets API

interface SheetData {
  timestamp: string;
  name?: string;
  email?: string;
  message?: string;
  [key: string]: any;
}

export async function appendToSheet(data: SheetData): Promise<boolean> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!spreadsheetId || !apiKey) {
      console.error('Google Sheets credentials missing:', {
        spreadsheetId: !!spreadsheetId,
        apiKey: !!apiKey,
      });
      return false;
    }

    // Usando Google Sheets API v4
    // Suporta dois formatos de entrada:
    // - formulário genérico (name, email, message)
    // - payloads arbitrários (ex: registro de fase lunar) — nesses casos serializamos em JSON
    const nowIso = new Date().toISOString();
    const timestamp = data.timestamp ?? nowIso;
    const valuesRow =
      data.name && data.email && data.message
        ? [timestamp, data.name ?? '', data.email ?? '', data.message ?? '', nowIso, 'Mensagem']
        : data.email
        ? [timestamp, '', data.email, data.source ?? 'landing', nowIso, 'Lead']
        : [timestamp, JSON.stringify(data), '', data.source ?? '', nowIso, 'Payload'];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Dados!A:F/append?valueInputOption=USER_ENTERED&key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [valuesRow],
          majorDimension: 'ROWS',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Erro ao enviar dados para Sheets:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao processar Sheets:', error);
    return false;
  }
}

export async function getSheetData(spreadsheetId: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Dados?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do Sheets');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return null;
  }
}
