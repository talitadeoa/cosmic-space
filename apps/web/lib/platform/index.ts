/**
 * 🔧 Platform Detection & Environment Configuration
 *
 * Módulo central para detecção de plataforma e configuração de ambiente.
 * Suporta: Web (Browser), iOS (Capacitor), Android (Capacitor), SSR (Node)
 *
 * @example
 * import { platform, env } from '@/lib/platform';
 *
 * // Detecção de plataforma
 * if (platform.isNative) {
 *   // Lógica específica para mobile
 * }
 *
 * // Acesso a URLs
 * const apiEndpoint = env.apiUrl('/api/moons');
 */

// =============================================================================
// 📱 PLATFORM DETECTION
// =============================================================================

export type PlatformType = 'web' | 'ios' | 'android' | 'server';

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => 'ios' | 'android' | 'web';
  convertFileSrc?: (path: string) => string;
  Plugins?: Record<string, unknown>;
}

/**
 * Acessa o objeto Capacitor global de forma segura
 */
const getCapacitor = (): CapacitorGlobal | null => {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor ?? null;
};

/**
 * Detecta a plataforma atual
 */
export const detectPlatform = (): PlatformType => {
  // SSR / Node.js
  if (typeof window === 'undefined') {
    return 'server';
  }

  const capacitor = getCapacitor();

  // Capacitor Native (iOS/Android)
  if (capacitor?.isNativePlatform?.()) {
    const nativePlatform = capacitor.getPlatform?.();
    if (nativePlatform === 'ios' || nativePlatform === 'android') {
      return nativePlatform;
    }
  }

  // Web Browser
  return 'web';
};

/**
 * Objeto de detecção de plataforma com helpers
 */
export const platform = {
  /** Plataforma atual */
  get current(): PlatformType {
    return detectPlatform();
  },

  /** Está rodando em ambiente nativo (iOS ou Android) */
  get isNative(): boolean {
    const p = detectPlatform();
    return p === 'ios' || p === 'android';
  },

  /** Está rodando no navegador web */
  get isWeb(): boolean {
    return detectPlatform() === 'web';
  },

  /** Está rodando em server-side (SSR) */
  get isServer(): boolean {
    return detectPlatform() === 'server';
  },

  /** Está rodando no iOS */
  get isIOS(): boolean {
    return detectPlatform() === 'ios';
  },

  /** Está rodando no Android */
  get isAndroid(): boolean {
    return detectPlatform() === 'android';
  },

  /** Está rodando no cliente (web ou native) */
  get isClient(): boolean {
    return typeof window !== 'undefined';
  },

  /** Acessa objeto Capacitor (null se não disponível) */
  get capacitor(): CapacitorGlobal | null {
    return getCapacitor();
  },

  /** Converte path de arquivo para URL (necessário em Capacitor) */
  convertFileSrc(path: string): string {
    const capacitor = getCapacitor();
    if (capacitor?.convertFileSrc) {
      return capacitor.convertFileSrc(path);
    }
    return path;
  },
};

// =============================================================================
// 🌐 ENVIRONMENT CONFIGURATION
// =============================================================================

/**
 * Obtém variável de ambiente com fallback
 * IMPORTANTE: Variáveis NEXT_PUBLIC_ são inlined no build time
 */
const getEnvVar = (key: string, fallback = ''): string => {
  // Em runtime, process.env.NEXT_PUBLIC_* já está inlined
  if (typeof process !== 'undefined' && process.env) {
    return (process.env as Record<string, string | undefined>)[key] ?? fallback;
  }
  return fallback;
};

/**
 * Obtém a URL base do app
 * 
 * Prioridade:
 * 1. NEXT_PUBLIC_APP_URL (produção/staging)
 * 2. NEXT_PUBLIC_VERCEL_URL (auto-detectado pela Vercel)
 * 3. window.location.origin (web runtime)
 * 4. fallback vazio para URLs relativas
 */
const getAppUrl = (): string => {
  // Variável explícita tem prioridade máxima
  const appUrl = getEnvVar('NEXT_PUBLIC_APP_URL');
  if (appUrl) return appUrl;

  // Vercel auto-injeta essa variável
  const vercelUrl = getEnvVar('NEXT_PUBLIC_VERCEL_URL');
  if (vercelUrl) {
    return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
  }

  // Em runtime no cliente, usa a origem atual
  if (platform.isClient && !platform.isNative) {
    return window.location.origin;
  }

  // SSR ou Native sem config: string vazia = URLs relativas
  return '';
};

/**
 * Obtém a URL base para API
 * 
 * No Capacitor, WebView não tem "mesma origem" então precisa de URL absoluta
 */
