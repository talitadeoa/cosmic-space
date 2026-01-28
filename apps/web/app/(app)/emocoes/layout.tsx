import type { Metadata } from 'next';

/**
 * 💜 Layout para o domínio de Emoções
 *
 * Agrega:
 * - Timeline emocional (antes: /timeline)
 * - Registro de emoções (antes: /perfil/emocoes)
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

export const metadata: Metadata = {
  title: {
    template: '%s | Emoções - Flua',
    default: 'Emoções',
  },
  description: 'Registre e acompanhe suas emoções ao longo do tempo',
  keywords: ['emoções', 'bem-estar', 'rastreamento emocional', 'saúde mental'],
  openGraph: {
    title: 'Emoções - Flua',
    description: 'Registre e acompanhe suas emoções',
  },
};

export default function EmocoesLayout({ children }: { children: React.ReactNode }) {
  return <section className="min-h-screen w-full">{children}</section>;
}
