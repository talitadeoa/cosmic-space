'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SpaceBackground } from '@/app/cosmos/components/SpaceBackground';

export type SpacePageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  onBackgroundClick?: () => void;
  allowBackNavigation?: boolean;
};

/**
 * Layout unificado para todas as rotas com SpaceBackground
 * Garante consistência visual em todo o aplicativo
 * 
 * @param allowBackNavigation - Se true, permite voltar para a página anterior ao clicar no background
 */
export const SpacePageLayout: React.FC<SpacePageLayoutProps> = React.memo(({
  children,
  className = '',
  onBackgroundClick,
  allowBackNavigation = false,
}) => {
  const router = useRouter();

  const handleBackgroundClick = useCallback(() => {
    if (onBackgroundClick) {
      onBackgroundClick();
    } else if (allowBackNavigation) {
      router.back();
    }
  }, [onBackgroundClick, allowBackNavigation, router]);

  return (
    <div
      className={`relative min-h-[100dvh] w-full overflow-hidden bg-slate-950 ${className}`}
      onClick={handleBackgroundClick}
    >
      <SpaceBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
});

SpacePageLayout.displayName = 'SpacePageLayout';
