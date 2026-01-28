'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLunarPhaseUSNO } from '@/hooks/useLunarPhaseUSNO';
import { useCycle } from '@/hooks/useCycle';

// ═══════════════════════════════════════════════════════════════════
// 🌸 CYCLE JOURNEY - Uma experiência de autocuidado, não um formulário
// ═══════════════════════════════════════════════════════════════════

type JourneyStep = 'welcome' | 'when' | 'rhythm' | 'body' | 'heart' | 'complete';

interface CycleJourneyProps {
  onComplete?: () => void;
  onClose?: () => void;
}

// Frases que acolhem em cada momento
const WELCOMING_WORDS = {
  welcome: [
    "Seu corpo tem sua própria sabedoria 🌙",
    "Cada ciclo é único, como você",
    "Vamos honrar seu ritmo juntas",
    "Este é um momento só seu 💜",
  ],
  rhythm: [
    "Seu fluxo conta uma história",
    "Não existe certo ou errado",
    "Apenas observe, sem julgamento",
  ],
  body: [
    "Seu corpo está falando com você",
    "O que ele precisa agora?",
    "Escute com carinho",
  ],
  complete: [
    "Você cuidou de você hoje ✨",
    "Registrado com amor",
    "Sua jornada continua",
  ],
};

// Ritmo do fluxo - metáfora de ondas/marés
const RHYTHM_OPTIONS = [
  { 
    value: 'light', 
    label: 'Suave', 
    emoji: '🌊',
    description: 'Como uma brisa leve',
    gradient: 'from-sky-400/30 to-indigo-400/30',
    ring: 'ring-sky-300/50',
  },
  { 
    value: 'moderate', 
    label: 'Fluindo', 
    emoji: '🌊🌊',
    description: 'Ritmo natural',
    gradient: 'from-rose-400/30 to-pink-400/30',
    ring: 'ring-rose-300/50',
  },
  { 
    value: 'heavy', 
    label: 'Intenso', 
    emoji: '🌊🌊🌊',
    description: 'Corpo pedindo descanso',
    gradient: 'from-purple-400/30 to-fuchsia-400/30',
    ring: 'ring-purple-300/50',
  },
];

// Sinais do corpo - não "sintomas", mas comunicação
const BODY_SIGNALS = [
  { id: 'rest', label: 'Preciso descansar', emoji: '🛋️' },
  { id: 'warmth', label: 'Quero aconchego', emoji: '☕' },
  { id: 'sensitive', label: 'Estou sensível', emoji: '🌸' },
  { id: 'slow', label: 'Dia mais lento', emoji: '🐢' },
  { id: 'cramps', label: 'Cólicas', emoji: '🫂' },
  { id: 'headache', label: 'Dor de cabeça', emoji: '💆' },
  { id: 'bloating', label: 'Corpo inchado', emoji: '🫧' },
  { id: 'emotional', label: 'Emoções intensas', emoji: '🎭' },
  { id: 'energy', label: 'Com energia!', emoji: '✨' },
  { id: 'creative', label: 'Criativa', emoji: '🎨' },
];

// Animações suaves
const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

