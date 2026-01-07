// components/index.ts

// ============================================
// AUTH
// ============================================
export { default as AuthGate } from '@/components/auth/AuthGate';

// ============================================
// PROVIDERS
// ============================================
export { default as SfxProvider, useSfxContext } from '@/components/providers/SfxProvider';
export { AuthProvider, useAuth } from '@/components/providers/AuthProvider';
export { AppProviders } from '@/components/providers/AppProviders';

// ============================================
// LAYOUTS
// ============================================
export * from '@/components/layouts/SpacePageLayout';

// ============================================
// SYNC
// ============================================
export { default as AutoSyncLunar } from '@/components/sync/AutoSyncLunar';
export { LunationSync, useSyncLunations } from '@/components/sync/LunationSync';
export { GalaxySunsSync } from '@/components/sync/GalaxySunsSync';

// ============================================
// NAVIGATION
// ============================================
export { default as NavMenu } from '@/components/navigation/NavMenu';

// ============================================
// AUDIO
// ============================================
export { default as RadioPlayer } from '@/components/audio/RadioPlayer';

// ============================================
// SHARED (UI Components)
// ============================================
export { Card, type CardProps } from '@/components/shared/Card';

