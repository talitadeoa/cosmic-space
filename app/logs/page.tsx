import { cookies } from 'next/headers';
import AuthGate from '@/components/AuthGate';
import { validateToken } from '@/lib/auth';
import { getSheetData } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const isAuthenticated = token ? validateToken(token) : false;

  let rows: any[] = [];
  let error: string | null = null;

  if (isAuthenticated) {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!spreadsheetId || !apiKey) {
      error = 'Sheets nao configurado';
    } else {
      const data = await getSheetData(spreadsheetId, apiKey);
      if (data?.values && Array.isArray(data.values)) {
        rows = data.values;
      } else {
        error = 'Nenhum dado encontrado';
      }
    }
  }

  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const bodyRows = Array.isArray(rows[0]) ? rows.slice(1) : [];

  return (
    <AuthGate>
      <div className="p-3 sm:p-6 min-h-screen bg-space-dark">
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-slate-100">
          Logs de Emails Cadastrados
        </h2>
        {error ? (
          <div className="text-xs sm:text-sm text-rose-300">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-xs sm:text-sm text-slate-400">Sem registros.</div>
        ) : (
          <div className="overflow-x-auto max-w-full rounded-lg border border-slate-800">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-slate-400 bg-black/40">
                  {header.map((_: any, i: number) => (
                    <th key={i} className="px-2 sm:px-4 py-2 sm:py-3">
                      Coluna {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row: any, rowIndex: number) => {
                  const cells = Array.isArray(row) ? row : [row];
                  return (
                    <tr
                      key={rowIndex}
                      className="border-t border-slate-800 hover:bg-black/20 transition-colors"
                    >
                      {cells.map((cell: any, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="px-2 sm:px-4 py-2 sm:py-3 align-top text-slate-200 break-words"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
