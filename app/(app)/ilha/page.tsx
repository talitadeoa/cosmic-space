/**
 * 🔄 Redirect: /ilha → /tarefas
 *
 * Mantém compatibilidade com URLs antigas.
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export default function IlhaRedirect() {
  redirect(ROUTES.TAREFAS.HOME);
}
