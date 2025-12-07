import { useRef } from 'react';

export function useSfx() {
  const ctxRef = useRef<AudioContext | null>(null);

  function ensureCtx() {
    if (!ctxRef.current) {
      // @ts-ignore
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current!;
  }

  function playBeep(freq = 440, duration = 0.08, type: OscillatorType = 'sine') {
    try {
      const ctx = ensureCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      o.start();
      o.stop(ctx.currentTime + duration);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration - 0.01);
    } catch (e) {
      // Silenciar falhas de reprodução
      // console.warn('SFX play failed', e);
    }
  }

  function click() {
    playBeep(800, 0.06, 'sine');
  }

  function transition() {
    playBeep(400, 0.12, 'triangle');
  }

  return { click, transition };
}
