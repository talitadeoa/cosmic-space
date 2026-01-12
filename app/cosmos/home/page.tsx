'use client';

import { HomeViewSwitcher } from './components';

/**
 * Página Home - Modo Interativo
 * 
 * Visualização com esferas 3D interativas.
 * O componente HomeViewSwitcher unifica a lógica de navegação e animação
 * entre os dois modos de visualização (interativo e panorâmico).
 */
const HomePage = () => {
  return <HomeViewSwitcher initialView="interactive" />;
};

export default HomePage;
