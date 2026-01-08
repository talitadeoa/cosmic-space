/**
 * 📍 Rota: /tarefas
 *
 * Página principal de tarefas (anteriormente /ilha).
 * Migração: /ilha → /tarefas
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import styles from '@/app/ilha/ilha.module.css';
import IlhaClient from '@/app/ilha/IlhaClient';

export default function TarefasPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Ilhas de Tarefas</h1>
      <p className={styles.subtitle}>
        Clique em uma ilha para abrir o painel de inputs e registrar informações daquela área do
        seu mundo.
      </p>
      <IlhaClient />
    </main>
  );
}
