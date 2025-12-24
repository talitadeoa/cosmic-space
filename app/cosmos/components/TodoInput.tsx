"use client";

import { useState } from "react";
import InputWindow from "./InputWindow";
import CosmosChatModal from "./CosmosChatModal";
import type { IslandId } from "../utils/todoStorage";

export type TodoInputType = "text" | "checkbox";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  depth: number;
  inputType: TodoInputType;
  category?: string;
  dueDate?: string;
  islandId?: IslandId;
}

interface TodoInputProps {
  onTodoSubmit: (todo: TodoItem) => void;
  className?: string;
  chatInline?: boolean;
  selectedIsland?: IslandId | null;
}

const TodoInput: React.FC<TodoInputProps> = ({
  onTodoSubmit,
  className = "",
  chatInline = true,
  selectedIsland = null,
}) => {
  const [newDepth, setNewDepth] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputType, setInputType] = useState<TodoInputType>("checkbox");
  const islandLabel = selectedIsland ? `Ilha ${selectedIsland.replace("ilha", "")}` : null;

  const handleAddTodo = (text: string, meta?: { category?: string; date?: string }) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const isCheckbox = inputType === "checkbox";

    onTodoSubmit({
      id: `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: trimmed,
      completed: false,
      depth: newDepth,
      inputType,
      category: isCheckbox ? meta?.category : undefined,
      dueDate: isCheckbox ? meta?.date : undefined,
      islandId: selectedIsland ?? undefined,
    });
  };

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const copyByType = {
    checkbox: {
      actionLabel: isChatOpen ? "Fechar chat" : "Adicionar to-do",
      placeholder: "Digite a tarefa que deseja adicionar...",
      systemGreeting: "Vamos registrar uma nova tarefa.",
      systemQuestion: "Qual tarefa quer adicionar agora?",
      submitLabel: "✨ Salvar tarefa",
      responses: [
        "Tarefa registrada. ✨",
        "Checklist atualizado com sucesso. ✅",
        "Mais um passo concluído. 🚀",
      ],
    },
    text: {
      actionLabel: isChatOpen ? "Fechar chat" : "Adicionar texto",
      placeholder: "Digite o texto que deseja salvar...",
      systemGreeting: "Vamos registrar um novo texto.",
      systemQuestion: "Que texto quer salvar agora?",
      submitLabel: "✨ Salvar texto",
      responses: [
        "Texto salvo. ✨",
        "Anotação registrada com sucesso.",
        "Mais um registro guardado. 🚀",
      ],
    },
  } as const;
  const activeCopy = copyByType[inputType];
  const isCheckbox = inputType === "checkbox";
  const headerExtra = islandLabel ? (
    <div className="mt-3 flex flex-wrap gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-indigo-100">
      <span className="rounded-full border border-indigo-300/40 bg-indigo-500/15 px-3 py-1">
        {islandLabel}
      </span>
    </div>
  ) : undefined;

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
          {activeCopy.actionLabel}
        </button>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-300">
          <button
            type="button"
            onClick={() => setInputType("checkbox")}
            className={`rounded-full px-2 py-1 transition ${
              inputType === "checkbox"
                ? "bg-indigo-500/30 text-indigo-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            To-do
          </button>
          <button
            type="button"
            onClick={() => setInputType("text")}
            className={`rounded-full px-2 py-1 transition ${
              inputType === "text"
                ? "bg-indigo-500/30 text-indigo-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Texto
          </button>
        </div>
        {islandLabel && (
          <span className="rounded-full border border-indigo-300/40 bg-indigo-500/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-indigo-100">
            {islandLabel}
          </span>
        )}
      </div>
      <CosmosChatModal
        inline={chatInline}
        isOpen={isChatOpen}
        storageKey={`todo-input-${inputType}`}
        title=""
        eyebrow=""
        subtitle=""
        placeholder={activeCopy.placeholder}
        systemGreeting={activeCopy.systemGreeting}
        systemQuestion={activeCopy.systemQuestion}
        submitLabel={activeCopy.submitLabel}
        tone="indigo"
        submitStrategy="last"
        headerExtra={headerExtra}
        systemResponses={[...activeCopy.responses]}
        suggestions={
          isCheckbox
            ? [
                { id: "categoria-pessoal", label: "Categoria: Pessoal", meta: { category: "Pessoal" } },
                { id: "categoria-trabalho", label: "Categoria: Trabalho", meta: { category: "Trabalho" } },
                { id: "data-hoje", label: "Hoje", meta: { date: formatDate(today) }, tone: "sky" },
                { id: "data-amanha", label: "Amanhã", meta: { date: formatDate(tomorrow) }, tone: "sky" },
                { id: "data-proxima-semana", label: "Próx. semana", meta: { date: formatDate(nextWeek) }, tone: "sky" },
              ]
            : []
        }
        onClose={() => setIsChatOpen(false)}
        onSubmit={async (value, _messages, meta) => {
          handleAddTodo(value, { category: meta?.category, date: meta?.date });
        }}
      />

    </InputWindow>
  );
};

export default TodoInput;