const getApiBaseUrl = (): string => {
  // API URL explícita (pode ser diferente do app URL)
  const apiUrl = getEnvVar('NEXT_PUBLIC_API_URL');
  if (apiUrl) return apiUrl;

  // No Native, DEVE usar URL absoluta
  if (platform.isNative) {
    const appUrl = getAppUrl();
    if (!appUrl) {
      console.error(
        '[Platform] ⚠️ App nativo sem NEXT_PUBLIC_APP_URL ou NEXT_PUBLIC_API_URL configurada!',
        'APIs não funcionarão corretamente.'
      );
    }
    return appUrl;
  }

  // Web pode usar URLs relativas (string vazia)
  return '';
};

/**
 * Objeto de configuração de ambiente
 */
export const env = {
  /** URL base do app (para links, SEO, etc) */
  get appUrl(): string {
    return getAppUrl();
  },

  /** URL base para chamadas de API */
  get apiBaseUrl(): string {
    return getApiBaseUrl();
  },

  /** Ambiente atual (development/production/test) */
  get nodeEnv(): string {
    return getEnvVar('NODE_ENV', 'development');
  },

  /** Está em modo de desenvolvimento */
  get isDev(): boolean {
    return this.nodeEnv === 'development';
  },

  /** Está em modo de produção */
  get isProd(): boolean {
    return this.nodeEnv === 'production';
  },

  /**
   * Constrói URL completa para endpoint de API
   *
   * @example
   * env.apiUrl('/api/moons') // 'https://flua.app/api/moons' ou '/api/moons'
   */
  apiUrl(endpoint: string): string {
    const base = getApiBaseUrl();
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${normalizedEndpoint}`;
  },

  /**
   * Constrói URL completa para página/rota do app
   *
   * @example
   * env.pageUrl('/cosmos/planeta') // 'https://flua.app/cosmos/planeta'
   */
  pageUrl(path: string): string {
    const base = getAppUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  },

  /**
   * Constrói URL para asset estático
   */
  assetUrl(path: string): string {
    // No Capacitor, assets locais precisam de conversão
    if (platform.isNative) {
      return platform.convertFileSrc(path);
    }

    const base = getAppUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  },
};

// =============================================================================
// 🔗 DEEP LINKING
// =============================================================================

/**
 * Configuração de deep links
 */
export const deepLinks = {
  /** Scheme do app (ex: flua://) */
  scheme: getEnvVar('NEXT_PUBLIC_APP_SCHEME', 'flua://'),

  /** Domínio para Universal Links / App Links */
  domain: getEnvVar('NEXT_PUBLIC_APP_DOMAIN', ''),

  /**
   * Constrói deep link para rota
   *
   * @example
   * deepLinks.build('/cosmos/planeta') // 'flua://cosmos/planeta'
   */
  build(path: string): string {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.scheme}${normalizedPath}`;
  },

  /**
   * Extrai path de um deep link
   *
   * @example
   * deepLinks.parse('flua://cosmos/planeta') // '/cosmos/planeta'
   */
  parse(deepLink: string): string | null {
    if (deepLink.startsWith(this.scheme)) {
      const path = deepLink.slice(this.scheme.length);
      return path.startsWith('/') ? path : `/${path}`;
    }
    return null;
  },
};

// =============================================================================
// 📱 CAPACITOR HELPERS
// =============================================================================

/**
 * Helpers específicos para Capacitor
 */
export const capacitorHelpers = {
  /**
   * Verifica se um plugin Capacitor está disponível
   */
  isPluginAvailable(pluginName: string): boolean {
    const capacitor = getCapacitor();
    return !!(capacitor?.Plugins as Record<string, unknown>)?.[pluginName];
  },

  /**
   * Safe area insets (para notch, home indicator, etc)
   * Retorna valores CSS seguros
   */
  getSafeAreaInsets(): {
    top: string;
    bottom: string;
    left: string;
    right: string;
  } {
    if (!platform.isClient) {
      return { top: '0px', bottom: '0px', left: '0px', right: '0px' };
    }

    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('--sat') || 'env(safe-area-inset-top, 0px)',
      bottom: style.getPropertyValue('--sab') || 'env(safe-area-inset-bottom, 0px)',
      left: style.getPropertyValue('--sal') || 'env(safe-area-inset-left, 0px)',
      right: style.getPropertyValue('--sar') || 'env(safe-area-inset-right, 0px)',
    };
  },
};

// =============================================================================
// 🎯 DEFAULT EXPORT
// =============================================================================

export default {
  platform,
  env,
  deepLinks,
  capacitorHelpers,
};
