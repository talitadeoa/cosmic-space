/**
 * 📍 Rota: /emocoes/registro
 *
 * Check-in emocional.
 * Migração: /perfil/emocoes → /emocoes/registro
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

'use client';

import React, { useState } from 'react';
import { SpacePageLayout } from '@/components/layouts';
import EmotionalInput, { Emotion } from '@/components/EmotionalInput';
import { useEmotionalInput } from '@/hooks/useEmotionalInput';

export default function RegistroEmocionalPage() {
  const { currentEmotion, emotionHistory, setEmotion, getMostFrequentEmotion } =
    useEmotionalInput('daily_emotion_checkin');
  const [_showStats] = useState(true);

  const handleEmotionSelect = (emotion: Emotion) => {
    setEmotion(emotion);
  };

  const mostFrequent = getMostFrequentEmotion();

  return (
    <SpacePageLayout allowBackNavigation>
      <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">Check-in Emocional</p>
            <h1 className="text-4xl font-bold text-white">
              Como você está se sentindo{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                agora?
              </span>
            </h1>
            <p className="text-slate-400 mt-3 text-lg">
              Registre sua emoção atual e acompanhe seu estado emocional ao longo do tempo
            </p>
          </div>

          {/* Input Component */}
          <div className="rounded-3xl border border-indigo-800/30 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 backdrop-blur-sm p-8 shadow-2xl shadow-indigo-950/30">
            <EmotionalInput
              onEmotionSelect={handleEmotionSelect}
              selectedEmotion={currentEmotion}
              size="lg"
              showLabels={false}
              storageKey="daily_emotion_checkin"
              showHistory={true}
            />
          </div>

          {/* Stats Section */}
          {_showStats && emotionHistory.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Suas Estatísticas</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">{emotionHistory.length}</p>
                  <p className="text-slate-400 text-sm">Registros totais</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">
                    {currentEmotion?.label || '–'}
                  </p>
                  <p className="text-slate-400 text-sm">Emoção atual</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-400">
                    {mostFrequent?.label || '–'}
                  </p>
                  <p className="text-slate-400 text-sm">Mais frequente</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SpacePageLayout>
  );
}
