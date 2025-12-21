"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import TodoInput, { TodoItem as ParsedTodoItem } from "@/components/TodoInput";
import {
  TODO_STORAGE_KEY,
  loadSavedTodos,
  phaseLabels,
  type MoonPhase,
  type SavedTodo,
} from "../utils/todoStorage";
import type { ScreenProps } from "../types";

const MOON_COUNT = 4;
const ALL_PROJECTS = "__all__";
const NO_PROJECT = "__none__";

const SidePlanetCardScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [showTodos, setShowTodos] = useState(true);
  const [savedTodos, setSavedTodos] = useState<SavedTodo[]>([]);
  const [activeDrop, setActiveDrop] = useState<MoonPhase | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>(ALL_PROJECTS);

  useEffect(() => {
    setSavedTodos(loadSavedTodos());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(savedTodos));
    } catch (error) {}
  }, [savedTodos]);

  const handleTodoSubmit = (todo: ParsedTodoItem) => {
    setSavedTodos((prev) => {
      const key = `${todo.text}|${todo.depth}|${todo.project ?? ""}`;
      const existingIndex = prev.findIndex(
        (item) => `${item.text}|${item.depth}|${item.project ?? ""}` === key,
      );
      if (existingIndex === -1) {
        return [...prev, todo];
      }
      const updated = [...prev];
      updated[existingIndex] = { ...updated[existingIndex], completed: todo.completed };
      return updated;
    });
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

  const groupedTodos = useMemo(() => {
    const groups = new Map<string, SavedTodo[]>();
    const fallback = "Sem projeto";

    savedTodos.forEach((todo) => {
      const key = todo.project?.trim() || fallback;
      const bucket = groups.get(key) ?? [];
      bucket.push(todo);
      groups.set(key, bucket);
    });

    const entries = Array.from(groups.entries());
    entries.sort((a, b) => {
      if (a[0] === fallback) return 1;
      if (b[0] === fallback) return -1;
      return a[0].localeCompare(b[0]);
    });
    return entries;
  }, [savedTodos]);

  const projectTabs = useMemo(() => {
    const unique = new Set<string>();
    let hasNoProject = false;

    savedTodos.forEach((todo) => {
      if (todo.project?.trim()) {
        unique.add(todo.project.trim());
      } else {
        hasNoProject = true;
      }
    });

    const tabs = [ALL_PROJECTS, ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
    if (hasNoProject) tabs.push(NO_PROJECT);
    return tabs;
  }, [savedTodos]);

  useEffect(() => {
    if (selectedProject === ALL_PROJECTS) return;
    if (selectedProject === NO_PROJECT && projectTabs.includes(NO_PROJECT)) return;
    if (projectTabs.includes(selectedProject)) return;
    setSelectedProject(ALL_PROJECTS);
  }, [projectTabs, selectedProject]);

  const filteredTodos = useMemo(() => {
    if (selectedProject === ALL_PROJECTS) return savedTodos;
    if (selectedProject === NO_PROJECT) return savedTodos.filter((todo) => !todo.project?.trim());
    return savedTodos.filter((todo) => todo.project?.trim() === selectedProject);
  }, [savedTodos, selectedProject]);

  return (
    <div className="relative flex w-full items-start justify-center overflow-y-auto px-4 py-5 sm:px-8">
      <div className="relative flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        {/* sol + luas */}
        <div className="order-1 flex w-full flex-col items-center gap-3 sm:gap-4 lg:order-2 lg:w-auto lg:flex-row lg:items-center lg:gap-6">
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
            className="order-1 scale-90 sm:scale-100 lg:order-2"
          />

          <div className="order-2 flex w-full flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:order-1 lg:w-auto lg:flex-col lg:items-center">
            {Array.from({ length: MOON_COUNT }).map((_, i) => {
              const moonTypes = ["luaNova", "luaCrescente", "luaCheia", "luaMinguante"] as const;
              const moonType = moonTypes[i % moonTypes.length];
              const isActiveDrop = activeDrop === moonType;
              const badgeCount = moonCounts[moonType] ?? 0;

              const floatOffset = i * 1.5 - 3;

              return (
                <div key={`zigzag-lua-${i}`} className="relative flex items-center justify-center">
                  {badgeCount > 0 && (
                    <span className="absolute -right-3 top-1/2 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 px-2 text-[0.65rem] font-semibold text-white shadow-md">
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
                    className={`transition-transform duration-300 ${
                      isActiveDrop ? "scale-110 drop-shadow-[0_0_14px_rgba(129,140,248,0.75)]" : ""
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* bloco do planeta + card com painel de to-dos embutido */}
        <div className="relative order-2 w-full lg:order-1 lg:max-w-3xl">
          <Card className="relative z-10 w-full overflow-hidden border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-6">
            <div className="flex flex-col gap-4 overflow-visible pr-1 sm:gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                    Painel lunar lateral
                  </p>
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    Organize tarefas por fase e projeto
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTodos((prev) => !prev)}
                  className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-100 shadow-md transition hover:bg-indigo-500/30"
                >
                  {showTodos ? "Esconder" : "Mostrar"} painel
                </button>
              </div>

              {showTodos ? (
                <div className="flex flex-col gap-4 flex-shrink-0">
                  <TodoInput
                    className="shadow-lg flex-shrink-0"
                    onTodoSubmit={handleTodoSubmit}
                    projectOptions={projectTabs.filter(
                      (tab) => tab !== ALL_PROJECTS && tab !== NO_PROJECT,
                    )}
                  />

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl shadow-indigo-900/20">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                          To-dos salvos
                        </p>
                        <p className="text-[0.75rem] text-slate-400">
                          Adicione tarefas e arraste para a fase lunar desejada.
                        </p>
                      </div>
                      {projectTabs.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {projectTabs.map((tab) => {
                            const isActive = tab === selectedProject;
                            const label =
                              tab === ALL_PROJECTS
                                ? "Todos"
                                : tab === NO_PROJECT
                                  ? "Sem projeto"
                                  : tab;

                            return (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setSelectedProject(tab)}
                                className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition ${
                                  isActive
                                    ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-indigo-400/70"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
                      {savedTodos.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          Nenhum to-do salvo ainda. Crie tarefas e organize por projeto.
                        </p>
                      ) : (
                        (selectedProject === ALL_PROJECTS
                          ? groupedTodos
                          : [["__filtered__" as const, filteredTodos]] as Array<[string, SavedTodo[]]>).map(([project, todos]) => {
                            const showHeader = selectedProject === ALL_PROJECTS;
                            return (
                              <div key={project} className="space-y-2">
                                {showHeader && (
                                  <div className="flex items-center justify-between">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                      {project}
                                    </p>
                                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.6rem] text-slate-300">
                                      {todos.length} tarefas
                                    </span>
                                  </div>
                                )}
                                {todos.length === 0 ? (
                                  <p className="text-sm text-slate-500">
                                    Nenhuma tarefa nesse projeto ainda.
                                  </p>
                                ) : (
                                  todos.map((todo) => (
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
                                        {todo.phase ? phaseLabels[todo.phase] : "Sem fase"}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-indigo-400/40 bg-slate-900/60 p-4 text-sm text-slate-300">
                  Use o botão acima para abrir o painel e editar os to-dos dentro do próprio card.
                </div>
              )}
            </div>
          </Card>

          <div className="mt-6 flex justify-center lg:mt-0">
            <CelestialObject
              type="planeta"
              size="lg"
              className="pointer-events-none scale-80 sm:scale-90 lg:absolute lg:-left-6 lg:top-4 lg:-z-0 lg:scale-75 xl:-left-10 xl:scale-90 2xl:-left-16 2xl:top-6 2xl:scale-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePlanetCardScreen;
