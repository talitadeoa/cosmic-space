'use client';

import React from 'react';
import { GestureDetector } from '@/app/cosmos/components/GestureDetector';
import { useUniverseNavigation } from '@/app/cosmos/hooks/useUniverseNavigation';
import type { 
  TapGesture, 
  DoubleTapGesture, 
  LongPressGesture,
  SwipeGesture, 
  PinchGesture 
} from '@/types/gestures';

/**
 * EXEMPLO 1: Navegação Básica
 * Uso simples do hook para navegar entre telas
 */
export function ExemploNavegacaoBasica() {
  const { navigateTo, navigateWithFocus } = useUniverseNavigation();

  return (
    <div className="flex gap-4">
      {/* Navegação simples */}
      <button 
        onClick={() => navigateTo('home')}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Ir para Home
      </button>

      {/* Navegação com foco (para animações) */}
      <button 
        onClick={(e) =>
          navigateWithFocus('luaList', {
            event: e as React.MouseEvent<HTMLButtonElement> as any,
            type: 'lua',
            size: 'md',
          })
        }
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Ir para Lua List (com animação)
      </button>

      {/* Voltar */}
      <button 
        onClick={() => navigateTo('home', { replace: true })}
        className="px-4 py-2 bg-gray-500 text-white rounded"
      >
        Voltar
      </button>
    </div>
  );
}

/**
 * EXEMPLO 2: Detector de Gestos - Tap e Double Tap
 * Detecta toques simples e duplos
 */
export function ExemploTapGestos() {
  const [tapCount, setTapCount] = React.useState(0);
  const [lastGesture, setLastGesture] = React.useState<string>('');

  const handleTap = (gesture: TapGesture) => {
    setLastGesture(`Tap em (${gesture.x.toFixed(0)}, ${gesture.y.toFixed(0)})`);
  };

  const handleDoubleTap = (gesture: DoubleTapGesture) => {
    setLastGesture(`Double tap em (${gesture.x.toFixed(0)}, ${gesture.y.toFixed(0)})`);
    setTapCount((prev) => prev + 1);
  };

  return (
    <GestureDetector
      onTap={handleTap}
      onDoubleTap={handleDoubleTap}
      className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 cursor-pointer"
    >
      <div className="text-center text-white">
        <p className="text-lg font-semibold">Toque aqui</p>
        <p className="text-sm text-slate-400 mt-2">{lastGesture}</p>
        <p className="text-sm text-slate-400">Double taps: {tapCount}</p>
      </div>
    </GestureDetector>
  );
}

/**
 * EXEMPLO 3: Long Press
 * Toque mantido por 500ms
 */
