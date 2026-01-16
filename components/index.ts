// components/index.ts
// Autenticação
export { default as AuthGate } from '@/components/auth/AuthGate';

// Providers
export { AppProviders } from '@/components/providers';

// Layouts
export * from '@/components/layouts/SpacePageLayout';

// Sincronização
export { default as AutoSyncLunar } from '@/components/sync/AutoSyncLunar';
export { LunationSync, useSyncLunations } from '@/components/sync/LunationSync';
export { GalaxySunsSync } from '@/components/sync/GalaxySunsSync';

// Navegação
export { default as NavMenu } from '@/components/navigation/NavMenu';

// Ciclo - Experiência de autocuidado
export { default as CycleJourney } from '@/components/ciclos/CycleJourney';
export { default as CycleCareButton } from '@/components/ciclos/CycleCareButton';
export { default as CycleInputCompact } from '@/components/ciclos/CycleInputCompact';

// Perfil (legado - usar CycleJourney no lugar)
export { default as CycleTracker } from '@/components/CycleTracker';
