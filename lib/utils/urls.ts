/**
 * 🔗 URL Utilities - Capacitor-Ready
 *
 * Gerencia URLs base para funcionar tanto na web quanto no Capacitor WebView.
 *
 * @deprecated Use `import { platform, env } from '@/lib/platform'` para novas implementações.
 * Este arquivo é mantido para retrocompatibilidade.
 */

import { platform, env, deepLinks } from '@/lib/platform';

// Re-export para retrocompatibilidade
export { platform, env, deepLinks };

/**
 * Detecta se está rodando em ambiente Capacitor (mobile app)
 * @deprecated Use `platform.isNative` ao invés disso
 */
export const isCapacitor = (): boolean => platform.isNative;

/**
 * Detecta a plataforma atual
 * @deprecated Use `platform.current` ao invés disso
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  const current = platform.current;
  if (current === 'server') return 'web';
  return current;
};

/**
 * Retorna a URL base para chamadas de API
 * @deprecated Use `env.apiBaseUrl` ao invés disso
 */
export const getBaseUrl = (): string => env.apiBaseUrl;

/**
 * Constrói URL completa para endpoint de API
 * @deprecated Use `env.apiUrl(endpoint)` ao invés disso
 */
export const apiUrl = (endpoint: string): string => env.apiUrl(endpoint);

/**
 * Converte caminho de asset para URL utilizável no Capacitor
 * @deprecated Use `env.assetUrl(path)` ou `platform.convertFileSrc(path)` ao invés disso
 */
export const assetUrl = (path: string): string => {
  if (platform.isNative) {
    return platform.convertFileSrc(path);
  }
  return path;
};

/**
 * URLs fixas do app
 *
 * @deprecated Configure via variáveis de ambiente ao invés de hardcoding.
 * Use:
 * - NEXT_PUBLIC_APP_URL para URL de produção
 * - NEXT_PUBLIC_APP_SCHEME para deep link scheme
 * - NEXT_PUBLIC_SOCIAL_INSTAGRAM para redes sociais
 */
export const APP_URLS = {
  // Produção - Use env.appUrl ao invés disso
  get PRODUCTION() {
    return env.appUrl || 'https://flua.vercel.app';
  },

  // Deep links - Use deepLinks.scheme ao invés disso
  get SCHEME() {
    return deepLinks.scheme;
  },

  // Redes sociais
  get INSTAGRAM() {
    return process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || 'https://instagram.com/fluaapp';
  },

  // Assets estáticos
  OG_IMAGE: '/og-image.png',
  FAVICON: '/fluafavicon.ico',
  APPLE_ICON: '/flua-icon-192.jpeg',
  MANIFEST: '/manifest.json',
} as const;
