"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import TodoInput, { TodoItem as ParsedTodoItem } from "../components/TodoInput";
import {
  loadSavedProjects,
  loadSavedTodos,
  phaseLabels,
  saveSavedProjects,
  saveSavedTodos,
  type MoonPhase,
  type SavedTodo,
} from "../utils/todoStorage";
import type { ScreenProps } from "../types";

const MOON_COUNT = 4;
const normalizeProjectName = (value: string) => value.trim();
const mergeProjects = (projects: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  projects.forEach((project) => {
    const trimmed = normalizeProjectName(project);
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(trimmed);
  });
  return result;
};

type MoonClusterProps = {
  activeDrop: MoonPhase | null;
  moonCounts: Record<MoonPhase, number>;
  isDraggingTodo: boolean;
  onSolNavigate: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMoonNavigate: (phase: MoonPhase, event: React.MouseEvent<HTMLDivElement>) => void;
  onDrop: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragOver: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragLeave: () => void;
};

const MoonCluster = ({
  activeDrop,
  moonCounts,
  isDraggingTodo,
  onSolNavigate,
  onMoonNavigate,
  onDrop,
  onDragOver,
  onDragLeave,
}: MoonClusterProps) => (
  <div className="order-1 flex w-full flex-col items-center gap-3 sm:gap-4 lg:order-2 lg:w-auto lg:flex-row lg:items-center lg:gap-6">
    <CelestialObject
      type="sol"
      size="md"
      interactive
      onClick={(event) => {
        if (isDraggingTodo) return;
        onSolNavigate(event);
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
              onClick={(event) => {
                if (isDraggingTodo) return;
                onMoonNavigate(moonType, event);
              }}
              floatOffset={floatOffset}
              onDrop={onDrop(moonType)}
              onDragOver={onDragOver(moonType)}
              onDragLeave={onDragLeave}
              className={`transition-transform duration-300 ${
                isActiveDrop ? "scale-110 drop-shadow-[0_0_14px_rgba(129,140,248,0.75)]" : ""
              }`}
            />
          </div>
        );
      })}
    </div>
  </div>
);

type ProjectMenuPanelProps = {
  isOpen: boolean;
  projectOptions: string[];
  projectCounts: Map<string, number>;
  selectedProject: string;
  isAddingProject: boolean;
  newProjectDraft: string;
  onSelectProject: (project: string) => void;
  onDraftChange: (value: string) => void;
  onCreateProject: () => void;
  onCloseMenu: () => void;
  onStartAdd: () => void;
  onCancelAdd: () => void;
};

const ProjectMenuPanel = ({
  isOpen,
  projectOptions,
  projectCounts,
  selectedProject,
  isAddingProject,
  newProjectDraft,
  onSelectProject,
  onDraftChange,
  onCreateProject,
  onCloseMenu,
  onStartAdd,
  onCancelAdd,
}: ProjectMenuPanelProps) => (
  <div
    className={`overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-950/70 shadow-xl shadow-indigo-900/20 transition-[max-height,opacity,transform] duration-300 ${
      isOpen ? "max-h-72 opacity-100 translate-y-0 p-3" : "max-h-0 opacity-0 -translate-y-2 p-0"
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
          Projetos
        </p>
        <p className="text-[0.75rem] text-slate-400">
          Escolha um projeto para focar as tarefas.
        </p>
      </div>
      <button
        type="button"
        onClick={onCloseMenu}
        className="text-xs font-semibold text-slate-400 transition hover:text-slate-200"
      >
        Fechar
      </button>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      {projectOptions.length === 0 ? (
        <span className="text-xs text-slate-500">Nenhum projeto criado ainda.</span>
      ) : (
        projectOptions.map((project) => {
          const count = projectCounts.get(project.toLowerCase()) ?? 0;
          const isActive = project === selectedProject.trim();
          return (
            <button
              key={project}
              type="button"
              onClick={() => onSelectProject(project)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-semibold transition ${
                isActive
                  ? "border-indigo-300/80 bg-indigo-500/20 text-indigo-100"
                  : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60"
              }`}
            >
              <span>{project}</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.6rem] text-slate-300">
                {count}
              </span>
            </button>
          );
        })
      )}
    </div>

    <div className="mt-3">
      {isAddingProject ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newProjectDraft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onCreateProject();
              }
            }}
            placeholder="Nome do projeto"
            className="min-w-[180px] flex-1 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-indigo-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="button"
            onClick={onCreateProject}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={onCancelAdd}
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStartAdd}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-indigo-400/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-indigo-100 transition hover:border-indigo-300"
        >
          <span className="text-base">+</span>
          Novo projeto
        </button>
      )}
    </div>
  </div>
);

type SavedTodosPanelProps = {
  savedTodos: SavedTodo[];
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
};

