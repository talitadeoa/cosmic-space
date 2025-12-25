import React from 'react';
import type { buildMoonInfo } from '@/app/cosmos/utils/luaList';

type HighlightBannerProps = {
  info: ReturnType<typeof buildMoonInfo>;
  onClick: () => void;
};

const HighlightBanner: React.FC<HighlightBannerProps> = ({ info, onClick }) => (
  <div className="mb-4 flex justify-center">
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-sky-300/30 bg-slate-900/80 px-4 py-3 text-[11px] text-slate-100 shadow-lg shadow-sky-900/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60"
    >
      <span className="flex h-2.5 w-2.5 items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-sky-300/90 shadow-[0_0_12px_rgba(125,211,252,0.9)] animate-pulse" />
      </span>
      <span className="font-semibold">{info.phaseLabel}</span>
      <span className="text-slate-300/80">{info.monthName}</span>
      <span className="text-slate-300/80">{info.signLabel}</span>
    </button>
  </div>
);

export default HighlightBanner;
