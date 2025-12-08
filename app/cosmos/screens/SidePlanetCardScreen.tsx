"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import TodoInput, { TodoItem as ParsedTodoItem } from "../../../components/TodoInput";
import type { ScreenProps } from "../types";

const MOON_COUNT = 4;
type MoonPhase = "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante";
type SavedTodo = ParsedTodoItem & { phase?: MoonPhase };
const TODO_STORAGE_KEY = "cosmic_space_todos_salvos";

const SidePlanetCardScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  const [showTodos, setShowTodos] = useState(false);
  const [draftTodos, setDraftTodos] = useState<ParsedTodoItem[]>([]);
  const [savedTodos, setSavedTodos] = useState<SavedTodo[]>([]);
  const [activeDrop, setActiveDrop] = useState<MoonPhase | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false);

  const handleTodoPanelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // evita que o clique no painel de to-dos acione o "voltar" do fundo
    e.stopPropagation();
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TODO_STORAGE_KEY);
      if (stored) {
        setSavedTodos(JSON.parse(stored));
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(savedTodos));
    } catch (error) {}
  }, [savedTodos]);

  const moonLabels: Record<MoonPhase, string> = {
    luaNova: "Lua Nova",
    luaCrescente: "Lua Crescente",
    luaCheia: "Lua Cheia",
    luaMinguante: "Lua Minguante",
  };

  const handleSaveDraftTodos = () => {
    if (!draftTodos.length) return;

    const now = Date.now();
    const savedByKey = new Map(
      savedTodos.map((todo) => [`${todo.text}|${todo.depth}`, todo]),
    );

    const merged: SavedTodo[] = [];
    draftTodos.forEach((todo, idx) => {
      const key = `${todo.text}|${todo.depth}`;
      const existing = savedByKey.get(key);
      merged.push(
        existing
          ? { ...existing, completed: todo.completed }
          : { ...todo, id: `todo-${now}-${idx}` },
      );
      savedByKey.delete(key);
    });

    const leftovers = Array.from(savedByKey.values());
    setSavedTodos([...merged, ...leftovers]);
  };

  const assignTodoToPhase = (todoId: string, phase: MoonPhase) => {
    setSavedTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, phase } : todo)),
    );
  };

  const handleDragStart = (todoId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/todo-id", todoId);
    setIsDraggingTodo(true);
  };

  const handleDragEnd = () => {
    setIsDraggingTodo(false);
    setActiveDrop(null);
  };

  const handleDropOnPhase = (phase: MoonPhase) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const todoId = e.dataTransfer.getData("text/todo-id");
    if (!todoId) return;
    assignTodoToPhase(todoId, phase);
    setActiveDrop(null);
    setIsDraggingTodo(false);
  };

  const handleDragOverPhase = (phase: MoonPhase) => (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDrop(phase);
  };

  const handleDragLeavePhase = () => {
    setActiveDrop(null);
  };

  const moonCounts = useMemo(
    () =>
      savedTodos.reduce(
        (acc, todo) => {
          if (todo.phase) acc[todo.phase] = (acc[todo.phase] ?? 0) + 1;
          return acc;
        },
        {} as Record<MoonPhase, number>,
      ),
    [savedTodos],
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center px-10">
      {/* wrapper central para impedir que o card seja puxado pras bordas */}
      <div className="relative flex h-80 w-full max-w-5xl items-center justify-center">
        {/* bloco do planeta + card */}
        <div className="relative flex items-center justify-center">
          <Card
            interactive
            onClick={() => setShowTodos(!showTodos)}
            className="relative z-10 flex h-64 w-72 items-center justify-center"
          />
          <CelestialObject
            type="planeta"
            size="lg"
            className="absolute -left-16"
          />
        </div>

        {/* bloco luas + sol */}
        <div className="absolute right-0 flex items-center gap-8 pr-6">
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: MOON_COUNT }).map((_, i) => {
              const moonTypes = ["luaNova", "luaCrescente", "luaCheia", "luaMinguante"] as const;
              const moonType = moonTypes[i % moonTypes.length];
              const isEven = i % 2 === 0;
              const isActiveDrop = activeDrop === moonType;
              const badgeCount = moonCounts[moonType] ?? 0;

              // agora o zigzag é mais evidente
              const horizontalOffset = isEven
                ? "-translate-x-6"
                : "translate-x-6";

              const floatOffset = i * 1.5 - 3;

              return (
                <div key={`zigzag-lua-${i}`} className="relative">
                  {badgeCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-600 px-2 text-[0.65rem] font-semibold text-white shadow-md">
                      {badgeCount}
                    </span>
                  )}
                  <CelestialObject
                    type={moonType}
                    size="sm"
                    interactive
                    onClick={(e) => {
                      if (isDraggingTodo) return;
                      navigateWithFocus("planetCardStandalone", {
                        event: e,
                        type: moonType,
                        size: "sm",
                      });
                    }}
                    floatOffset={floatOffset}
                    onDrop={handleDropOnPhase(moonType)}
                    onDragOver={handleDragOverPhase(moonType)}
                    onDragLeave={handleDragLeavePhase}
                    className={`${horizontalOffset} transition-transform duration-300 ${
                      isActiveDrop ? "scale-110 drop-shadow-[0_0_14px_rgba(129,140,248,0.75)]" : ""
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <CelestialObject
            type="sol"
            size="md"
            interactive
            onClick={(e) => {
              if (isDraggingTodo) return;
              navigateWithFocus("planetCardBelowSun", {
                event: e,
                type: "sol",
                size: "md",
              });
            }}
            floatOffset={-2}
          />
        </div>
      </div>

      {/* Painel de To-dos Flutuante */}
      {showTodos && (
        <div
          className="absolute right-0 top-0 z-50 max-h-[32rem] w-[28rem] overflow-y-auto"
          onClick={handleTodoPanelClick}
          onMouseDown={handleTodoPanelClick}
        >
          <div className="flex flex-col gap-4">
            <TodoInput
              className="shadow-lg"
              onTodosChange={(parsed) => setDraftTodos(parsed)}
            />

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl shadow-indigo-900/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    To-dos salvos
                  </p>
                  <p className="text-[0.75rem] text-slate-400">
                    Clique em “Salvar lista” e arraste as tarefas para a lua correspondente à fase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveDraftTodos}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                  disabled={!draftTodos.length}
                >
                  Salvar lista
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {savedTodos.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nenhum to-do salvo ainda. Converta o texto acima e arraste para uma lua.
                  </p>
                ) : (
                  savedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      draggable
                      onDragStart={handleDragStart(todo.id)}
                      onDragEnd={handleDragEnd}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/20 transition hover:border-indigo-600/60 hover:bg-slate-900"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border text-[0.65rem] ${
                            todo.completed
                              ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                              : "border-slate-500 bg-slate-900/80 text-slate-400"
                          }`}
                        >
                          {todo.completed && (
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          )}
                        </span>
                        <span
                          className={`${
                            todo.completed ? "text-slate-500 line-through" : "text-slate-100"
                          }`}
                        >
                          {todo.text}
                        </span>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-[0.65rem] text-slate-300">
                        {todo.phase ? moonLabels[todo.phase] : "Sem fase"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidePlanetCardScreen;
