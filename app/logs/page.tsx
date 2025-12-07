"use client";

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';

export default function LogsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await fetch('/api/logs/emails', { credentials: 'include' });
        const data = await resp.json();
        if (data.success && data.data && data.data.values) {
          setRows(data.data.values);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AuthGate>
      <div className="p-3 sm:p-6 min-h-screen bg-space-dark">
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-slate-100">Logs de Emails Cadastrados</h2>
        {loading ? (
          <div className="text-xs sm:text-sm text-slate-400">Carregando...</div>
        ) : (
          <div className="overflow-x-auto max-w-full rounded-lg border border-slate-800">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-slate-400 bg-black/40">
                  {rows[0]?.map((_: any, i: number) => (
                    <th key={i} className="px-2 sm:px-4 py-2 sm:py-3">Coluna {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((r: any, idx: number) => (
                  <tr key={idx} className="border-t border-slate-800 hover:bg-black/20 transition-colors">
                    {r.map((c: any, ci: number) => (
                      <td key={ci} className="px-2 sm:px-4 py-2 sm:py-3 align-top text-slate-200 break-words">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