export function ExemploLongPress() {
  const [longPresseDetectadas, setLongPresseDetectadas] = React.useState<number[]>([]);

  const handleLongPress = (gesture: LongPressGesture) => {
    setLongPresseDetectadas((prev) => [
      ...prev.slice(-4),
      Math.round(gesture.duration),
    ]);
  };

  return (
    <div className="space-y-4">
      <GestureDetector
        onLongPress={handleLongPress}
        longPressConfig={{
          duration: 500,
          threshold: 10,
        }}
        className="flex items-center justify-center w-full h-48 bg-gradient-to-br from-amber-900 to-amber-950 rounded-lg border border-amber-700 cursor-pointer"
      >
        <div className="text-center text-white">
          <p className="text-lg font-semibold">Toque e segure</p>
          <p className="text-sm text-amber-200 mt-2">Mínimo 500ms</p>
        </div>
      </GestureDetector>

      {longPresseDetectadas.length > 0 && (
        <div className="p-4 bg-slate-800 rounded border border-slate-700">
          <p className="text-sm text-slate-300">Long press detectados:</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {longPresseDetectadas.map((duration, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-amber-600 text-white text-xs rounded"
              >
                {duration}ms
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EXEMPLO 4: Swipe Detection
 * Detecta deslizamentos em 4 direções
 */
export function ExemploSwipe() {
  const [ultimoSwipe, setUltimoSwipe] = React.useState<SwipeGesture | null>(null);
  const [contador, setContador] = React.useState(0);

  const handleSwipe = (gesture: SwipeGesture) => {
    setUltimoSwipe(gesture);
    setContador((prev) => prev + 1);
  };

  const getEmoji = () => {
    switch (ultimoSwipe?.direction) {
      case 'left':
        return '←';
      case 'right':
        return '→';
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <GestureDetector
        onSwipe={handleSwipe}
        swipeConfig={{
          threshold: 50,
          velocity: 0.3,
        }}
        className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-lg border border-emerald-700"
      >
        <div className="text-center text-white">
          <p className="text-6xl mb-4">{getEmoji()}</p>
          <p className="text-lg font-semibold">Deslize em qualquer direção</p>
          <p className="text-sm text-emerald-200 mt-2">Total: {contador}</p>
          {ultimoSwipe && (
            <div className="mt-4 text-sm text-emerald-300">
              <p>Distância: {ultimoSwipe.distance.toFixed(0)}px</p>
              <p>Velocidade: {ultimoSwipe.velocity.toFixed(2)}px/ms</p>
            </div>
          )}
        </div>
      </GestureDetector>
    </div>
  );
}

/**
 * EXEMPLO 5: Pinch (Zoom)
 * Aproximação e afastamento com 2 dedos
 */
export function ExemploPinch() {
  const [scale, setScale] = React.useState(1);
  const [maxScale, setMaxScale] = React.useState(1);

  const handlePinch = (gesture: PinchGesture) => {
    const novaEscala = Math.max(0.5, Math.min(3, scale * gesture.scale));
    setScale(novaEscala);
    setMaxScale(Math.max(maxScale, novaEscala));
  };

  return (
    <GestureDetector
      onPinch={handlePinch}
      pinchConfig={{
        threshold: 20,
      }}
      className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-violet-900 to-violet-950 rounded-lg border border-violet-700 overflow-hidden"
    >
      <div
        className="flex items-center justify-center w-20 h-20 bg-violet-500 rounded-lg transition-transform duration-100"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <span className="text-2xl">📦</span>
      </div>

      <div className="absolute bottom-4 left-4 text-white text-sm">
        <p>Escala: {scale.toFixed(2)}x</p>
        <p>Máximo: {maxScale.toFixed(2)}x</p>
      </div>
    </GestureDetector>
  );
}

/**
 * EXEMPLO 6: Combinação de Gestos
 * Múltiplos gestos em um só container
 */
export function ExemploCombinacaoGestos() {
  const [eventos, setEventos] = React.useState<string[]>([]);

  const adicionarEvento = (tipo: string) => {
    setEventos((prev) => [
      `${new Date().toLocaleTimeString()}: ${tipo}`,
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div className="space-y-4">
      <GestureDetector
        onTap={() => adicionarEvento('Tap')}
        onDoubleTap={() => adicionarEvento('Double Tap')}
        onLongPress={() => adicionarEvento('Long Press')}
        onSwipe={(g) => adicionarEvento(`Swipe ${g.direction}`)}
        onPinch={() => adicionarEvento('Pinch')}
        className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-rose-900 to-rose-950 rounded-lg border border-rose-700"
      >
        <p className="text-white text-center">
          Experimente todos os gestos aqui
        </p>
      </GestureDetector>

      <div className="p-4 bg-slate-800 rounded border border-slate-700 max-h-64 overflow-y-auto">
        <p className="text-slate-300 text-sm font-semibold mb-2">Log de Eventos:</p>
        <div className="space-y-1">
          {eventos.map((evento, idx) => (
            <p key={idx} className="text-xs text-slate-400 font-mono">
              {evento}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * EXEMPLO 7: Integração com Navegação
 * Usando gestos para navegar
 */
export function ExemploGestosNavegacao() {
  const { navigateTo } = useUniverseNavigation();

  const handleSwipe = (gesture: SwipeGesture) => {
    switch (gesture.direction) {
      case 'right':
        navigateTo('home', { replace: true });
        break;
      case 'left':
        navigateTo('luaList', { replace: true });
        break;
      case 'up':
        console.log('Scroll para cima');
        break;
      case 'down':
        console.log('Scroll para baixo');
        break;
    }
  };

  return (
    <GestureDetector
      onSwipe={handleSwipe}
      className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-lg border border-indigo-700"
    >
      <div className="text-center text-white">
        <p className="text-lg font-semibold mb-4">Navegação por Gestos</p>
        <div className="text-sm text-indigo-200 space-y-1">
          <p>← Deslize para esquerda: Lua List</p>
          <p>→ Deslize para direita: Home</p>
          <p>↑ Deslize para cima: Scroll</p>
          <p>↓ Deslize para baixo: Scroll</p>
        </div>
      </div>
    </GestureDetector>
  );
}

/**
 * EXEMPLO 8: Debug Mode
 * Mostra logs detalhados de gestos
 */
export function ExemploDebugMode() {
  const [logs, setLogs] = React.useState<string[]>([]);

  // Para o debug, você deveria adicionar um callback que capture os logs
  // Por enquanto, isso é um exemplo de como usar debug={true}

  return (
    <div className="space-y-4">
      <GestureDetector
        onTap={() => setLogs((p) => ['[TAP]', ...p.slice(0, 9)])}
        onSwipe={(g) => setLogs((p) => [`[SWIPE] ${g.direction}`, ...p.slice(0, 9)])}
        onPinch={() => setLogs((p) => ['[PINCH]', ...p.slice(0, 9)])}
        debug={true}
        className="flex items-center justify-center w-full h-48 bg-gray-900 rounded-lg border border-gray-700"
      >
        <p className="text-white">Abra o console para ver logs (F12)</p>
      </GestureDetector>

      <div className="p-4 bg-gray-900 rounded border border-gray-700 font-mono text-xs">
        <p className="text-gray-400 mb-2">Logs locais:</p>
        {logs.map((log, idx) => (
          <p key={idx} className="text-green-400">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente Demo que mostra todos os exemplos
 */
export function DemoModuloGestos() {
  const [tabAtiva, setTabAtiva] = React.useState<
    'basico' | 'tap' | 'long' | 'swipe' | 'pinch' | 'combo' | 'nav' | 'debug'
  >('basico');

  const tabs = [
    { id: 'basico', label: 'Navegação Básica' },
    { id: 'tap', label: 'Tap & Double Tap' },
    { id: 'long', label: 'Long Press' },
    { id: 'swipe', label: 'Swipe' },
    { id: 'pinch', label: 'Pinch/Zoom' },
    { id: 'combo', label: 'Combinação' },
    { id: 'nav', label: 'Navegação' },
    { id: 'debug', label: 'Debug' },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-lg border border-slate-700">
      <h1 className="text-2xl font-bold text-white mb-6">
        Demo: Módulo de Navegação/Gestos
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabAtiva(tab.id as any)}
            className={`px-3 py-2 rounded text-sm font-medium transition ${
              tabAtiva === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="space-y-4">
        {tabAtiva === 'basico' && <ExemploNavegacaoBasica />}
        {tabAtiva === 'tap' && <ExemploTapGestos />}
        {tabAtiva === 'long' && <ExemploLongPress />}
        {tabAtiva === 'swipe' && <ExemploSwipe />}
        {tabAtiva === 'pinch' && <ExemploPinch />}
        {tabAtiva === 'combo' && <ExemploCombinacaoGestos />}
        {tabAtiva === 'nav' && <ExemploGestosNavegacao />}
        {tabAtiva === 'debug' && <ExemploDebugMode />}
      </div>
    </div>
  );
}
