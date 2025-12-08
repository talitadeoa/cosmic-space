"use client";

import React, { useState } from "react";

interface TodoItem {
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

  return (
    <div className={`flex flex-col gap-4 rounded-lg bg-gray-900/50 p-6 ${className}`}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">
          To-dos (use [x], [ ], -[] ou --[] para subtarefas)
        </label>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder={`[ ] Tarefa principal\n[x] Tarefa concluída\n-[ ] Sub-tarefa\n--[x] Sub de sub-tarefa concluída`}
          className="min-h-40 rounded border border-gray-700 bg-gray-800 p-3 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {todos.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-800/30 p-4">
          <h3 className="text-sm font-semibold text-gray-200">Pré-visualização:</h3>
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              // mostra subníveis com indentação visual
              <li
                key={todo.id}
                className={`flex items-center gap-2 text-sm ${
                  todo.completed ? "text-gray-500 line-through" : "text-gray-200"
                }`}
                style={{ marginLeft: `${todo.depth * 16}px` }}
              >
                <span className="text-xs">{todo.completed ? "☑" : "☐"}</span>
                {todo.depth > 0 ? "—".repeat(todo.depth) + " " : ""}
                {todo.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TodoInput;
