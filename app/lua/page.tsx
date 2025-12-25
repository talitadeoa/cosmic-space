import type { Metadata } from 'next';
import LuaScreen from './layers/screen/LuaScreen';

export const metadata: Metadata = {
  title: 'Lua | Cosmic Space',
  description: 'Explore o carrossel lunar completo com insights e sincronizações dedicadas.',
};

const LuaPage = () => {
  return <LuaScreen />;
};

export default LuaPage;
