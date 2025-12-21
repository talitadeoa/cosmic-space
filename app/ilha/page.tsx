import styles from "./ilha.module.css";
import IlhaClient from "./IlhaClient";

export default function IlhaPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Ilhas Interativas</h1>
      <p className={styles.subtitle}>
        Clique em uma ilha / plataforma na imagem para abrir o painel de inputs e registrar
        informações daquela “ilha” do seu mundo.
      </p>
      <IlhaClient />
    </main>
  );
}
