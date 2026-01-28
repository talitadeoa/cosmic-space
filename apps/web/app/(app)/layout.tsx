/**
 * 🔐 Layout para rotas autenticadas (app principal)
 *
 * Este grupo contém todas as rotas que requerem autenticação.
 * NavMenu e RadioPlayer são herdados do root layout (app/layout.tsx).
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1">{children}</main>;
}
