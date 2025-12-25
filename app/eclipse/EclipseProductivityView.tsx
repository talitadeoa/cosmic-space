'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatTimePtBr } from '@/lib/utils/format';
import {
  loadSavedTodos,
  phaseOrder,
  type SavedTodo,
} from '@/app/cosmos/utils/todoStorage';
import type { ScreenProps } from '@/app/cosmos/types';
import SummaryLayer from './layers/summary/SummaryLayer';
import CycleSummaryLayer from './layers/cycle/CycleSummaryLayer';
import PhaseBarsLayer from './layers/phases/PhaseBarsLayer';
import ProductivityLayer from './layers/productivity/ProductivityLayer';
import type { PhaseStat } from './types';

type EclipseProductivityViewProps = {
  navigateWithFocus?: ScreenProps['navigateWithFocus'];
};

const EclipseProductivityView: React.FC<EclipseProductivityViewProps> = ({ navigateWithFocus }) => {
  const router = useRouter();
  const [todos, setTodos] = useState<SavedTodo[]>([]);
  const [lastSync, setLastSync] = useState('');

  const navigateWithFocusOrFallback = useCallback<ScreenProps['navigateWithFocus']>(
    (nextScreen, params) => {
      if (navigateWithFocus) {
        navigateWithFocus(nextScreen, params);
        return;
      }
      router.push('/cosmos');
    },
    [navigateWithFocus, router]
  );

  const syncTodos = useCallback(() => {
    const loaded = loadSavedTodos();
    setTodos(loaded);
    setLastSync(formatTimePtBr(new Date()));
  }, []);

  useEffect(() => {
    syncTodos();
  }, [syncTodos]);

  const totalTodos = todos.length;
  const completedTodos = useMemo(() => todos.filter((todo) => todo.completed).length, [todos]);
  const assignedTodos = useMemo(() => todos.filter((todo) => todo.phase), [todos]);
  const unassignedTodos = useMemo(() => todos.filter((todo) => !todo.phase), [todos]);

  const phaseStats = useMemo<PhaseStat[]>(
    () =>
      phaseOrder.map((phase) => {
        const items = todos.filter((todo) => todo.phase === phase);
        const completed = items.filter((todo) => todo.completed).length;
        const total = items.length;
        return {
          phase,
          total,
          completed,
          productivity: total ? Math.round((completed / total) * 100) : 0,
        };
      }),
    [todos]
  );

  const bestPhase = useMemo(() => {
    if (!phaseStats.length) return null;
    return phaseStats.reduce(
      (best, current) => (current.productivity > best.productivity ? current : best),
      phaseStats[0]
    );
  }, [phaseStats]);

  const maxTotal = Math.max(1, ...phaseStats.map((stat) => stat.total));
  const hasPhaseData = phaseStats.some((stat) => stat.total > 0);
  const productivityPoints = phaseStats.length
    ? phaseStats
        .map((stat, idx) => {
          const x = 12 + (idx / Math.max(phaseStats.length - 1, 1)) * 240;
          const y = 120 - (stat.productivity / 100) * 90;
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  const lastSyncLabel = lastSync ? `Sync ${lastSync}` : 'Sync inicial';

  const handleOpenSidePlanet = useCallback(() => {
    navigateWithFocusOrFallback('sidePlanetCard', { type: 'planeta', size: 'md' });
  }, [navigateWithFocusOrFallback]);

  const handleOpenSidePlanetFromBadge = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      navigateWithFocusOrFallback('sidePlanetCard', { event, type: 'planeta', size: 'md' });
    },
    [navigateWithFocusOrFallback]
  );

  const handleNavigateToLuaList = useCallback(() => {
    navigateWithFocusOrFallback('luaList', { type: 'lua', size: 'sm' });
  }, [navigateWithFocusOrFallback]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(99,102,241,0.18),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.16),transparent_36%),radial-gradient(circle_at_55%_80%,rgba(236,72,153,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />

      <div className="relative z-10 grid h-full w-full grid-cols-1 gap-5 lg:grid-cols-3">
        <SummaryLayer
          lastSyncLabel={lastSyncLabel}
          onOpenSidePlanet={handleOpenSidePlanet}
          onSync={syncTodos}
          bestPhase={bestPhase}
          onOpenSidePlanetFromBadge={handleOpenSidePlanetFromBadge}
        />

        <div className="flex flex-col gap-4 lg:col-span-2">
          <CycleSummaryLayer
            totalTodos={totalTodos}
            completedTodos={completedTodos}
            assignedCount={assignedTodos.length}
            unassignedCount={unassignedTodos.length}
          />

          <PhaseBarsLayer
            phaseStats={phaseStats}
            maxTotal={maxTotal}
            bestPhase={bestPhase}
            hasPhaseData={hasPhaseData}
          />

          <ProductivityLayer
            productivityPoints={productivityPoints}
            phaseStats={phaseStats}
            completedTodos={completedTodos}
            totalTodos={totalTodos}
            unassignedTodos={unassignedTodos}
            onNavigateToLuaList={handleNavigateToLuaList}
          />
        </div>
      </div>
    </div>
  );
};

export default EclipseProductivityView;
