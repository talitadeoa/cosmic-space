/**
 * Utilitários para cálculo de ciclos de fase lunar
 * Determina se um salvo está no ciclo atual, próximo ou sem prazo
 */

import type { MoonPhase, PhaseCycleType } from '@/types/todo';
import type { SavedTodo } from '@/types/todo';

/**
 * Obtém a data de início do ciclo lunar atual (aproximadamente)
 * Usa como referência o início do mês atual
 */
export function getCurrentCycleStart(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

/**
 * Obtém a data de fim do ciclo lunar atual
 * Usa como referência o fim do mês atual
 */
export function getCurrentCycleEnd(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0);
}

/**
 * Obtém a data de início do próximo ciclo lunar
 * Usa como referência o início do próximo mês
 */
export function getNextCycleStart(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 1);
}

/**
 * Obtém a data de fim do próximo ciclo lunar
 * Usa como referência o fim do próximo mês
 */
export function getNextCycleEnd(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 2, 0);
}

/**
 * Converte uma string de data ISO para Date
 */
function parseIsoDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00Z');
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Converte Date para string ISO (YYYY-MM-DD)
 */
export function toIsoString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Verifica se a data está dentro de um intervalo
 */
function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return date >= rangeStart && date <= rangeEnd;
}

/**
 * Obtém o intervalo de tempo para um ciclo específico
 */
export function getPhaseTimeRange(
  cycle: PhaseCycleType
): { start: Date; end: Date } | null {
  switch (cycle) {
    case 'current':
      return {
        start: getCurrentCycleStart(),
        end: getCurrentCycleEnd(),
      };
    case 'next':
      return {
        start: getNextCycleStart(),
        end: getNextCycleEnd(),
      };
    case null:
      // Sem prazo definido
      return null;
    default:
      return null;
  }
}

/**
 * Verifica se uma tarefa está no ciclo atual
 */
export function isInCurrentCycle(todo: SavedTodo): boolean {
  // Se não tem fase, não está em nenhum ciclo
  if (!todo.phase) return false;

  // Se tem phaseCycle explícito, usa aquele
  if (todo.phaseCycle === 'current') return true;
  if (todo.phaseCycle === 'next' || todo.phaseCycle === null) return false;

  // Fallback: se tem phaseDeadline, verifica se está no ciclo atual
  if (todo.phaseDeadline) {
    const deadline = parseIsoDate(todo.phaseDeadline);
    if (!deadline) return false;
    const { start, end } = getPhaseTimeRange('current')!;
    return isDateInRange(deadline, start, end);
  }

  // Fallback adicional: se tem dueDate, usa aquele
  if (todo.dueDate) {
    const dueDate = parseIsoDate(todo.dueDate);
    if (!dueDate) return false;
    const { start, end } = getPhaseTimeRange('current')!;
    return isDateInRange(dueDate, start, end);
  }

  return false;
}

/**
 * Verifica se uma tarefa está no próximo ciclo
 */
export function isInNextCycle(todo: SavedTodo): boolean {
  // Se não tem fase, não está em nenhum ciclo
  if (!todo.phase) return false;

  // Se tem phaseCycle explícito, usa aquele
  if (todo.phaseCycle === 'next') return true;
  if (todo.phaseCycle === 'current' || todo.phaseCycle === null) return false;

  // Fallback: se tem phaseDeadline, verifica se está no próximo ciclo
  if (todo.phaseDeadline) {
    const deadline = parseIsoDate(todo.phaseDeadline);
    if (!deadline) return false;
    const { start, end } = getPhaseTimeRange('next')!;
    return isDateInRange(deadline, start, end);
  }

  // Fallback adicional: se tem dueDate, usa aquele
  if (todo.dueDate) {
    const dueDate = parseIsoDate(todo.dueDate);
    if (!dueDate) return false;
    const { start, end } = getPhaseTimeRange('next')!;
    return isDateInRange(dueDate, start, end);
  }

  return false;
}

/**
 * Verifica se uma tarefa tem apenas fase lunar sem prazo definido
 */
export function isPhaseOnlyNoDeadline(todo: SavedTodo): boolean {
  // Deve ter fase
  if (!todo.phase) return false;

  // Não deve ter phaseCycle definido (deve ser null)
  if (todo.phaseCycle !== null && todo.phaseCycle !== undefined) return false;

  // Não deve ter phaseDeadline
  if (todo.phaseDeadline) return false;

  // Não deve ter dueDate
  if (todo.dueDate) return false;

  return true;
}

/**
 * Obtém o status do ciclo de fase para exibição
 */
export function getPhaseCycleLabel(cycle: PhaseCycleType): string {
  switch (cycle) {
    case 'current':
      return 'Lua Atual (mês atual)';
    case 'next':
      return 'Próximo Ciclo (próximo mês)';
    case null:
      return 'Sem prazo (apenas fase)';
    default:
      return 'Indefinido';
  }
}

/**
 * Define o phaseCycle e phaseDeadline baseado no ciclo selecionado
 */
export function setTodoPhaseCycle(
  todo: SavedTodo,
  cycle: PhaseCycleType
): SavedTodo {
  const updated = { ...todo, phaseCycle: cycle };

  // Calcula a data deadline baseado no ciclo
  if (cycle === 'current') {
    updated.phaseDeadline = toIsoString(getCurrentCycleEnd());
  } else if (cycle === 'next') {
    updated.phaseDeadline = toIsoString(getNextCycleEnd());
  } else if (cycle === null) {
    // Remove deadline se é apenas fase
    delete updated.phaseDeadline;
  }

  return updated;
}

/**
 * Filtra tarefas por ciclo de fase
 */
export function filterTodosByCycle(
  todos: SavedTodo[],
  cycle: PhaseCycleType | 'all'
): SavedTodo[] {
  if (cycle === 'all') return todos;

  return todos.filter((todo) => {
    if (cycle === null) {
      return isPhaseOnlyNoDeadline(todo);
    } else if (cycle === 'current') {
      return isInCurrentCycle(todo);
    } else if (cycle === 'next') {
      return isInNextCycle(todo);
    }
    return false;
  });
}

/**
 * Agrupa tarefas por ciclo de fase
 */
export function groupTodosByCycle(todos: SavedTodo[]): Record<string, SavedTodo[]> {
  return {
    current: todos.filter((t) => isInCurrentCycle(t)),
    next: todos.filter((t) => isInNextCycle(t)),
    noDeadline: todos.filter((t) => isPhaseOnlyNoDeadline(t)),
    noPhase: todos.filter((t) => !t.phase),
  };
}
