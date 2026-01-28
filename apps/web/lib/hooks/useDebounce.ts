/**
 * 🔧 useDebounce - Hook de Debounce
 * 
 * Adia atualizações de valor por um delay especificado.
 * Útil para otimizar buscas e inputs.
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * 
 * @param value - Valor a ser debouncado
 * @param delay - Delay em ms (padrão: 500ms)
 * 
 * @example
 * ```ts
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
