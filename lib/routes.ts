/**
 * 🗺️ Constantes centralizadas de todas as rotas da aplicação
 *
 * Single source of truth para navegação.
 * Benefícios:
 * - Type-safety em navegação
 * - Refatoração automática via IDE
 * - Facilita deep links mobile
 * - Documentação implícita da estrutura
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

// ==========================================
// 🔓 ROTAS PÚBLICAS
// ==========================================

export const PUBLIC_ROUTES = {
  /** Landing page */
  HOME: '/',
  /** Landing page alternativa */
  LANDING: '/landing',
  /** Termos de uso */
  TERMS: '/termos',
  /** Política de privacidade */
  PRIVACY: '/privacidade',
} as const;

// ==========================================
// 🔐 ROTAS DE AUTENTICAÇÃO
// ==========================================

export const AUTH_ROUTES = {
  /** Login */
  LOGIN: '/login',
  /** Cadastro */
  SIGNUP: '/signup',
  /** Logout */
  LOGOUT: '/logout',
} as const;

// ==========================================
// 🌌 ROTAS - COSMOS (Experiência Visual)
// ==========================================

export const COSMOS_ROUTES = {
  /** Dashboard cósmico */
  HOME: '/cosmos',
  /** Experiência de galáxia */
  GALAXIA: '/cosmos/galaxia',
  /** Experiência do planeta */
  PLANETA: '/cosmos/planeta',
  /** Experiência do sol/sóis */
  SOL: '/cosmos/sol',
  /** Experiência lunar */
  LUA: '/cosmos/lua',
} as const;

// ==========================================
// 🌙 ROTAS - CICLOS (Lunar + Menstrual)
// ==========================================

export const CICLOS_ROUTES = {
  /** Visão geral dos ciclos */
  HOME: '/ciclos',
  /** Ciclo lunar */
  LUNAR: '/ciclos/lunar',
  /** Ciclo menstrual */
  MENSTRUAL: '/ciclos/menstrual',
  /** Calendário geral */
  CALENDARIO: '/ciclos/calendario',
  /** Calendário por mês (dinâmico) */
  CALENDARIO_MES: (mes: string) => `/ciclos/calendario/${mes}` as const,
} as const;

// ==========================================
// ✅ ROTAS - TAREFAS (Antigas "Ilhas")
// ==========================================

export const TAREFAS_ROUTES = {
  /** Lista de tarefas */
  HOME: '/tarefas',
  /** Detalhes de uma tarefa (dinâmico) */
  DETALHE: (id: string) => `/tarefas/${id}` as const,
  /** Nova tarefa */
  NOVA: '/tarefas/nova',
} as const;

// ==========================================
// 💜 ROTAS - EMOÇÕES
// ==========================================

export const EMOCOES_ROUTES = {
  /** Timeline emocional */
  HOME: '/emocoes',
  /** Registro de emoção */
  REGISTRO: '/emocoes/registro',
  /** Histórico */
  HISTORICO: '/emocoes/historico',
  /** Padrões emocionais */
  PADROES: '/emocoes/padroes',
} as const;

// ==========================================
// 👥 ROTAS - COMUNIDADE
// ==========================================

export const COMUNIDADE_ROUTES = {
  /** Feed da comunidade */
  HOME: '/comunidade',
  /** Detalhes de um post (dinâmico) */
  POST: (postId: string) => `/comunidade/${postId}` as const,
} as const;

// ==========================================
// 👤 ROTAS - PERFIL
// ==========================================

export const PERFIL_ROUTES = {
  /** Dashboard do perfil */
  HOME: '/perfil',
  /** Configurações */
  CONFIGURACOES: '/perfil/configuracoes',
  /** Insights pessoais */
  INSIGHTS: '/perfil/insights',
  /** Ciclos no perfil (legado) */
  CICLOS: '/perfil/ciclos',
  /** Emoções no perfil (legado) */
  EMOCOES: '/perfil/emocoes',
} as const;

// ==========================================
// 📊 ROTAS - TIMELINE
// ==========================================

