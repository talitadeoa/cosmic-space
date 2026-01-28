/**
 * Componente CommunityFiltersBar - Barra de filtros com chips e indicador de filtros ativos
 */

import { CategoryChips } from '../components';
import type { PostType } from '../hooks';

export interface CommunityFiltersBarProps {
  activeType: PostType;
  onTypeChange: (type: PostType) => void;
  activeTag: string;
  onTagChange: (tag: string) => void;
  tagFilters: string[];
  typeFilters: PostType[];
  searchQuery: string;
  onResetFilters: () => void;
}

export const CommunityFiltersBar = ({
  activeType,
  onTypeChange,
  activeTag,
  onTagChange,
  tagFilters,
  typeFilters,
  searchQuery,
  onResetFilters,
}: CommunityFiltersBarProps) => {
  const hasActiveFilters = activeType !== 'Todos' || activeTag !== 'Todos' || searchQuery;

  return (
    <>
      {/* Filtros por tipo */}
      <section className="mt-6" aria-label="Filtros de tipo">
        <CategoryChips<PostType>
          items={typeFilters}
          activeItem={activeType}
          onSelect={onTypeChange}
          variant="type"
          ariaLabel="Filtrar por tipo de post"
        />
      </section>

      {/* Filtros por tag */}
      {tagFilters.length > 1 && (
        <section className="mt-3" aria-label="Filtros de tag">
          <CategoryChips<string>
            items={tagFilters}
            activeItem={activeTag}
            onSelect={onTagChange}
            variant="tag"
            ariaLabel="Filtrar por tag"
          />
        </section>
      )}

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {searchQuery && (
            <span className="rounded-full border border-slate-700/70 bg-black/30 px-3 py-1">
              Busca: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
          {activeType !== 'Todos' && (
            <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-sky-300">
              {activeType}
            </span>
          )}
          {activeTag !== 'Todos' && (
            <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-indigo-300">
              #{activeTag}
            </span>
          )}
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-full border border-slate-700/70 bg-slate-800/50 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </>
  );
};
