import React from 'react';
import type { buildMoonInfo } from '@/app/cosmos/utils/luaList';

type HighlightBannerProps = {
  info: ReturnType<typeof buildMoonInfo>;
  onClick: () => void;
};

const HighlightBanner: React.FC<HighlightBannerProps> = ({ info, onClick }) => (
  <div className="mb-2 flex justify-center sm:mb-4">
    <button
      type="button"
      onClick={onClick}
      className="flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-xl border border-sky-300/30 bg-slate-900/80 px-2 py-1.5 text-[9px] text-slate-100 shadow-lg shadow-sky-900/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60 sm:gap-2 sm:rounded-full sm:px-4 sm:py-3 sm:text-[12px]"
    >
      <span className="flex h-2 w-2 items-center justify-center sm:h-2.5 sm:w-2.5">
        <span className="h-2 w-2 rounded-full bg-sky-300/90 shadow-[0_0_12px_rgba(125,211,252,0.9)] animate-pulse sm:h-2.5 sm:w-2.5" />
      </span>
      <span className="font-semibold">{info.phaseLabel}</span>
      <span className="text-slate-300/80">{info.signLabel}</span>
    </button>
  </div>
);

export default HighlightBanner;
