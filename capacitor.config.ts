/**
 * 📱 Capacitor Configuration
 * 
 * Configuração para empacotamento mobile via WebView
 * 
 * @see https://capacitorjs.com/docs/config
 */

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.flua.cosmic',
  appName: 'Flua',
  webDir: 'out',
  bundledWebRuntime: false,

  // Servidor & URLs
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Hostname para evitar problemas de CORS
    hostname: 'app.flua.local',
  },

  // Plugins Configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#050816',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#050816',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },

  // iOS specific
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },

  // Android specific
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
  },
};

export default config;
