/**
 * 🪝 Hooks de Persistência - Integração com React
 * 
 * Hooks reativos que usam PersistenceHub por baixo.
 * Eliminam duplicação de try/catch e SSR checks.
 * Mantêm compatibilidade com useState.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { persistenceHub, type PersistenceDomain, type StorageObserver } from './PersistenceHub';

/**
 * Hook para sincronizar estado com persistência
 * 
 * ```tsx
 * const [emotion, setEmotion] = usePersistent<Emotion>(
 *   'emotional',
 *   'current',
 *   null
 * );
 * ```
 */
export function usePersistent<T>(
  domain: PersistenceDomain,
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => persistenceHub.load(domain, key, defaultValue));

  // Configura observador para sincronizar entre abas
  useEffect(() => {
    const unsubscribe = persistenceHub.observe(domain, key, (event) => {
      if (event.type === 'set' && event.value !== undefined) {
        setValue(event.value);
      } else if (event.type === 'remove') {
        setValue(defaultValue);
      }
    });

    return unsubscribe ?? undefined;
  }, [domain, key, defaultValue]);

  const setPersistentValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const nextValue = newValue instanceof Function ? newValue(prev) : newValue;
        // Salva na persistência
        persistenceHub.save(domain, key, nextValue);
        return nextValue;
      });
    },
    [domain, key]
  );

  return [value, setPersistentValue];
}

/**
 * Hook para carregar valor de forma assíncrona
 * Útil para dados grandes que vêm do Capacitor
 * 
 * ```tsx
 * const [data, setData] = useAsyncPersistent('emotional', 'history', []);
 * ```
 */
export function useAsyncPersistent<T>(
  domain: PersistenceDomain,
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, boolean, Error | null] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitialized = useRef(false);

  // Carrega valor ao montar
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const loadValue = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loaded = await persistenceHub.loadAsync(domain, key, defaultValue);
        setValue(loaded);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`[useAsyncPersistent] Erro ao carregar ${domain}/${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [domain, key, defaultValue]);

  const setPersistentValue = useCallback(
    async (newValue: T) => {
      try {
        setError(null);
        await persistenceHub.saveAsync(domain, key, newValue);
        setValue(newValue);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`[useAsyncPersistent] Erro ao salvar ${domain}/${key}:`, error);
        throw error;
      }
    },
    [domain, key]
  );

  return [value, setPersistentValue, isLoading, error];
}

/**
 * Hook para observar mudanças em uma chave sem gerenciar estado
 * Útil para side effects
 * 
 * ```tsx
 * useObservePersistent('emotional', 'current', (event) => {
 *   console.log('Emoção mudou:', event.value);
 * });
 * ```
 */
export function useObservePersistent(
  domain: PersistenceDomain,
  key: string,
  callback: StorageObserver
): void {
  useEffect(() => {
    const unsubscribe = persistenceHub.observe(domain, key, callback);
    return unsubscribe ?? undefined;
  }, [domain, key, callback]);
}

/**
 * Hook para limpar dados de um domínio
 * Retorna função para ativar limpeza
 */
export function useClearPersistence(
  domain: PersistenceDomain
): { clear: () => void; keys: string[] } {
  const [keys, setKeys] = useState<string[]>(() => persistenceHub.keys(domain));

  const clear = useCallback(() => {
    persistenceHub.clear(domain);
    setKeys([]);
  }, [domain]);

  return { clear, keys };
}

/**
 * Hook para listar chaves de um domínio
 */
export function usePersistenceKeys(domain: PersistenceDomain): string[] {
  const [keys, setKeys] = useState<string[]>(() => persistenceHub.keys(domain));

  useEffect(() => {
    const unsubscribe = persistenceHub.observe(domain, '', (event) => {
      setKeys(persistenceHub.keys(domain));
    });

    return unsubscribe ?? undefined;
  }, [domain]);

  return keys;
}
