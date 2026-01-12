'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface EmotionData {
  id: string;
  emoji: string;
  label: string;
  color?: string;
  description?: string;
}

/**
 * Componente que sincroniza emoções entre dispositivos
 * - Carrega emoção do servidor ao autenticar
 * - Sincroniza mudanças locais para o servidor
 * - Usa polling para manter em sincronia
 * 
 * Uso em app/layout.tsx:
 * <EmotionSync />
 */
export function EmotionSync() {
  const { isAuthenticated, loading } = useAuth();
  const [lastSyncedEmotion, setLastSyncedEmotion] = useState<string>('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar emoção do servidor ao autenticar
  const loadFromServer = useCallback(async () => {
    if (!isAuthenticated || loading) return;

    try {
      const response = await fetch('/api/emotion-sync', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status !== 401) {
          console.debug('Falha ao carregar emoção do servidor');
        }
        return;
      }

      const data = await response.json();
      
      if (data.current) {
        const serverEmotion: EmotionData = {
          id: data.current.id,
          emoji: data.current.emoji,
          label: data.current.label,
          color: data.current.color,
          description: data.current.description,
        };

        // Comparar com local e decidir qual manter
        const localEmotion = localStorage.getItem('current_emotion');
        const localUpdate = localStorage.getItem('current_emotion_last_update');
        const serverUpdate = new Date(data.current.updatedAt).getTime();

        const shouldUseServer = !localEmotion || 
          !localUpdate || 
          serverUpdate > Number(localUpdate);

        if (shouldUseServer) {
          localStorage.setItem('current_emotion', JSON.stringify(serverEmotion));
          localStorage.setItem('current_emotion_last_update', serverUpdate.toString());
          setLastSyncedEmotion(JSON.stringify(serverEmotion));
          
          // Disparar evento para atualizar componentes
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'current_emotion',
            newValue: JSON.stringify(serverEmotion),
          }));
        }
      }
    } catch (error) {
      console.debug('Erro ao carregar emoção do servidor:', error);
    }
  }, [isAuthenticated, loading]);

  // Carregar do servidor ao autenticar
  useEffect(() => {
    if (isAuthenticated && !loading && !initialLoadDone) {
      loadFromServer();
      setInitialLoadDone(true);
    }
  }, [isAuthenticated, loading, initialLoadDone, loadFromServer]);

  // Reset ao deslogar
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      setInitialLoadDone(false);
      setLastSyncedEmotion('');
    }
  }, [isAuthenticated, loading]);

  // Sincronizar mudanças locais para o servidor
  useEffect(() => {
    if (!isAuthenticated || loading) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    const syncToServer = async () => {
      const currentEmotion = localStorage.getItem('current_emotion');
      
      if (currentEmotion && currentEmotion !== lastSyncedEmotion) {
        try {
          const response = await fetch('/api/emotion-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              emotion: currentEmotion,
              timestamp: new Date().toISOString(),
            }),
          });

          if (response.ok) {
            setLastSyncedEmotion(currentEmotion);
          }
        } catch (error) {
          console.debug('Falha ao sincronizar emoção:', error);
        }
      }
    };

    // Verificar mudanças a cada 3 segundos
    syncIntervalRef.current = setInterval(syncToServer, 3000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, loading, lastSyncedEmotion]);

  return null; // Componente sem UI
}

export default EmotionSync;
