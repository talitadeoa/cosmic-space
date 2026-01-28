import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Detecta se é build para mobile (Capacitor)
 * Use: MOBILE_BUILD=true npm run build
 */
const isMobileBuild = process.env.MOBILE_BUILD === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile React Three Fiber packages para evitar erros de SSR
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Usar public compartilhado da raiz do monorepo
  publicRuntimeConfig: {
    publicFolder: path.join(__dirname, '../../public'),
  },

  // Turbopack não suporta bem react-three-fiber ainda - configuração vazia
  turbopack: {},

  // Configuração do Webpack para resolver problemas de React duplicado (para builds de produção)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-reconciler': path.resolve(__dirname, 'node_modules/react-reconciler'),
      // Força resolução única para react-three-fiber
      '@react-three/fiber': path.resolve(__dirname, 'node_modules/@react-three/fiber'),
      '@react-three/drei': path.resolve(__dirname, 'node_modules/@react-three/drei'),
      'three': path.resolve(__dirname, 'node_modules/three'),
      // Resolve 'zustand' to the version bundled with @react-three/fiber to avoid ESM interop issues
      'zustand': path.resolve(__dirname, 'node_modules/@react-three/fiber/node_modules/zustand'),
    };

    // Adiciona resolução de módulos para evitar conflitos
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ];

    return config;
  },

  // Configuração de imagens
  images: {
    // Apenas para builds mobile onde temos static export
    ...(isMobileBuild && { unoptimized: true }),
    // Otimização padrão para web/vercel
    ...(!isMobileBuild && {
      remotePatterns: [],
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    }),
  },

  // Para Capacitor, precisa de static export
  // Ativar apenas para builds mobile para não afetar Vercel
  ...(isMobileBuild && {
    output: 'export',
    trailingSlash: true,
  }),

  // SEO e Branding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/breve',
        destination: '/',
        permanent: true,
      },
      // ========================================
      // 🔄 Redirects de migração de rotas
      // @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
      // ========================================

      // /ilha → /tarefas
      {
        source: '/ilha',
        destination: '/tarefas',
        permanent: true,
      },

      // /timeline → /emocoes/historico
      {
        source: '/timeline',
        destination: '/emocoes/historico',
        permanent: true,
      },

      // /perfil/emocoes → /emocoes/registro
      {
        source: '/perfil/emocoes',
        destination: '/emocoes/registro',
        permanent: true,
      },

      // /perfil/ciclos → /ciclos/ciclo
      {
        source: '/perfil/ciclos',
        destination: '/ciclos/ciclo',
        permanent: true,
      },

      // /cosmos/calendarioc → /ciclos/calendario
      {
        source: '/cosmos/calendarioc',
        destination: '/ciclos/calendario',
        permanent: true,
      },

      // /cosmos/lua → /ciclos/lunar
      {
        source: '/cosmos/lua',
        destination: '/ciclos/lunar',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
