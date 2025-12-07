"use client";

import { useEffect, useMemo, useState } from 'react';

type SubTask = { id: string; text: string; done: boolean };
type Task = { id: string; title: string; subtasks: SubTask[] };

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Checklist({ storageKey = 'cosmic_checklist' }: { storageKey?: string }) {
  const [tabs, setTabs] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      { id: uid(), title: 'Geral', subtasks: [{ id: uid(), text: 'Ex: Organizar notas', done: false }] },
      { id: uid(), title: 'Lua', subtasks: [{ id: uid(), text: 'Registrar fase', done: false }] },
    ];
  });

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tabs));
    } catch (e) {}
  }, [tabs, storageKey]);

  const progress = useMemo(() => {
    const all = tabs.flatMap(t => t.subtasks);
    if (!all.length) return 0;
    const done = all.filter(s => s.done).length;
    return Math.round((done / all.length) * 100);
  }, [tabs]);

  function toggleSubtask(tabId: string, subId: string) {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) } : t));
  }

  function addSubtask(tabId: string, text: string) {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, subtasks: [...t.subtasks, { id: uid(), text, done: false }] } : t));
  }

  async function syncToServer() {
    try {
      await fetch('/api/checklist/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: tabs }),
        credentials: 'include',
      });
      alert('Checklist sincronizado');
    } catch (e) {
      alert('Erro ao sincronizar checklist');
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-black/40 p-4 w-full max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Checklist</h4>
        <div className="text-xs text-slate-400">Progresso: {progress}%</div>
      </div>

      <div className="flex gap-2 mb-3">
        {tabs.map((t, i) => (
          <button key={t.id} onClick={() => setActiveIdx(i)} className={`px-3 py-1 rounded ${i === activeIdx ? 'bg-indigo-600' : 'bg-slate-800'}`}>
            {t.title}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {tabs[activeIdx]?.subtasks.map(s => (
          <label key={s.id} className="flex items-center gap-2">
            <input type="checkbox" checked={s.done} onChange={() => toggleSubtask(tabs[activeIdx].id, s.id)} />
            <span className={s.done ? 'line-through text-slate-500' : ''}>{s.text}</span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input id="newtask" placeholder="Adicionar subtarefa" className="flex-1 rounded px-3 py-2 bg-slate-900/30" />
        <button onClick={() => {
          const el = document.getElementById('newtask') as HTMLInputElement | null;
          if (!el || !el.value.trim()) return;
          addSubtask(tabs[activeIdx].id, el.value.trim());
          el.value = '';
        }} className="px-3 py-2 rounded bg-indigo-600">Adicionar</button>
        <button onClick={syncToServer} className="px-3 py-2 rounded bg-emerald-500">Sync</button>
      </div>
    </div>
  );
}
