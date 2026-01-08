import type { CapacitorConfig } from '@capacitor/cli';

/**
 * ⚡ Capacitor Configuration
 * 
 * Configuração para builds mobile (iOS/Android) via WebView.
 * 
 * Build:
 *   npm run build:mobile  # next build && cap sync
 *   npx cap run ios       # Testar no iOS
 *   npx cap run android   # Testar no Android
 */
const config: CapacitorConfig = {
  appId: 'app.flua.cosmic',
  appName: 'Flua',
  webDir: 'out', // Diretório de output do Next.js (static export)
  
  // Servidor de desenvolvimento (comentar em produção)
  // server: {
  //   url: 'http://192.168.1.X:3000', // IP local para dev
  //   cleartext: true,
  // },

  // Configurações do WebView
  android: {
    backgroundColor: '#050816', // space-dark
    allowMixedContent: true,
  },
  
  ios: {
    backgroundColor: '#050816',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },

  // Plugins
  plugins: {
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#050816',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    // Status Bar
    StatusBar: {
      style: 'LIGHT', // Texto claro no status bar
      backgroundColor: '#050816',
    },
    
    // Keyboard
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    
    // Preferences (Storage)
    Preferences: {
      // Grupo de storage (iOS)
      group: 'app.flua.cosmic',
    },
  },
};

export default config;
