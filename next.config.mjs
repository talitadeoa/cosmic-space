// import path from 'path';

/**
 * Detecta se é build para mobile (Capacitor)
 * Use: MOBILE_BUILD=true npm run build
 */
const isMobileBuild = process.env.MOBILE_BUILD === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Para Capacitor, precisa de static export
  // Ativar apenas para builds mobile para não afetar Vercel
  ...(isMobileBuild && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true, // Image optimization não funciona em static
    },
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

      // /perfil/ciclos → /ciclos/menstrual
      {
        source: '/perfil/ciclos',
        destination: '/ciclos/menstrual',
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
