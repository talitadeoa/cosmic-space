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
  const [newDepth, setNewDepth] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(chatInline);
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
  };

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const headerExtra = (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={activeProject}
          onChange={(e) => updateProject(e.target.value)}
          placeholder="Projeto (opcional)"
          aria-label="Projeto"
          className="min-w-[180px] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        />
        <select
          value={newDepth}
          onChange={(e) => setNewDepth(Number(e.target.value))}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          aria-label="Nivel"
        >
          <option value={0}>Principal</option>
          <option value={1}>Sub</option>
          <option value={2}>Sub-nivel</option>
        </select>
        {activeProject && (
          <button
            type="button"
            onClick={() => updateProject("")}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
          >
            Limpar projeto
          </button>
        )}
      </div>
      {projectOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {projectOptions.map((project) => (
            <button
              key={project}
              type="button"
              onClick={() => updateProject(project)}
              className={`rounded-full border px-2 py-1 text-[0.65rem] transition ${
                project === activeProject?.trim()
                  ? "border-indigo-300/80 bg-indigo-500/20 text-indigo-50"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-indigo-300/60"
              }`}
            >
              {project}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <InputWindow
      variant="nebula"
      size="sm"
      radius="md"
      className={`flex flex-col gap-5 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="rounded-full border border-indigo-300/60 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100 transition hover:border-indigo-200 hover:bg-indigo-500/30"
        >
          {isChatOpen ? "Fechar chat" : "Adicionar tarefa"}
        </button>
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
        headerExtra={headerExtra}
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

    </InputWindow>
  );
};

export default TodoInput;