export const TIMELINE_ROUTES = {
  /** Timeline principal */
  HOME: '/timeline',
  /** Timeline por data (dinâmico) */
  DATA: (date: string) => `/timeline/${date}` as const,
} as const;

// ==========================================
// 📡 API ROUTES
// ==========================================

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    CALLBACK: '/api/auth/callback',
  },
  CICLOS: {
    LUNATIONS: '/api/lunations',
    MOONS: '/api/moons',
    PHASE_INPUTS: '/api/phase-inputs',
  },
  TAREFAS: {
    PLANET_TODOS: '/api/planet-todos',
    PLANET_STATE: '/api/planet-state',
    ISLANDS: '/api/islands',
  },
  TIMELINE: {
    HOME: '/api/timeline',
    ENTRY: (id: string) => `/api/timeline/${id}` as const,
  },
  COMMUNITY: {
    HOME: '/api/community',
    POST: (id: string) => `/api/community/${id}` as const,
  },
  INSIGHTS: {
    HOME: '/api/insights',
  },
  SYNC: {
    GALAXYSUNS: '/api/galaxysuns',
  },
} as const;

// ==========================================
// 📱 DEEP LINKS (Capacitor/Mobile)
// ==========================================

export const DEEP_LINKS = {
  SCHEME: 'flua',
  
  /** Gera deep link para rota */
  create: (path: string) => `flua://${path.replace(/^\//, '')}` as const,
  
  /** Mapeamento de rotas para deep links */
  MAP: {
    cosmos: '/cosmos',
    galaxia: '/cosmos/galaxia',
    planeta: '/cosmos/planeta',
    ciclos: '/ciclos',
    tarefas: '/tarefas',
    emocoes: '/emocoes',
    comunidade: '/comunidade',
    perfil: '/perfil',
    timeline: '/timeline',
  },
} as const;

// ==========================================
// 🛡️ ROTAS PROTEGIDAS
// ==========================================

/** Rotas que requerem autenticação */
export const PROTECTED_ROUTES = [
  COSMOS_ROUTES.HOME,
  CICLOS_ROUTES.HOME,
  TAREFAS_ROUTES.HOME,
  EMOCOES_ROUTES.HOME,
  COMUNIDADE_ROUTES.HOME,
  PERFIL_ROUTES.HOME,
  TIMELINE_ROUTES.HOME,
] as const;

/** Rotas públicas (não requerem auth) */
export const UNPROTECTED_ROUTES = [
  PUBLIC_ROUTES.HOME,
  PUBLIC_ROUTES.LANDING,
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.SIGNUP,
] as const;

// ==========================================
// 🔄 HELPERS
// ==========================================

/**
 * Verifica se uma rota requer autenticação
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Obtém o domínio de uma rota
 */
export function getRouteDomain(
  pathname: string
): 'cosmos' | 'ciclos' | 'tarefas' | 'emocoes' | 'comunidade' | 'perfil' | 'timeline' | 'public' | 'auth' {
  if (pathname.startsWith('/cosmos')) return 'cosmos';
  if (pathname.startsWith('/ciclos')) return 'ciclos';
  if (pathname.startsWith('/tarefas')) return 'tarefas';
  if (pathname.startsWith('/emocoes')) return 'emocoes';
  if (pathname.startsWith('/comunidade')) return 'comunidade';
  if (pathname.startsWith('/perfil')) return 'perfil';
  if (pathname.startsWith('/timeline')) return 'timeline';
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) return 'auth';
  return 'public';
}

// ==========================================
// 📤 BARREL EXPORT
// ==========================================

export const ROUTES = {
  PUBLIC: PUBLIC_ROUTES,
  AUTH: AUTH_ROUTES,
  COSMOS: COSMOS_ROUTES,
  CICLOS: CICLOS_ROUTES,
  TAREFAS: TAREFAS_ROUTES,
  EMOCOES: EMOCOES_ROUTES,
  COMUNIDADE: COMUNIDADE_ROUTES,
  PERFIL: PERFIL_ROUTES,
  TIMELINE: TIMELINE_ROUTES,
  API: API_ROUTES,
  DEEP_LINKS,
} as const;

export default ROUTES;
