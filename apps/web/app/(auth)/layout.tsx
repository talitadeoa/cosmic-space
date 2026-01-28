/**
 * 🔓 Layout para rotas de autenticação
 *
 * Este grupo contém rotas de login/signup.
 * Layout minimalista sem navegação.
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-space-dark bg-cosmic-gradient">
      {children}
    </main>
  );
}
