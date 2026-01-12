'use client';

import { memo, useState, useCallback } from 'react';

type FollowButtonProps = {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
};

type ButtonState = 'idle' | 'loading' | 'hover';

export const FollowButton = memo(function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  size = 'md',
  showText = true,
  className = '',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [error, setError] = useState('');

  const handleClick = useCallback(async () => {
    if (buttonState === 'loading') return;

    setButtonState('loading');
    setError('');

    try {
      const response = await fetch('/api/community/follows', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setIsFollowing(data.isFollowing);
          onFollowChange?.(data.isFollowing);
        } else {
          throw new Error(data.error || 'Erro ao atualizar');
        }
      } else {
        setIsFollowing(data.isFollowing);
        onFollowChange?.(data.isFollowing);
      }
    } catch (err) {
      console.error('Erro ao seguir/deixar de seguir:', err);
      setError('Erro. Tente novamente.');
      setTimeout(() => setError(''), 2000);
    } finally {
      setButtonState('idle');
    }
  }, [isFollowing, userId, onFollowChange, buttonState]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-2.5 text-base min-h-[48px]',
  };

  const getVariantClasses = () => {
    if (isFollowing) {
      return `
        border border-slate-600 bg-transparent text-slate-300
        hover:border-rose-400/70 hover:bg-rose-500/10 hover:text-rose-300
      `;
    }
    return `
      border border-indigo-500 bg-indigo-500/90 text-white
      hover:bg-indigo-500
    `;
  };

  const getText = () => {
    if (buttonState === 'loading') return 'Aguarde...';
    if (error) return error;
    if (isFollowing && buttonState === 'hover') return 'Deixar de seguir';
    if (isFollowing) return 'Seguindo';
    return 'Seguir';
  };

  const getIcon = () => {
    if (buttonState === 'loading') {
      return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }

    if (isFollowing) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setButtonState((s) => (s === 'idle' ? 'hover' : s))}
      onMouseLeave={() => setButtonState((s) => (s === 'hover' ? 'idle' : s))}
      disabled={buttonState === 'loading'}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full
        font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
        disabled:cursor-wait disabled:opacity-70
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${className}
      `}
      aria-label={isFollowing ? 'Deixar de seguir' : 'Seguir'}
      aria-pressed={isFollowing}
    >
      {getIcon()}
      {showText && <span className="whitespace-nowrap">{getText()}</span>}
    </button>
  );
});
