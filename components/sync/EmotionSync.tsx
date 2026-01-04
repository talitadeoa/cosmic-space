'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePeriodicalSync } from '@/hooks/usePeriodicalSync';

/**
 * Componente que sincroniza emoções entre dispositivos
 * Usa o servidor para armazenar emoções atuais
 * 
 * Uso em app/layout.tsx:
 * <EmotionSync />
 */
export function EmotionSync() {
  const { isAuthenticated, loading } = useAuth();
  const [lastSyncedEmotion, setLastSyncedEmotion] = useState<string>('');

  // Sincronizar emoção atual quando muda no localStorage
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const handleStorageChange = async () => {
      const currentEmotion = localStorage.getItem('current_emotion');
      
      if (currentEmotion && currentEmotion !== lastSyncedEmotion) {
        try {
          await fetch('/api/emotion-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              emotion: currentEmotion,
              timestamp: new Date().toISOString(),
            }),
          });
          setLastSyncedEmotion(currentEmotion);
        } catch (error) {
          console.debug('Falha ao sincronizar emoção:', error);
        }
      }
    };

    // Verificar mudanças a cada 2 segundos
    const intervalId = setInterval(handleStorageChange, 2000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, loading, lastSyncedEmotion]);

  return null; // Componente sem UI
}

export default EmotionSync;
