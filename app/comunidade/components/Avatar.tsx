'use client';

import { memo, useState } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  src?: string | null;
  alt: string;
  name: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join('') || 'U';
};

/**
 * Avatar com fallback para iniciais
 * Acessível com alt text e role img
 */
export const Avatar = memo(function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const showImage = src && !hasError;
  const initials = getInitials(name);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700/70 bg-gradient-to-br from-slate-800 to-slate-900 font-semibold text-slate-200 ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={alt}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
});
