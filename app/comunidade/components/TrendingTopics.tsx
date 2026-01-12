'use client';

import { memo } from 'react';
import { FireIcon, ArrowTrendingUpIcon } from './icons';

type Topic = {
  id: string;
  name: string;
  postsCount: number;
  trend: 'rising' | 'stable' | 'hot';
};

type TrendingTopicsProps = {
  topics?: Topic[];
  onTopicClick?: (topic: Topic) => void;
};

const defaultTopics: Topic[] = [
  { id: '1', name: 'rituais', postsCount: 23, trend: 'hot' },
  { id: '2', name: 'lua-cheia', postsCount: 18, trend: 'rising' },
  { id: '3', name: 'reflexões', postsCount: 15, trend: 'stable' },
  { id: '4', name: 'planejamento', postsCount: 12, trend: 'rising' },
  { id: '5', name: 'autocuidado', postsCount: 9, trend: 'stable' },
];

const trendColors = {
  hot: 'text-orange-400 bg-orange-500/20 border-orange-400/40',
  rising: 'text-emerald-400 bg-emerald-500/20 border-emerald-400/40',
  stable: 'text-slate-400 bg-slate-500/20 border-slate-600/40',
};

/**
 * Tópicos em alta na comunidade
 * Mostra tags mais populares do momento
 */
export const TrendingTopics = memo(function TrendingTopics({
  topics = defaultTopics,
  onTopicClick,
}: TrendingTopicsProps) {
  return (
    <section
      className="rounded-2xl border border-slate-800/70 bg-black/40 p-4 sm:p-5"
      aria-labelledby="trending-heading"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/30 to-rose-500/30">
          <FireIcon className="h-4 w-4 text-orange-300" />
        </div>
        <h2 id="trending-heading" className="text-lg font-semibold text-white">
          Em alta agora
        </h2>
      </div>

      <ul className="mt-4 space-y-2.5" role="list">
        {topics.map((topic, index) => (
          <li key={topic.id}>
            <button
              type="button"
              onClick={() => onTopicClick?.(topic)}
              className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-800/40"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800/80 text-xs font-medium text-slate-400">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white group-hover:text-indigo-300">
                  #{topic.name}
                </span>
                <span className="text-xs text-slate-500">{topic.postsCount} posts</span>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${trendColors[topic.trend]}`}
              >
                {topic.trend === 'hot' && (
                  <>
                    <FireIcon className="h-3 w-3" />
                    HOT
                  </>
                )}
                {topic.trend === 'rising' && (
                  <>
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    +{Math.floor(Math.random() * 50 + 10)}%
                  </>
                )}
                {topic.trend === 'stable' && '—'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
});
