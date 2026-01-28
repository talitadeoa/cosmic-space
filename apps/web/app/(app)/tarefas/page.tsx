/**
 * 📍 Rota: /tarefas
 *
 * Página principal de tarefas com seletor de ilhas.
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import styles from '@/components/tarefas/island-selector.module.css';
import { IslandSelector } from '@/components/tarefas';

export default function TarefasPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Ilhas de Tarefas</h1>
      <p className={styles.subtitle}>
        Clique em uma ilha para abrir o painel de inputs e registrar informações daquela área do
        seu mundo.
      </p>
      <IslandSelector />
    </main>
  );
}
