/**
 * 📱 Capacitor Utilities
 * 
 * Helpers para detectar ambiente e funcionalidades mobile.
 * Esses utilitários fornecem fallbacks seguros quando Capacitor não está instalado.
 */

// ============================================
// CAPACITOR DETECTION (mock para Web)
// ============================================

/**
 * Verifica se está rodando em ambiente nativo (iOS/Android)
 * Retorna false quando Capacitor não está instalado
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Capacitor adiciona essa propriedade quando está rodando em ambiente nativo
  const win = window as Window & { Capacitor?: { isNativePlatform?: () => boolean } };
  return win.Capacitor?.isNativePlatform?.() ?? false;
}

/**
 * Retorna a plataforma atual
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  
  const win = window as Window & { Capacitor?: { getPlatform?: () => string } };
  const platform = win.Capacitor?.getPlatform?.();
  
  if (platform === 'ios' || platform === 'android') {
    return platform;
  }
  
  return 'web';
}

/**
 * Verifica se é iOS
 */
export function isIOS(): boolean {
  return getPlatform() === 'ios';
}

/**
 * Verifica se é Android
 */
export function isAndroid(): boolean {
  return getPlatform() === 'android';
}

/**
 * Verifica se é Web
 */
export function isWeb(): boolean {
  return getPlatform() === 'web';
}

/**
 * Retorna URL base dependendo do ambiente
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  // Mobile: usar API externa
  if (isNativePlatform()) {
    // Em ambiente Capacitor, usar URL configurada
    return 'https://flua.vercel.app';
  }

  // Web: usar origem atual
  return window.location.origin;
}

/**
 * Converte caminho de arquivo para URL compatível com Capacitor
 */
export function convertFileSrc(path: string): string {
  if (!isNativePlatform()) {
    return path;
  }

  const win = window as Window & { Capacitor?: { convertFileSrc?: (path: string) => string } };
  return win.Capacitor?.convertFileSrc?.(path) ?? path;
}
