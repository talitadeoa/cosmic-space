// components/index.ts
// Autenticação
export { default as AuthGate } from '@/components/auth/AuthGate';

// Providers
export { default as SfxProvider, useSfxContext } from '@/components/providers/SfxProvider';

// Layouts
export * from '@/components/layouts/SpacePageLayout';

// Sincronização
export { default as AutoSyncLunar } from '@/components/sync/AutoSyncLunar';
export { LunationSync, useSyncLunations } from '@/components/sync/LunationSync';
export { GalaxySunsSync } from '@/components/sync/GalaxySunsSync';

// Navegação
export { default as NavMenu } from '@/components/navigation/NavMenu';

// Áudio
export { default as RadioPlayer } from '@/components/audio/RadioPlayer';
