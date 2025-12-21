"use client";

import { useState } from "react";
import InputWindow from "./InputWindow";
import CosmosChatModal from "./CosmosChatModal";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  depth: number;
  project?: string;
  category?: string;
  dueDate?: string;
}

interface TodoInputProps {
  onTodoSubmit: (todo: TodoItem) => void;
  projectOptions: string[];
  projectValue: string;
  onProjectChange: (value: string) => void;
  className?: string;
  chatInline?: boolean;
}

const TodoInput: React.FC<TodoInputProps> = ({
  onTodoSubmit,
  projectValue,
  projectOptions,
  onProjectChange,
  className = "",
  chatInline = true,
}) => {
  const [taskDraft, setTaskDraft] = useState("");
  const [newDepth, setNewDepth] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const activeProject = projectValue;

  const updateProject = (value: string) => {
    onProjectChange(value);
  };

  const handleAddTodo = (text: string, meta?: { category?: string; date?: string }) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const trimmedProject = activeProject.trim();

    onTodoSubmit({
      id: `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: trimmed,
      completed: false,
      depth: newDepth,
      project: trimmedProject ? trimmedProject : undefined,
      category: meta?.category,
      dueDate: meta?.date,
    });
    setTaskDraft("");
  };

  const handleQuickAdd = () => {
    if (!taskDraft.trim()) return;
    handleAddTodo(taskDraft);
  };

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

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
            Estruture tarefas com projeto, nivel e fase lunar para dar foco ao fluxo.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-indigo-100">Entrada estruturada</label>
        <p className="text-xs text-slate-400">Defina um projeto e capture tarefas com rapidez.</p>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={activeProject}
              onChange={(e) => updateProject(e.target.value)}
              placeholder="Projeto (opcional)"
              className="min-w-[180px] flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-indigo-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {projectOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {projectOptions.map((project) => (
                  <button
                    key={project}
                    type="button"
                    onClick={() => updateProject(project)}
                    className={`rounded-full border px-2 py-1 text-[0.65rem] transition ${
                      project === activeProject?.trim()
                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                        : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/70"
                    }`}
                  >
                    {project}
                  </button>
                ))}
              </div>
            )}
            <select
              value={newDepth}
              onChange={(e) => setNewDepth(Number(e.target.value))}
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              aria-label="Nivel"
            >
              <option value={0}>Principal</option>
              <option value={1}>Sub</option>
              <option value={2}>Sub-nivel</option>
            </select>
            <button
              type="button"
              onClick={() => setIsChatOpen((prev) => !prev)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              {isChatOpen ? "Esconder chat" : "Mostrar chat"}
            </button>
            {activeProject && (
              <button
                type="button"
                onClick={() => updateProject("")}
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
              >
                Limpar projeto
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={taskDraft}
              onChange={(e) => setTaskDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleQuickAdd();
                }
              }}
              placeholder="Descreva a tarefa e pressione Enter"
              className="min-w-[220px] flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-indigo-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="button"
              onClick={handleQuickAdd}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-700"
              disabled={!taskDraft.trim()}
            >
              Adicionar
            </button>
          </div>
        </div>
        <CosmosChatModal
          inline={chatInline}
          isOpen={isChatOpen}
          storageKey="todo-input"
          title="Checklist Orbital"
          eyebrow="Nova tarefa"
          subtitle="Adicione tarefas em formato de conversa"
          placeholder="Digite a tarefa que deseja adicionar..."
          systemGreeting="Vamos registrar uma nova tarefa."
          systemQuestion="Qual tarefa quer adicionar agora?"
          submitLabel="✨ Salvar tarefa"
          tone="indigo"
          submitStrategy="last"
          systemResponses={[
            "Tarefa registrada. ✨",
            "Checklist atualizado com sucesso. ✅",
            "Mais um passo concluído. 🚀",
          ]}
          suggestions={[
            { id: "categoria-pessoal", label: "Categoria: Pessoal", meta: { category: "Pessoal" } },
            { id: "categoria-trabalho", label: "Categoria: Trabalho", meta: { category: "Trabalho" } },
            { id: "data-hoje", label: "Hoje", meta: { date: formatDate(today) }, tone: "sky" },
            { id: "data-amanha", label: "Amanhã", meta: { date: formatDate(tomorrow) }, tone: "sky" },
            { id: "data-proxima-semana", label: "Próx. semana", meta: { date: formatDate(nextWeek) }, tone: "sky" },
          ]}
          onClose={() => setIsChatOpen(false)}
          onSubmit={async (value, _messages, meta) => {
            handleAddTodo(value, { category: meta?.category, date: meta?.date });
          }}
        />
      </div>

    </InputWindow>
  );
};

export default TodoInput;
