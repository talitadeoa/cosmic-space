'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';

/**
 * Tipo de visualização da home
 * - 'interactive': Home tradicional com esferas 3D interativas
 * - 'panoramic': Home alternativa com visão panorâmica/hotspots
 */
export type HomeViewType = 'interactive' | 'panoramic';

interface CosmosNavigationContextType {
  /** Última home utilizada pelo usuário */
  homeView: HomeViewType;
  /** Define a home atual */
  setHomeView: (view: HomeViewType) => void;
  /** Rota para retornar à home correta */
  homeRoute: string;
  /** Navegar de volta para a home correta */
  getBackToHomeRoute: () => string;
}

const CosmosNavigationContext = createContext<CosmosNavigationContextType | undefined>(undefined);

const HOME_ROUTES: Record<HomeViewType, string> = {
  interactive: '/cosmos/home',
  panoramic: '/cosmos/home/alternativa',
};

const STORAGE_KEY = 'cosmos-home-view';

function getStoredHomeView(): HomeViewType {
  if (typeof window === 'undefined') return 'interactive';
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'panoramic' || stored === 'interactive') {
      return stored;
    }
  } catch {
    // sessionStorage não disponível
  }
  return 'interactive';
}

function storeHomeView(view: HomeViewType): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, view);
  } catch {
    // sessionStorage não disponível
  }
}

export function CosmosNavigationProvider({ children }: { children: ReactNode }) {
  const [homeView, setHomeViewState] = useState<HomeViewType>('interactive');
  const [isHydrated, setIsHydrated] = useState(false);

  // Hidratar do sessionStorage após montagem
  useEffect(() => {
    setHomeViewState(getStoredHomeView());
    setIsHydrated(true);
  }, []);

  const setHomeView = useCallback((view: HomeViewType) => {
    setHomeViewState(view);
    storeHomeView(view);
  }, []);

  const homeRoute = useMemo(() => HOME_ROUTES[homeView], [homeView]);

  const getBackToHomeRoute = useCallback(() => {
    // Durante SSR ou antes da hidratação, usar valor do storage diretamente
    if (!isHydrated && typeof window !== 'undefined') {
      return HOME_ROUTES[getStoredHomeView()];
    }
    return HOME_ROUTES[homeView];
  }, [homeView, isHydrated]);

  const value = useMemo<CosmosNavigationContextType>(
    () => ({
      homeView,
      setHomeView,
      homeRoute,
      getBackToHomeRoute,
    }),
    [homeView, setHomeView, homeRoute, getBackToHomeRoute]
  );

  return (
    <CosmosNavigationContext.Provider value={value}>{children}</CosmosNavigationContext.Provider>
  );
}

export function useCosmosNavigation() {
  const context = useContext(CosmosNavigationContext);
  if (!context) {
    throw new Error('useCosmosNavigation deve ser usado dentro de um CosmosNavigationProvider');
  }
  return context;
}

/**
 * Hook para usar quando o contexto pode não existir (páginas que podem ser acessadas diretamente)
 * Retorna valores padrão seguros, lendo do sessionStorage se disponível
 */
export function useCosmosNavigationSafe() {
  const context = useContext(CosmosNavigationContext);
  
  // Fallback que lê do sessionStorage
  const fallback = useMemo(() => ({
    homeView: typeof window !== 'undefined' ? getStoredHomeView() : 'interactive' as HomeViewType,
    setHomeView: (view: HomeViewType) => storeHomeView(view),
    homeRoute: HOME_ROUTES[typeof window !== 'undefined' ? getStoredHomeView() : 'interactive'],
    getBackToHomeRoute: () => HOME_ROUTES[typeof window !== 'undefined' ? getStoredHomeView() : 'interactive'],
  }), []);

  return context ?? fallback;
}
