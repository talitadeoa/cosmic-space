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
import { PHASE_VIBES } from "../utils/phaseVibes";
import type { ScreenProps } from "../types";
import { usePhaseInputs } from "@/hooks/usePhaseInputs";
import { SavedTodosPanel } from "../components/SavedTodosPanel";
import { MoonPhasesRail } from "../components/MoonPhasesRail";
import { IslandsList } from "../components/IslandsList";
import type { IslandId } from "../types/screen";

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
  onMoonNavigate: (phase: MoonPhase, event: React.MouseEvent<HTMLDivElement>) => void;
  onDrop: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragOver: (phase: MoonPhase) => (event: React.DragEvent) => void;
  onDragLeave: () => void;
};

const MoonCluster = ({
  activeDrop,
  moonCounts,
  isDraggingTodo,
  onMoonNavigate,
  onDrop,
  onDragOver,
  onDragLeave,
}: MoonClusterProps) => (
  <div className="flex w-full flex-col items-center gap-4">
    <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:flex-col lg:items-center">
      {Array.from({ length: MOON_COUNT }).map((_, i) => {
        const moonTypes = ["luaNova", "luaCrescente", "luaCheia", "luaMinguante"] as const;
        const moonType = moonTypes[i % moonTypes.length];
        const isActiveDrop = activeDrop === moonType;
        const badgeCount = moonCounts[moonType] ?? 0;
        const floatOffset = i * 1.5 - 3;

        return (
          <div key={`moon-${i}`} className="relative flex items-center justify-center">
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
  totalCount: number;
  selectedProject: string;
  isAddingProject: boolean;
  newProjectDraft: string;
  onSelectProject: (project: string) => void;
  onDraftChange: (value: string) => void;
  onCreateProject: () => void;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onClearProject: () => void;
};

const ProjectMenuPanel = ({
  isOpen,
  projectOptions,
  projectCounts,
  totalCount,
  selectedProject,
  isAddingProject,
  newProjectDraft,
  onSelectProject,
  onDraftChange,
  onCreateProject,
  onStartAdd,
  onCancelAdd,
  onClearProject,
}: ProjectMenuPanelProps) => (
  <div
    className={`overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-950/70 shadow-xl shadow-indigo-900/20 transition-[max-height,opacity,transform] duration-300 ${
      isOpen ? "max-h-80 opacity-100 translate-y-0 p-3" : "max-h-0 opacity-0 -translate-y-2 p-0"
    }`}
  >
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
        Agrupamento por projeto
      </p>
      <p className="text-[0.75rem] text-slate-400">
        Selecione um projeto para filtrar as tarefas.
      </p>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onClearProject}
        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-semibold transition ${
          selectedProject.trim()
            ? "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60"
            : "border-indigo-300/80 bg-indigo-500/20 text-indigo-100"
        }`}
      >
        <span>Todos</span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.6rem] text-slate-300">
          {totalCount}
        </span>
      </button>
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
  onToggleComplete: (todoId: string) => void;
  filterLabel?: string;
};

// SavedTodosPanel agora é importado de um arquivo separado
// Removed inline definition - using separate SavedTodosPanel component

const SidePlanetCardScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [savedTodos, setSavedTodos] = useState<SavedTodo[]>([]);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<IslandId | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<MoonPhase | null>(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [newProjectDraft, setNewProjectDraft] = useState("");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [activeDrop, setActiveDrop] = useState<MoonPhase | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false);
  const { saveInput } = usePhaseInputs();

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

  const handleToggleComplete = (todoId: string) => {
    setSavedTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const assignTodoToPhase = (todoId: string, phase: MoonPhase) => {
    const target = savedTodos.find((todo) => todo.id === todoId);
    if (!target) return;
    if (target.phase === phase) return;

    setSavedTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, phase } : todo)),
    );

    saveInput({
      moonPhase: phase,
      inputType: "tarefa",
      sourceId: target.id,
      content: target.text,
      vibe: PHASE_VIBES[phase].label,
      metadata: {
        project: target.project ?? null,
        category: target.category ?? null,
        dueDate: target.dueDate ?? null,
        depth: target.depth,
        completed: target.completed,
      },
    }).catch((error) => {
      console.warn("Falha ao salvar tarefa na fase:", error);
    });
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

  const filteredTodos = useMemo(() => {
    const trimmed = selectedProject.trim();
    if (!trimmed) return savedTodos;
    const target = trimmed.toLowerCase();
    return savedTodos.filter(
      (todo) => (todo.project ?? "").trim().toLowerCase() === target,
    );
  }, [savedTodos, selectedProject]);

  const moonCounts = useMemo(
    () =>
      filteredTodos.reduce(
        (acc, todo) => {
          if (todo.phase) acc[todo.phase] = (acc[todo.phase] ?? 0) + 1;
          return acc;
        },
        {} as Record<MoonPhase, number>,
      ),
    [filteredTodos],
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
      <div className="relative flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        {/* Coluna esquerda: Planeta + Ilhas */}
        <div className="flex w-full flex-col items-center gap-8 lg:w-auto lg:max-w-xs">
          {/* Planeta */}
          <div className="flex justify-center">
            <CelestialObject
              type="planeta"
              size="lg"
              className="scale-75 transition-transform xl:scale-90 2xl:scale-100"
            />
          </div>

          {/* Ilhas abaixo do planeta */}
          <IslandsList
            selectedIsland={selectedIsland}
            onSelectIsland={setSelectedIsland}
          />
        </div>

        {/* Coluna central: Card com To-dos */}
        <div className="relative w-full lg:flex-1">
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
                  onClick={() => {
                    if (isProjectMenuOpen) {
                      setIsAddingProject(false);
                      setNewProjectDraft("");
                    }
                    setIsProjectMenuOpen((prev) => !prev);
                  }}
                  className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-100 shadow-md transition hover:bg-indigo-500/30"
                >
                  {isProjectMenuOpen ? "Esconder" : "Mostrar"} painel
                </button>
              </div>

              <div className="flex flex-col gap-4 flex-shrink-0">
                <ProjectMenuPanel
                  isOpen={isProjectMenuOpen}
                  projectOptions={projectOptions}
                  projectCounts={projectCounts}
                  totalCount={savedTodos.length}
                  selectedProject={selectedProject}
                  isAddingProject={isAddingProject}
                  newProjectDraft={newProjectDraft}
                  onSelectProject={setSelectedProject}
                  onDraftChange={setNewProjectDraft}
                  onCreateProject={handleCreateProject}
                  onStartAdd={() => setIsAddingProject(true)}
                  onCancelAdd={() => {
                    setIsAddingProject(false);
                    setNewProjectDraft("");
                  }}
                  onClearProject={() => setSelectedProject("")}
                />

                <TodoInput
                  className="shadow-lg flex-shrink-0"
                  onTodoSubmit={handleTodoSubmit}
                  chatInline={true}
                />

                <SavedTodosPanel
                  savedTodos={filteredTodos}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onToggleComplete={handleToggleComplete}
                  onAssignPhase={assignTodoToPhase}
                  filterLabel={selectedProject.trim() || undefined}
                  selectedPhase={selectedPhase}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna direita: Luas + Sol */}
        <div className="flex w-full flex-col items-center justify-center gap-6 lg:w-auto lg:max-w-xs lg:flex-row lg:items-center">
          {/* MoonCluster com as luas interativas */}
          <MoonCluster
            activeDrop={activeDrop}
            moonCounts={moonCounts}
            isDraggingTodo={isDraggingTodo}
            onMoonNavigate={(phase, event) =>
              navigateWithFocus("planetCardStandalone", { event, type: phase, size: "sm" })
            }
            onDrop={handleDropOnPhase}
            onDragOver={handleDragOverPhase}
            onDragLeave={handleDragLeavePhase}
          />

          {/* Sol */}
          <CelestialObject
            type="sol"
            size="md"
            interactive
            onClick={(event) => {
              if (isDraggingTodo) return;
              navigateWithFocus("planetCardBelowSun", { event, type: "sol", size: "md" });
            }}
            floatOffset={-2}
            className="scale-90 sm:scale-100"
          />
        </div>
      </div>
    </div>
  );
};

export default SidePlanetCardScreen;
