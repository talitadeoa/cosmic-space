import React from 'react';

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
      className="flex min-w-max items-center justify-start"
      style={{ minWidth: trackWidth, columnGap: gap }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`skeleton-${idx}`}
          className="animate-pulse rounded-full bg-slate-700/50 ring-1 ring-white/5"
          style={{ width: tileWidth, height: moonHeight }}
        />
      ))}
    </div>
  );
};

export default MoonRowSkeleton;
