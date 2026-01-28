/**
 * 📍 Rota: /ciclos
 *
 * Redireciona para /cosmos/lua onde o menu de ciclos está disponível.
 * O hub central foi substituído pelo menu dropdown LuaCycleMenu.
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import { redirect } from 'next/navigation';

export default function CiclosPage() {
  redirect('/cosmos/lua');
}
