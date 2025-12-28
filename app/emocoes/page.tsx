'use client';

import React from 'react';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import EmotionalInput, { Emotion } from '@/components/EmotionalInput';
import { useEmotionalInput } from '@/hooks/useEmotionalInput';
import { useState } from 'react';

export default function EmotionalCheckInPage() {
  const { currentEmotion, emotionHistory, setEmotion, getMostFrequentEmotion } =
    useEmotionalInput('daily_emotion_checkin');
  const [showStats, setShowStats] = useState(true);

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
          {showStats && emotionHistory.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Emotion */}
              {currentEmotion && (
                <div className="rounded-3xl border border-indigo-800/30 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 mb-3">
                    🎯 Emoção Atual
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">{currentEmotion.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{currentEmotion.label}</h3>
                      <p className="text-indigo-300/70">{currentEmotion.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Most Frequent */}
              {mostFrequent && (
                <div className="rounded-3xl border border-purple-800/30 bg-gradient-to-br from-purple-950/20 to-pink-950/20 backdrop-blur-sm p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3">
                    📊 Emoção Mais Frequente
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">{mostFrequent.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{mostFrequent.label}</h3>
                      <p className="text-purple-300/70">{mostFrequent.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-3xl border border-slate-800/30 bg-gradient-to-br from-slate-950/20 to-slate-900/20 backdrop-blur-sm p-8">
            <h2 className="text-xl font-semibold text-white mb-4">💾 Seus Dados Estão Salvos</h2>
            <div className="space-y-3 text-slate-300">
              <p>✅ Suas emoções são salvas automaticamente no navegador</p>
              <p>✅ Histórico de até 100 registros é mantido</p>
              <p>✅ Você pode acompanhar padrões emocionais ao longo do tempo</p>
              <p className="text-sm text-slate-400 mt-4">
                📁 Armazenado em: <code className="text-indigo-300">localStorage['daily_emotion_checkin']</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SpacePageLayout>
  );
}
