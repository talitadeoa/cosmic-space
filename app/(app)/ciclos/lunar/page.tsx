/**
 * 📍 Rota: /ciclos/lunar
 *
 * Experiência do ciclo lunar.
 * Migração: /cosmos/lua → /ciclos/lunar
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

'use client';

import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import LuaScreen from '@/app/cosmos/lua/screen/LuaScreen';
import { ROUTES } from '@/lib/routes';

export default function CicloLunarPage() {
  const router = useRouter();

  return (
    <SpacePageLayout onBackgroundClick={() => router.push(ROUTES.CICLOS.HOME)}>
      <LuaScreen />
    </SpacePageLayout>
  );
}
