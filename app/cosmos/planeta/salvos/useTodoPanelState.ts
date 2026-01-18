/**
 * 🎮 useTodoPanelState - Reducer para estado do painel de todos
 * 
 * Centraliza o estado complexo do SavedTodosPanel em um useReducer,
 * eliminando os 14+ useState separados.
 */

import { useReducer, useCallback } from 'react';
import type { 
  TodoPanelState, 
  TodoPanelAction, 
} from './types';
import type { MoonPhase, IslandId } from '@/app/cosmos/utils/todoStorage';

/**
 * Estado inicial
 */
const initialState: TodoPanelState = {
  isEditMode: false,
  editingTodoId: null,
  editingText: '',
  editingCategory: '',
  editingDueDate: '',
  isSelectionMode: false,
  selectedTodoIds: [],
  batchIsland: '',
  swipeDeleteId: null,
  currentPage: 0,
  activeViewDrop: null,
  expandedPhases: {
    luaNova: true,
    luaCrescente: true,
    luaCheia: true,
    luaMinguante: true,
    'sem-fase': true,
  },
  groupByPhase: false,
};

/**
 * Reducer
 */
function todoPanelReducer(state: TodoPanelState, action: TodoPanelAction): TodoPanelState {
  switch (action.type) {
    case 'SET_EDIT_MODE':
      return { 
        ...state, 
        isEditMode: action.payload,
        // Limpar edição ao sair do modo
        ...(action.payload ? {} : { editingTodoId: null, editingText: '', editingCategory: '', editingDueDate: '' }),
      };

    case 'START_EDITING':
      return {
        ...state,
        editingTodoId: action.payload.todoId,
        editingText: action.payload.text,
        editingCategory: action.payload.category || '',
        editingDueDate: action.payload.dueDate || '',
      };

    case 'UPDATE_EDITING':
      return {
        ...state,
        ...(action.payload.text !== undefined && { editingText: action.payload.text }),
        ...(action.payload.category !== undefined && { editingCategory: action.payload.category }),
        ...(action.payload.dueDate !== undefined && { editingDueDate: action.payload.dueDate }),
      };

    case 'CANCEL_EDITING':
      return {
        ...state,
        editingTodoId: null,
        editingText: '',
        editingCategory: '',
        editingDueDate: '',
      };

    case 'SET_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: action.payload,
        // Limpar seleção ao desativar modo
        ...(action.payload ? {} : { selectedTodoIds: [], batchIsland: '' }),
      };

    case 'TOGGLE_SELECT': {
      const id = action.payload;
      const isSelected = state.selectedTodoIds.includes(id);
      return {
        ...state,
        selectedTodoIds: isSelected
          ? state.selectedTodoIds.filter(i => i !== id)
          : [...state.selectedTodoIds, id],
      };
    }

    case 'SELECT_ALL':
      return {
        ...state,
        selectedTodoIds: action.payload,
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedTodoIds: [],
        batchIsland: '',
        isSelectionMode: false,
      };

    case 'SET_BATCH_ISLAND':
      return {
        ...state,
        batchIsland: action.payload,
      };

    case 'SET_SWIPE_DELETE':
      return {
        ...state,
        swipeDeleteId: action.payload,
      };

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };

    case 'SET_VIEW_DROP':
      return {
        ...state,
        activeViewDrop: action.payload,
      };

    case 'TOGGLE_PHASE_EXPANDED': {
      const phase = action.payload;
      return {
        ...state,
        expandedPhases: {
          ...state.expandedPhases,
          [phase]: !state.expandedPhases[phase],
        },
      };
    }

    case 'SET_GROUP_BY_PHASE':
      return {
        ...state,
        groupByPhase: action.payload,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * Hook que encapsula o reducer com helpers tipados
 */
export function useTodoPanelState() {
  const [state, dispatch] = useReducer(todoPanelReducer, initialState);

  // Helpers para ações comuns
  const startEditing = useCallback((todoId: string, text: string, category?: string, dueDate?: string) => {
    dispatch({ type: 'START_EDITING', payload: { todoId, text, category, dueDate } });
  }, []);

  const cancelEditing = useCallback(() => {
    dispatch({ type: 'CANCEL_EDITING' });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_SELECT', payload: id });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_ALL', payload: ids });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setSelectionMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_SELECTION_MODE', payload: enabled });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setBatchIsland = useCallback((island: IslandId | '') => {
    dispatch({ type: 'SET_BATCH_ISLAND', payload: island });
  }, []);

  const togglePhaseExpanded = useCallback((phase: MoonPhase | 'sem-fase') => {
    dispatch({ type: 'TOGGLE_PHASE_EXPANDED', payload: phase });
  }, []);

  const setGroupByPhase = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_GROUP_BY_PHASE', payload: enabled });
  }, []);

  return {
    state,
    dispatch,
    // Helpers
    startEditing,
    cancelEditing,
    toggleSelect,
    selectAll,
    clearSelection,
    setSelectionMode,
    setPage,
    setBatchIsland,
    togglePhaseExpanded,
    setGroupByPhase,
  };
}

export { initialState };
