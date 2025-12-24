'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import styles from './ilha.module.css';

type IslandId = 'ilha1' | 'ilha2' | 'ilha3' | 'ilha4';

type IslandData = {
  titulo: string;
  tag: string;
  descricao: string;
  energia: number | null;
  prioridade: number | null;
};

type FormState = {
  titulo: string;
  tag: string;
  descricao: string;
  energia: string;
  prioridade: string;
};

const markers: { id: IslandId; nome: string; label: string }[] = [
  { id: 'ilha1', nome: 'Plataforma Criativa', label: 'ILHA 1' },
  { id: 'ilha2', nome: 'Pier da Comunidade', label: 'ILHA 2' },
  { id: 'ilha3', nome: 'Ilha Central', label: 'ILHA 3' },
  { id: 'ilha4', nome: 'Ilha da Visão', label: 'ILHA 4' },
];

const createEmptyIsland = (): IslandData => ({
  titulo: '',
  tag: '',
  descricao: '',
  energia: null,
  prioridade: null,
});

const emptyFormState: FormState = {
  titulo: '',
  tag: '',
  descricao: '',
  energia: '',
  prioridade: '',
};

export default function IlhaClient() {
  const [ilhas, setIlhas] = useState<Record<IslandId, IslandData>>({
    ilha1: createEmptyIsland(),
    ilha2: createEmptyIsland(),
    ilha3: createEmptyIsland(),
    ilha4: createEmptyIsland(),
  });
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [ilhaSelecionada, setIlhaSelecionada] = useState<IslandId | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const isLocked = !ilhaSelecionada;

  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.id === ilhaSelecionada),
    [ilhaSelecionada]
  );

  const handleMarkerClick = (id: IslandId) => {
    setIlhaSelecionada(id);
    const dados = ilhas[id];

    setFormState({
      titulo: dados.titulo || '',
      tag: dados.tag || '',
      descricao: dados.descricao || '',
      energia: dados.energia !== null && dados.energia !== undefined ? String(dados.energia) : '',
      prioridade:
        dados.prioridade !== null && dados.prioridade !== undefined ? String(dados.prioridade) : '',
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ilhaSelecionada) {
      return;
    }

    const dados: IslandData = {
      titulo: formState.titulo.trim(),
      tag: formState.tag.trim(),
      descricao: formState.descricao.trim(),
      energia: formState.energia !== '' ? Number(formState.energia) : null,
      prioridade: formState.prioridade !== '' ? Number(formState.prioridade) : null,
    };

    setIlhas((prev) => ({
      ...prev,
      [ilhaSelecionada]: dados,
    }));
    setHasSaved(true);
  };

  const handleChange =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const hasData = useMemo(
    () =>
      Object.values(ilhas).some(
        (ilha) =>
          ilha.titulo ||
          ilha.tag ||
          ilha.descricao ||
          ilha.energia !== null ||
          ilha.prioridade !== null
      ),
    [ilhas]
  );

  const shouldShowJson = hasSaved || hasData;

  return (
    <div className={styles.appGrid}>
      <section className={styles.mapWrapper} aria-label="Mapa de ilhas">
        <div className={styles.mapInner}>
          <img src="/ilhas-talita.png" alt="Arquipélago criativo" />

          {markers.map((marker) => {
            const isActive = marker.id === ilhaSelecionada;
            return (
              <button
                key={marker.id}
                type="button"
                data-id={marker.id}
                data-nome={marker.nome}
                onClick={() => handleMarkerClick(marker.id)}
                className={`${styles.islandMarker} ${isActive ? styles.islandMarkerActive : ''}`}
              >
                <div className={styles.markerDot} />
                <span className={styles.markerLabel}>{marker.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <span className={styles.islandNameHighlight}>
              {selectedMarker ? selectedMarker.nome : 'Escolha uma ilha'}
            </span>
          </h2>
          <span className={styles.panelPill}>
            {ilhaSelecionada ? ilhaSelecionada.toUpperCase() : 'Nenhuma ilha selecionada'}
          </span>
        </header>

        <p className={styles.panelSubtitle}>
          {ilhaSelecionada
            ? 'Edite os campos abaixo para registrar as informações desta ilha.'
            : 'Clique em um marcador no mapa para começar a editar as informações daquela ilha.'}
        </p>

        <form
          id="form-ilha"
          className={`${styles.form} ${isLocked ? styles.formLocked : ''}`}
          onSubmit={handleSubmit}
          aria-disabled={isLocked}
        >
          <div className={styles.panelRow}>
            <label className={styles.formLabel}>
              Título da ilha
              <input
                type="text"
                name="titulo"
                placeholder="Ex.: Laboratório de Ideias"
                autoComplete="off"
                value={formState.titulo}
                onChange={handleChange('titulo')}
                className={styles.field}
                disabled={isLocked}
              />
            </label>
            <label className={styles.formLabel}>
              Palavra-chave
              <input
                type="text"
                name="tag"
                placeholder="Ex.: pesquisa, música, cuidado"
                autoComplete="off"
                value={formState.tag}
                onChange={handleChange('tag')}
                className={styles.field}
                disabled={isLocked}
              />
            </label>
          </div>

          <label className={styles.formLabel}>
            Descrição / notas
            <textarea
              name="descricao"
              rows={4}
              placeholder="O que acontece nesta ilha? Que tipo de experiências, rituais, pesquisas, encontros?"
              value={formState.descricao}
              onChange={handleChange('descricao')}
              className={`${styles.field} ${styles.textArea}`}
              disabled={isLocked}
            />
          </label>

          <div className={styles.panelRow}>
            <label className={styles.formLabel}>
              Nível de energia (0–10)
              <input
                type="number"
                name="energia"
                min={0}
                max={10}
                placeholder="7"
                value={formState.energia}
                onChange={handleChange('energia')}
                className={styles.field}
                disabled={isLocked}
              />
            </label>
            <label className={styles.formLabel}>
              Prioridade (0–10)
              <input
                type="number"
                name="prioridade"
                min={0}
                max={10}
                placeholder="5"
                value={formState.prioridade}
                onChange={handleChange('prioridade')}
                className={styles.field}
                disabled={isLocked}
              />
            </label>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLocked}>
            {ilhaSelecionada ? 'Salvar dados da ilha' : 'Selecione uma ilha'}
            <span aria-hidden>➜</span>
          </button>
        </form>

        <div className={styles.result} id="resultado">
          {shouldShowJson ? (
            <pre>{JSON.stringify(ilhas, null, 2)}</pre>
          ) : (
            <div className={styles.resultPlaceholder}>
              Assim que você salvar algo, os dados estruturados da ilha aparecem aqui em JSON.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
