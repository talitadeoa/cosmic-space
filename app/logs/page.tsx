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
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Logs de Emails Cadastrados</h2>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="overflow-auto max-w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  {rows[0]?.map((_: any, i: number) => (
                    <th key={i} className="px-2 py-1">Coluna {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((r: any, idx: number) => (
                  <tr key={idx} className="border-t border-slate-800">
                    {r.map((c: any, ci: number) => (
                      <td key={ci} className="px-2 py-1 align-top">{c}</td>
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
