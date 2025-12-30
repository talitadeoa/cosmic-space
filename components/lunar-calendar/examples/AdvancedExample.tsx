/**
 * Exemplo Avançado: Integração com Database e Estados Complexos
 *
 * Este arquivo mostra como usar o LunarCalendarWidget com:
 * - API real de dados lunares
 * - Estados compartilhados (eventos, anotações)
 * - Sincronização com banco de dados
 * - Feedback visual de carregamento
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  LunarCalendarWidget,
  MoonPhase,
  LunarDataByDate,
  formatDateKey,
} from '@/components/lunar-calendar';

interface UserNote {
  date: string; // "YYYY-MM-DD"
  content: string;
  color?: 'blue' | 'purple' | 'pink' | 'green';
}

interface AdvancedCalendarState {
  selectedDate: Date;
  month: number;
  year: number;
  lunarData: LunarDataByDate;
  userNotes: Map<string, UserNote>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Exemplo: Componente com integração real
 *
 * Uso:
 * ```tsx
 * export default function AdvancedCalendar() {
 *   return <AdvancedLunarCalendar />;
 * }
 * ```
 */
export function AdvancedLunarCalendar() {
  const today = new Date();
  const [state, setState] = useState<AdvancedCalendarState>({
    selectedDate: today,
    month: today.getMonth(),
    year: today.getFullYear(),
    lunarData: {},
    userNotes: new Map(),
    isLoading: false,
    error: null,
  });

  // Busca dados lunares da API
  const fetchLunarData = useCallback(async (month: number, year: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Endpoint esperado: GET /api/lunar-data?month=12&year=2025
      const response = await fetch(`/api/lunar-data?month=${month}&year=${year}`);

      if (!response.ok) {
        throw new Error('Falha ao buscar dados lunares');
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        lunarData: data.byDate || {},
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false,
      }));
    }
  }, []);

  // Busca anotações do usuário para o mês
  const fetchUserNotes = useCallback(async (month: number, year: number) => {
    try {
      const response = await fetch(`/api/user-notes?month=${month}&year=${year}`);

      if (!response.ok) return;

      const notes = await response.json();
      setState((prev) => ({
        ...prev,
        userNotes: new Map(notes.map((note: UserNote) => [note.date, note])),
      }));
    } catch (error) {
      console.error('Erro ao buscar anotações:', error);
    }
  }, []);

  // Carrega dados ao montar e quando mês mudar
  useEffect(() => {
    fetchLunarData(state.month, state.year);
    fetchUserNotes(state.month, state.year);
  }, [state.month, state.year, fetchLunarData, fetchUserNotes]);

  const handleSelectDate = useCallback((date: Date) => {
    setState((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const handleMonthChange = useCallback((month: number, year: number) => {
    setState((prev) => ({ ...prev, month, year }));
  }, []);

  const handleSaveNote = useCallback(
    async (content: string, color?: string) => {
      const dateKey = formatDateKey(state.selectedDate);

      try {
        // POST para salvar anotação
        const response = await fetch('/api/user-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateKey,
            content,
            color: color || 'blue',
          }),
        });

        if (!response.ok) throw new Error('Erro ao salvar');

        const newNote = await response.json();
        setState((prev) => ({
          ...prev,
          userNotes: new Map(prev.userNotes).set(dateKey, newNote),
        }));
      } catch (error) {
        console.error('Erro ao salvar nota:', error);
      }
    },
    [state.selectedDate]
  );

  const selectedNote = state.userNotes.get(formatDateKey(state.selectedDate));

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', padding: '2rem' }}
    >
      {/* Calendário */}
      <div>
        {state.isLoading && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            Carregando dados lunares...
          </div>
        )}

        {state.error && (
          <div
            style={{
              color: '#ff6b6b',
              padding: '1rem',
              background: 'rgba(255,107,107,0.1)',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            ⚠️ {state.error}
          </div>
        )}

        <LunarCalendarWidget
          month={state.month}
          year={state.year}
          selectedDate={state.selectedDate}
          onSelectDate={handleSelectDate}
          lunarDataByDate={state.lunarData}
          onMonthChange={handleMonthChange}
          locale="pt-BR"
        />
      </div>

      {/* Painel lateral: Anotações */}
      <aside
        style={{
          background: 'rgba(20, 30, 45, 0.4)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)',
          color: '#e8e8ff',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 400 }}>Anotações</h3>

        {selectedNote ? (
          <div
            style={{
              background: `rgba(${getColorRGB(selectedNote.color)}, 0.1)`,
              border: `1px solid rgba(${getColorRGB(selectedNote.color)}, 0.3)`,
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
              {selectedNote.content}
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
            Sem anotações para este dia
          </p>
        )}

        <textarea
          placeholder="Adicione uma nota para este dia..."
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'rgba(100, 116, 139, 0.1)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '0.5rem',
            color: '#e8e8ff',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            resize: 'vertical',
          }}
          defaultValue={selectedNote?.content || ''}
        />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['blue', 'purple', 'pink', 'green'] as const).map((color) => (
            <button
              key={color}
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea.value) {
                  handleSaveNote(textarea.value, color);
                }
              }}
              style={{
                padding: '0.5rem 0.75rem',
                background: `rgba(${getColorRGB(color)}, 0.2)`,
                border: `1px solid rgba(${getColorRGB(color)}, 0.4)`,
                borderRadius: '0.375rem',
                color: `rgb(${getColorRGB(color)})`,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              {color}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
            if (textarea.value) {
              handleSaveNote(textarea.value);
              textarea.value = '';
            }
          }}
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(100, 116, 139, 0.2)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '0.5rem',
            color: '#e8e8ff',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Salvar Anotação
        </button>
      </aside>
    </div>
  );
}

/**
 * Helper: Converte cor para RGB
 */
function getColorRGB(color?: string): string {
  const colors: Record<string, string> = {
    blue: '100, 149, 237', // cornflowerblue
    purple: '186, 85, 211', // mediumorchid
    pink: '255, 105, 180', // hotpink
    green: '72, 209, 204', // mediumturquoise
  };
  return colors[color || 'blue'];
}

export default AdvancedLunarCalendar;
