/**
 * 🔐 Layout para rotas autenticadas (app principal)
 *
 * Este grupo contém todas as rotas que requerem autenticação.
 * Inclui:
 * - NavMenu (navegação principal)
 * - RadioPlayer (player de áudio)
 * - Estrutura base do app
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import { RadioPlayer } from '@/components/audio';
import { NavMenu } from '@/components/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <>
      <NavMenu showDevRoutes={isDev} />
      <main className="flex-1">{children}</main>
      <RadioPlayer />
    </>
  );
}
