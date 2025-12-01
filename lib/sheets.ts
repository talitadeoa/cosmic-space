// lib/sheets.ts
// Integração com Google Sheets API

interface SheetData {
  name: string;
  email: string;
  message: string;
  timestamp: string;
  [key: string]: string;
}

export async function appendToSheet(data: SheetData): Promise<boolean> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!spreadsheetId || !apiKey) {
      console.error('Google Sheets credentials missing');
      return false;
    }

    // Usando Google Sheets API v4
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Dados!A:F:append?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[
            data.timestamp,
            data.name,
            data.email,
            data.message,
            new Date().toISOString(),
            'Novo registro'
          ]],
          majorDimension: 'ROWS',
        }),
      }
    );

    if (!response.ok) {
      console.error('Erro ao enviar dados para Sheets:', response.statusText);
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
