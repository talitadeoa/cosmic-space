/**
 * 🔗 URL Utilities - Capacitor-Ready
 *
 * Gerencia URLs base para funcionar tanto na web quanto no Capacitor WebView.
 */

/**
 * Detecta se está rodando em ambiente Capacitor (mobile app)
 */
export const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

/**
 * Detecta a plataforma atual
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  if (typeof window === 'undefined') return 'web';

  const capacitor = (window as any).Capacitor;
  if (capacitor?.isNativePlatform?.()) {
    return capacitor.getPlatform?.() || 'web';
  }

  return 'web';
};

/**
 * Retorna a URL base para chamadas de API
 *
 * No Capacitor, precisa apontar para o servidor real (não localhost)
 * Na web, pode usar URLs relativas
 */
export const getBaseUrl = (): string => {
  // Em ambiente de servidor (SSR), usa variável de ambiente
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }

  // No Capacitor, SEMPRE usa URL absoluta do servidor
  if (isCapacitor()) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn(
        '[URLs] NEXT_PUBLIC_API_URL não configurada. Defina no .env para builds Capacitor.'
      );
      // Fallback para produção
      return 'https://flua.vercel.app';
    }
    return apiUrl;
  }

  // Na web, pode usar URL relativa (vazia = mesma origem)
  return '';
};

/**
 * Constrói URL completa para endpoint de API
 */
export const apiUrl = (endpoint: string): string => {
  const base = getBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${normalizedEndpoint}`;
};

/**
 * Converte caminho de asset para URL utilizável no Capacitor
 * No iOS/Android, arquivos locais precisam de conversão especial
 */
export const assetUrl = (path: string): string => {
  if (typeof window === 'undefined') return path;

  const capacitor = (window as any).Capacitor;
  if (capacitor?.convertFileSrc) {
    return capacitor.convertFileSrc(path);
  }

  return path;
};

/**
 * URLs fixas do app (para substituir hardcoded)
 */
export const APP_URLS = {
  // Produção
  PRODUCTION: 'https://flua.vercel.app',

  // Deep links
  SCHEME: 'flua://',

  // Redes sociais (se houver)
  INSTAGRAM: 'https://instagram.com/fluaapp',

  // Assets estáticos
  OG_IMAGE: '/og-image.png',
  FAVICON: '/fluafavicon.ico',
  APPLE_ICON: '/flua-icon-192.jpeg',
  MANIFEST: '/manifest.json',
} as const;
