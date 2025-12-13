import React from "react";

type MoonRowSkeletonProps = {
  count: number;
  trackWidth: number;
  tileWidth: number;
  gap: number;
};

const MoonRowSkeleton: React.FC<MoonRowSkeletonProps> = ({ count, trackWidth, tileWidth, gap }) => {
  const moonHeight = Math.max(56, Math.round(tileWidth * 0.7));

  return (
    <div
      className="flex min-w-max flex-col items-center gap-6"
      style={{ minWidth: trackWidth }}
    >
      <div className="flex min-w-max items-center" style={{ columnGap: gap }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={`skeleton-top-${idx}`}
            className="animate-pulse rounded-full bg-slate-700/50 ring-1 ring-white/5"
            style={{ width: tileWidth, height: moonHeight }}
          />
        ))}
      </div>
      <div className="h-0.5 w-full animate-pulse bg-slate-700/70" style={{ minWidth: trackWidth }} />
      <div className="flex min-w-max items-center" style={{ columnGap: gap }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={`skeleton-bottom-${idx}`}
            className="animate-pulse rounded-full bg-slate-700/50 ring-1 ring-white/5"
            style={{ width: tileWidth, height: moonHeight }}
          />
        ))}
      </div>
    </div>
  );
};

export default MoonRowSkeleton;