const SavedTodosPanel = ({ savedTodos, onDragStart, onDragEnd }: SavedTodosPanelProps) => (
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
    </div>

    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
      {savedTodos.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhum to-do salvo ainda. Crie tarefas e organize por fase lunar.
        </p>
      ) : (
        savedTodos.map((todo) => (
          <div
            key={todo.id}
            draggable
            onDragStart={onDragStart(todo.id)}
            onDragEnd={onDragEnd}
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
                {todo.completed && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
              </span>
              <div className="flex flex-col gap-1">
                <span
                  className={`${
                    todo.completed ? "text-slate-500 line-through" : "text-slate-100"
                  }`}
                >
                  {todo.text}
                </span>
                {(todo.category || todo.dueDate) && (
                  <div className="flex flex-wrap gap-1 text-[0.6rem] text-slate-400">
                    {todo.category && (
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                        {todo.category}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
                        {todo.dueDate}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-1 text-[0.65rem] text-slate-300">
              {todo.phase ? phaseLabels[todo.phase] : "Sem fase"}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);

const SidePlanetCardScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [savedTodos, setSavedTodos] = useState<SavedTodo[]>([]);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [newProjectDraft, setNewProjectDraft] = useState("");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [activeDrop, setActiveDrop] = useState<MoonPhase | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false);

  useEffect(() => {
    setSavedTodos(loadSavedTodos());
    setSavedProjects(loadSavedProjects());
  }, []);

  useEffect(() => {
    saveSavedTodos(savedTodos);
  }, [savedTodos]);

  useEffect(() => {
    saveSavedProjects(savedProjects);
  }, [savedProjects]);

  const handleTodoSubmit = (todo: ParsedTodoItem) => {
    if (todo.project?.trim()) {
      setSavedProjects((prev) => mergeProjects([...prev, todo.project ?? ""]));
    }
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

  const handleCreateProject = () => {
    const trimmed = newProjectDraft.trim();
    if (!trimmed) return;
    setSavedProjects((prev) => mergeProjects([...prev, trimmed]));
    setSelectedProject(trimmed);
    setNewProjectDraft("");
    setIsAddingProject(false);
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

  const projectOptions = useMemo(
    () =>
      mergeProjects([
        ...savedProjects,
        ...savedTodos.map((todo) => todo.project ?? ""),
      ]),
    [savedProjects, savedTodos],
  );

  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    savedTodos.forEach((todo) => {
      const projectName = todo.project?.trim();
      if (!projectName) return;
      const key = projectName.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [savedTodos]);

  return (
    <div className="relative flex w-full items-start justify-center px-4 sm:px-8 pt-4 sm:pt-6">
      <div className="relative flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <MoonCluster
          activeDrop={activeDrop}
          moonCounts={moonCounts}
          isDraggingTodo={isDraggingTodo}
          onSolNavigate={(event) =>
            navigateWithFocus("planetCardBelowSun", { event, type: "sol", size: "md" })
          }
          onMoonNavigate={(phase, event) =>
            navigateWithFocus("planetCardStandalone", { event, type: phase, size: "sm" })
          }
          onDrop={handleDropOnPhase}
          onDragOver={handleDragOverPhase}
          onDragLeave={handleDragLeavePhase}
        />

        {/* bloco do planeta + card com painel de to-dos embutido */}
        <div className="relative order-2 w-full lg:order-1 lg:max-w-3xl lg:pl-16">
          <Card className="relative z-10 w-full overflow-hidden border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-6">
            <div className="flex flex-col gap-4 overflow-visible pr-1 sm:gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                    Painel lunar lateral
                  </p>
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    Organize tarefas por fase lunar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProjectMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-indigo-400/60 hover:text-white lg:hidden"
                  aria-expanded={isProjectMenuOpen}
                >
                  Projetos
                  <span className="text-sm text-indigo-200">◦</span>
                </button>
              </div>

              <div className="flex flex-col gap-4 flex-shrink-0">
                <ProjectMenuPanel
                  isOpen={isProjectMenuOpen}
                  projectOptions={projectOptions}
                  projectCounts={projectCounts}
                  selectedProject={selectedProject}
                  isAddingProject={isAddingProject}
                  newProjectDraft={newProjectDraft}
                  onSelectProject={setSelectedProject}
                  onDraftChange={setNewProjectDraft}
                  onCreateProject={handleCreateProject}
                  onCloseMenu={() => setIsProjectMenuOpen(false)}
                  onStartAdd={() => setIsAddingProject(true)}
                  onCancelAdd={() => {
                    setIsAddingProject(false);
                    setNewProjectDraft("");
                  }}
                />

                <TodoInput
                  className="shadow-lg flex-shrink-0"
                  onTodoSubmit={handleTodoSubmit}
                  projectOptions={projectOptions}
                  projectValue={selectedProject}
                  onProjectChange={setSelectedProject}
                  chatInline={false}
                />

                <SavedTodosPanel
                  savedTodos={savedTodos}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </div>
            </div>
          </Card>

          <div className="hidden justify-center lg:absolute lg:left-0 lg:top-1/2 lg:flex lg:-translate-y-1/2">
            <CelestialObject
              type="planeta"
              size="lg"
              interactive
              onClick={() => setIsProjectMenuOpen((prev) => !prev)}
              className={`scale-75 transition-transform xl:scale-90 2xl:scale-100 ${
                isProjectMenuOpen ? "drop-shadow-[0_0_18px_rgba(99,102,241,0.65)]" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePlanetCardScreen;
