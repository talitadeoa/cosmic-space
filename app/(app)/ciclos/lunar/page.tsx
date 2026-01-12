/**
 * 📍 Rota: /ciclos/lunar
 *
 * Experiência do ciclo lunar.
 * Migração: /cosmos/lua → /ciclos/lunar
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

'use client';

import { SpacePageLayout } from '@/components/layouts';
import { useRouter } from 'next/navigation';
import { useCosmosNavigationSafe } from '@/app/cosmos/context/CosmosNavigationContext';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import LuaScreen from '@/app/cosmos/lua/screen/LuaScreen';
import LuaCycleMenu from '@/app/cosmos/lua/components/LuaCycleMenu';

export default function CicloLunarPage() {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
        <LuaCycleMenu currentPath="/ciclos/lunar" />
      </div>
      <LuaScreen />
    </SpacePageLayout>
  );
}
