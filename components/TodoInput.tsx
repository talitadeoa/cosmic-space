"use client";

import React, { useMemo, useState } from "react";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  depth: number;
}

interface TodoInputProps {
  onTodosChange?: (todos: TodoItem[]) => void;
  className?: string;
}

const TodoInput: React.FC<TodoInputProps> = ({ onTodosChange, className = "" }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");

  const parseInput = (text: string): TodoItem[] => {
    const lines = text.split("\n");
    const parsed: TodoItem[] = [];
    let id = 0;

    lines.forEach((line) => {
      // aceita to-do normal ou com subnível usando -[] ou --[]
      const todoMatch = line.match(/^(\s*-{0,2})\s*\[(.*?)\]\s*(.*)$/i);
      if (todoMatch) {
        const prefix = todoMatch[1] ?? "";
        const completed = todoMatch[2].toLowerCase() === "x";
        const text = todoMatch[3].trim();
        const depth = Math.min(prefix.replace(/\s/g, "").length, 2);

        if (text) {
          parsed.push({
            id: `todo-${id}`,
            text,
            completed,
            depth,
          });
          id++;
        }
      }
    });

    return parsed;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    const parsedTodos = parseInput(value);
    setTodos(parsedTodos);
    onTodosChange?.(parsedTodos);
  };

  const progress = useMemo(() => {
    if (!todos.length) return 0;
    const done = todos.filter((todo) => todo.completed).length;
    return Math.round((done / todos.length) * 100);
  }, [todos]);

  return (
    <div
      className={`flex flex-col gap-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-indigo-950/40 p-5 shadow-xl shadow-indigo-900/20 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            Checklist Orbital
          </p>
          <p className="text-[0.8rem] text-slate-400">
            Digite seus to-dos no padrão já usado nos checklists do projeto.
          </p>
        </div>
        <div className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-indigo-200">
          Progresso: {progress}%
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-indigo-100">
          Entrada rápida de tarefas
        </label>
        <p className="text-xs text-slate-400">
          Use `[x]` ou `[ ]` para marcar, e `-[ ]` / `--[ ]` para subtarefas (segue o modelo de checklist já usado nas telas de planeta).
        </p>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder={`[ ] Tarefa principal\n[x] Tarefa concluída\n-[ ] Sub-tarefa\n--[x] Sub de sub-tarefa concluída`}
          className="min-h-40 rounded-xl border border-slate-800 bg-slate-900/60 p-3 font-mono text-sm text-indigo-50 placeholder-slate-500 backdrop-blur focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {todos.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-indigo-900/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-indigo-100">Pré-visualização em checklist</h3>
            <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="mt-1 space-y-1.5 text-xs">
            {todos.map((todo) => (
              <li key={todo.id}>
                <div
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-900/60"
                  style={{ marginLeft: `${todo.depth * 10}px` }}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border text-[0.65rem] ${
                      todo.completed
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                        : "border-slate-500 bg-slate-900/80 text-slate-400"
                    }`}
                    aria-hidden="true"
                  >
                    {todo.completed && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed ? "text-slate-500 line-through" : "text-slate-100"
                    }`}
                  >
                    {todo.text}
                  </span>
                  {todo.depth > 0 && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-300">
                      {todo.depth === 1 ? "Sub" : "Sub-nível"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TodoInput;