const pulse = {
  animate: {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function CycleJourney({ onComplete, onClose }: CycleJourneyProps) {
  const { addCycle, isSyncing } = useCycle();
  
  // Estado da jornada
  const [step, setStep] = useState<JourneyStep>('welcome');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rhythm, setRhythm] = useState<'light' | 'moderate' | 'heavy' | null>(null);
  const [bodySignals, setBodySignals] = useState<string[]>([]);
  const [heartNote, setHeartNote] = useState('');
  const dateObj = new Date(selectedDate + 'T12:00:00');
  // Novo cache com deduplica automática
  const { phase: lunarData, loading: lunarLoading } = useLunarPhaseUSNO(dateObj);
  const [moonData, setMoonData] = useState<{ faseLua: string; signo: string } | null>(null);
  const [welcomePhrase, setWelcomePhrase] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Frase aleatória de boas-vindas
  useEffect(() => {
    const phrases = WELCOMING_WORDS.welcome;
    setWelcomePhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  // Dados lunares
  useEffect(() => {
    if (lunarData) {
      setMoonData({
        faseLua: lunarData.phase || 'N/A',
        signo: 'N/A', // USNO não fornece zodiac_sign
      });
    }
  }, [lunarData]);

  const toggleSignal = useCallback((signalId: string) => {
    setBodySignals(prev => 
      prev.includes(signalId) 
        ? prev.filter(s => s !== signalId) 
        : [...prev, signalId]
    );
  }, []);

  const handleSave = async () => {
    if (!rhythm || isSaving) return;
    
    setIsSaving(true);
    
    const success = await addCycle({
      date: selectedDate,
      flowIntensity: rhythm,
      symptoms: bodySignals,
      notes: heartNote || undefined,
      moonPhase: moonData?.faseLua,
    });

    if (success) {
      setStep('complete');
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    }
    
    setIsSaving(false);
  };

  const goNext = () => {
    const steps: JourneyStep[] = ['welcome', 'when', 'rhythm', 'body', 'heart'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const steps: JourneyStep[] = ['welcome', 'when', 'rhythm', 'body', 'heart'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // Indicador de progresso visual (ondas)
  const ProgressWaves = () => {
    const steps: JourneyStep[] = ['welcome', 'when', 'rhythm', 'body', 'heart'];
    const currentIndex = steps.indexOf(step);
    
    return (
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= currentIndex 
                ? 'w-8 bg-gradient-to-r from-rose-400 to-pink-400' 
                : 'w-3 bg-white/20'
            }`}
            animate={i === currentIndex ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900/95 via-purple-950/90 to-slate-900/95 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        {/* Botão fechar */}
        {step !== 'complete' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
          >
            ✕
          </button>
        )}

        <div className="relative p-6 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* ═══════ STEP: Welcome ═══════ */}
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                {...fadeSlide}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div {...pulse} className="mb-6">
                  <span className="text-6xl">🌸</span>
                </motion.div>
                
                <h2 className="text-2xl font-light text-white mb-3">
                  Cuidar do seu ciclo
                </h2>
                
                <p className="text-rose-200/70 text-sm mb-8 max-w-xs">
                  {welcomePhrase}
                </p>

                {moonData && (
                  <div className="flex items-center gap-4 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <span className="text-sm text-purple-200/70">
                      🌙 {moonData.faseLua}
                    </span>
                    <span className="w-px h-4 bg-white/20" />
                    <span className="text-sm text-purple-200/70">
                      ♈ {moonData.signo}
                    </span>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goNext}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-shadow"
                >
                  Começar 💜
                </motion.button>
              </motion.div>
            )}

            {/* ═══════ STEP: When ═══════ */}
            {step === 'when' && (
              <motion.div key="when" {...fadeSlide} className="flex-1 flex flex-col">
                <ProgressWaves />
                
                <div className="text-center mb-8">
                  <span className="text-4xl mb-4 block">📅</span>
                  <h2 className="text-xl font-light text-white mb-2">
                    Quando seu fluxo chegou?
                  </h2>
                  <p className="text-rose-200/60 text-sm">
                    Pode ser hoje ou outro dia
                  </p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full max-w-xs px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white text-center text-lg focus:border-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
                  />
                  
                  <button
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="mt-3 text-sm text-rose-300/70 hover:text-rose-300 transition-colors"
                  >
                    Hoje ✨
                  </button>
                </div>

                <div className="flex gap-3 mt-auto pt-6">
                  <button
                    onClick={goBack}
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-all"
                  >
                    Voltar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goNext}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-lg shadow-rose-500/20"
                  >
                    Continuar
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP: Rhythm ═══════ */}
            {step === 'rhythm' && (
              <motion.div key="rhythm" {...fadeSlide} className="flex-1 flex flex-col">
                <ProgressWaves />
                
                <div className="text-center mb-6">
                  <span className="text-4xl mb-4 block">🌊</span>
                  <h2 className="text-xl font-light text-white mb-2">
                    Como está seu ritmo?
                  </h2>
                  <p className="text-rose-200/60 text-sm">
                    {WELCOMING_WORDS.rhythm[Math.floor(Math.random() * WELCOMING_WORDS.rhythm.length)]}
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-3">
                  {RHYTHM_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRhythm(option.value as 'light' | 'moderate' | 'heavy')}
                      className={`
                        relative p-4 rounded-2xl transition-all duration-300
                        ${rhythm === option.value 
                          ? `bg-gradient-to-r ${option.gradient} border-2 border-white/30 ring-4 ${option.ring}` 
                          : 'bg-white/5 border border-white/10 hover:border-white/20'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{option.emoji}</span>
                        <div className="text-left">
                          <p className={`font-medium ${rhythm === option.value ? 'text-white' : 'text-white/80'}`}>
                            {option.label}
                          </p>
                          <p className={`text-xs ${rhythm === option.value ? 'text-white/70' : 'text-white/50'}`}>
                            {option.description}
                          </p>
                        </div>
                        {rhythm === option.value && (
                          <motion.span 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className="ml-auto text-lg"
                          >
                            ✓
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3 mt-auto pt-6">
                  <button
                    onClick={goBack}
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-all"
                  >
                    Voltar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goNext}
                    disabled={!rhythm}
                    className={`flex-1 py-3 rounded-2xl font-medium shadow-lg transition-all ${
                      rhythm 
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/20' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Continuar
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP: Body Signals ═══════ */}
            {step === 'body' && (
              <motion.div key="body" {...fadeSlide} className="flex-1 flex flex-col">
                <ProgressWaves />
                
                <div className="text-center mb-6">
                  <span className="text-4xl mb-4 block">💫</span>
                  <h2 className="text-xl font-light text-white mb-2">
                    O que seu corpo está dizendo?
                  </h2>
                  <p className="text-rose-200/60 text-sm">
                    Escolha quantos quiser, ou nenhum
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {BODY_SIGNALS.map((signal) => {
                      const isSelected = bodySignals.includes(signal.id);
                      return (
                        <motion.button
                          key={signal.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSignal(signal.id)}
                          className={`
                            px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                            ${isSelected 
                              ? 'bg-gradient-to-r from-rose-500/40 to-pink-500/40 border border-rose-300/50 text-white shadow-lg shadow-rose-500/20' 
                              : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/20'
                            }
                          `}
                        >
                          <span className="mr-1.5">{signal.emoji}</span>
                          {signal.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-6">
                  <button
                    onClick={goBack}
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-all"
                  >
                    Voltar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goNext}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-lg shadow-rose-500/20"
                  >
                    Continuar
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP: Heart Note ═══════ */}
            {step === 'heart' && (
              <motion.div key="heart" {...fadeSlide} className="flex-1 flex flex-col">
                <ProgressWaves />
                
                <div className="text-center mb-6">
                  <span className="text-4xl mb-4 block">💜</span>
                  <h2 className="text-xl font-light text-white mb-2">
                    Algo que quer lembrar?
                  </h2>
                  <p className="text-rose-200/60 text-sm">
                    Um pensamento, um cuidado, qualquer coisa
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <textarea
                    value={heartNote}
                    onChange={(e) => setHeartNote(e.target.value)}
                    placeholder="Escreva se quiser... ou deixe em branco 🌙"
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400/20 resize-none transition-all"
                  />

                  {/* Resumo do que foi registrado */}
                  <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-2">Seu registro:</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-white/70">📅 {new Date(selectedDate).toLocaleDateString('pt-BR')}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-white/70">
                        {RHYTHM_OPTIONS.find(r => r.value === rhythm)?.emoji} {RHYTHM_OPTIONS.find(r => r.value === rhythm)?.label}
                      </span>
                      {bodySignals.length > 0 && (
                        <>
                          <span className="text-white/30">•</span>
                          <span className="text-white/70">{bodySignals.length} sinais</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-6">
                  <button
                    onClick={goBack}
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-all"
                  >
                    Voltar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex-1 py-3 rounded-2xl font-medium shadow-lg transition-all ${
                      isSaving 
                        ? 'bg-white/20 text-white/50 cursor-wait' 
                        : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/20'
                    }`}
                  >
                    {isSaving ? '✨ Salvando...' : 'Registrar com carinho 💜'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP: Complete ═══════ */}
            {step === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="mb-6"
                >
                  <span className="text-7xl">🌸</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-light text-white mb-3"
                >
                  Cuidado registrado
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-rose-200/70 text-sm mb-6"
                >
                  {WELCOMING_WORDS.complete[Math.floor(Math.random() * WELCOMING_WORDS.complete.length)]}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm"
                >
                  <span>✓</span>
                  <span>Sincronizado com a lua</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
