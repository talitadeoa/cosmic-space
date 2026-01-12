import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resolveGitTag = () => {
  try {
    return execSync('git describe --tags --abbrev=0', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
};

const resolvePackageVersion = () => {
  try {
    const raw = readFileSync(path.join(__dirname, 'package.json'), 'utf8');
    const { version } = JSON.parse(raw);
    if (typeof version === 'string' && version.trim()) {
      return version.trim();
    }
  } catch {}
  return null;
};

const gitTag = resolveGitTag();
const packageVersion = resolvePackageVersion();
const envGitTag = process.env.NEXT_PUBLIC_GIT_TAG?.trim();
const publicGitTag = envGitTag || gitTag || packageVersion || 'v0.1.3 alpha flow';

/**
 * Detecta se é build para mobile (Capacitor)
 * Use: MOBILE_BUILD=true npm run build
 */
const isMobileBuild = process.env.MOBILE_BUILD === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GIT_TAG: publicGitTag,
  },

  // Transpile React Three Fiber packages para evitar erros de SSR
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

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
