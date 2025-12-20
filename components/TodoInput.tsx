"use client";

import React, { useEffect, useMemo, useState } from "react";
import InputWindow from "./InputWindow";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  depth: number;
  milestone?: string;
}

interface TodoInputProps {
  value?: TodoItem[];
  onTodosChange?: (todos: TodoItem[]) => void;
  className?: string;
  showPreview?: boolean;
}

const TodoInput: React.FC<TodoInputProps> = ({
  value,
  onTodosChange,
  className = "",
  showPreview = true,
}) => {
  const [todos, setTodos] = useState<TodoItem[]>(value ?? []);
  const [newText, setNewText] = useState("");
  const [currentMilestone, setCurrentMilestone] = useState("");
  const [newDepth, setNewDepth] = useState(0);

  useEffect(() => {
    if (value !== undefined) {
      setTodos(value);
    }
  }, [value]);

  const syncTodos = (next: TodoItem[]) => {
    setTodos(next);
    onTodosChange?.(next);
  };

  const handleAddTodo = () => {
    const text = newText.trim();
    if (!text) return;

    const next = [
      ...todos,
      {
        id: `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text,
        completed: false,
        depth: newDepth,
        milestone: currentMilestone.trim() ? currentMilestone.trim() : undefined,
      },
    ];
    setNewText("");
    syncTodos(next);
  };

  const handleToggleTodo = (id: string) => {
    syncTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const handleRemoveTodo = (id: string) => {
    syncTodos(todos.filter((todo) => todo.id !== id));
  };

  const progress = useMemo(() => {
    if (!todos.length) return 0;
    const done = todos.filter((todo) => todo.completed).length;
    return Math.round((done / todos.length) * 100);
  }, [todos]);

  return (
    <InputWindow
      variant="nebula"
      size="sm"
      radius="md"
      className={`flex flex-col gap-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            Checklist Orbital
          </p>
          <p className="text-[0.8rem] text-slate-400">
            Adicione tarefas clicaveis e marque marcos para organizar o fluxo.
          </p>
        </div>
        <div className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-indigo-200">
          Progresso: {progress}%
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-indigo-100">
          Entrada rapida de tarefas
        </label>
        <p className="text-xs text-slate-400">
          Defina um marco (opcional) e adicione tarefas clicaveis como no checklist de planetas.
        </p>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={currentMilestone}
              onChange={(e) => setCurrentMilestone(e.target.value)}
              placeholder="Marco atual (opcional)"
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-indigo-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="button"
              onClick={() => setCurrentMilestone("")}
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
            >
              Limpar marco
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Digite uma tarefa"
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-indigo-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <select
              value={newDepth}
              onChange={(e) => setNewDepth(Number(e.target.value))}
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value={0}>Principal</option>
              <option value={1}>Sub</option>
              <option value={2}>Sub-nivel</option>
            </select>
            <button
              type="button"
              onClick={handleAddTodo}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {showPreview && todos.length > 0 && (
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
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    className={`flex h-4 w-4 items-center justify-center rounded-full border text-[0.65rem] transition hover:border-emerald-300 ${
                      todo.completed
                        ? "border-emerald-400 bg-emerald-500/20"
                        : "border-slate-500 bg-slate-900/80"
                    }`}
                    aria-label={todo.completed ? "Marcar como pendente" : "Marcar como concluido"}
                  >
                    {todo.completed && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed ? "text-slate-500 line-through" : "text-slate-100"
                    }`}
                  >
                    {todo.text}
                  </span>
                  {todo.milestone && (
                    <span className="rounded-full bg-indigo-900/60 px-2 py-0.5 text-[0.65rem] text-indigo-200">
                      {todo.milestone}
                    </span>
                  )}
                  {todo.depth > 0 && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-300">
                      {todo.depth === 1 ? "Sub" : "Sub-nível"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveTodo(todo.id)}
                    className="rounded-full border border-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-400 transition hover:border-rose-500/60 hover:text-rose-200"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </InputWindow>
  );
};

export default TodoInput;
