'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface KeyboardNavigationOptions {
  /** Habilita navegação por setas */
  enableArrowKeys?: boolean;
  /** Habilita Home/End */
  enableHomeEnd?: boolean;
  /** Habilita Escape para fechar/cancelar */
  enableEscape?: boolean;
  /** Habilita Enter/Space para ação */
  enableEnterSpace?: boolean;
  /** Direção da navegação */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Callback quando tecla de seta é pressionada */
  onArrowKey?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Callback quando Home é pressionado */
  onHome?: () => void;
  /** Callback quando End é pressionado */
  onEnd?: () => void;
  /** Callback quando Escape é pressionado */
  onEscape?: () => void;
  /** Callback quando Enter ou Space é pressionado */
  onEnterSpace?: () => void;
  /** Previne comportamento padrão das teclas */
  preventDefault?: boolean;
}

/**
 * Hook para navegação por teclado acessível
 * 
 * Fornece suporte consistente a:
 * - Arrow Keys (setas) para navegação
 * - Home/End para ir ao início/fim
 * - Escape para fechar/cancelar
 * - Enter/Space para ações
 * 
 * @example
 * const { handleKeyDown, keyboardProps } = useKeyboardNavigation({
 *   orientation: 'horizontal',
 *   onArrowKey: (dir) => moveItem(dir),
 *   onEscape: () => closeMenu(),
 * });
 * 
 * <div {...keyboardProps}>...</div>
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    enableArrowKeys = true,
    enableHomeEnd = true,
    enableEscape = true,
    enableEnterSpace = true,
    orientation = 'both',
    onArrowKey,
    onHome,
    onEnd,
    onEscape,
    onEnterSpace,
    preventDefault = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      const key = event.key;

      // Arrow Keys
      if (enableArrowKeys && onArrowKey) {
        const arrowMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right',
        };

        const direction = arrowMap[key];
        if (direction) {
          // Filtra baseado na orientação
          const isVertical = direction === 'up' || direction === 'down';
          const isHorizontal = direction === 'left' || direction === 'right';

          if (
            orientation === 'both' ||
            (orientation === 'vertical' && isVertical) ||
            (orientation === 'horizontal' && isHorizontal)
          ) {
            if (preventDefault) event.preventDefault();
            onArrowKey(direction);
            return;
          }
        }
      }

      // Home/End
      if (enableHomeEnd) {
        if (key === 'Home' && onHome) {
          if (preventDefault) event.preventDefault();
          onHome();
          return;
        }
        if (key === 'End' && onEnd) {
          if (preventDefault) event.preventDefault();
          onEnd();
          return;
        }
      }

      // Escape
      if (enableEscape && key === 'Escape' && onEscape) {
        if (preventDefault) event.preventDefault();
        onEscape();
        return;
      }

      // Enter/Space
      if (enableEnterSpace && (key === 'Enter' || key === ' ') && onEnterSpace) {
        if (preventDefault) event.preventDefault();
        onEnterSpace();
        return;
      }
    },
    [
      enableArrowKeys,
      enableHomeEnd,
      enableEscape,
      enableEnterSpace,
      orientation,
      onArrowKey,
      onHome,
      onEnd,
      onEscape,
      onEnterSpace,
      preventDefault,
    ]
  );

  // Props para espalhar em elementos focáveis
  const keyboardProps = {
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    role: 'group' as const,
  };

  return {
    handleKeyDown,
    keyboardProps,
  };
}

/**
 * Hook para navegação por índice em lista
 * 
 * @example
 * const { currentIndex, handlers } = useListKeyboardNavigation({
 *   itemCount: items.length,
 *   onSelect: (index) => selectItem(index),
 *   onClose: () => setOpen(false),
 * });
 */
export function useListKeyboardNavigation(options: {
  /** Número total de itens */
  itemCount: number;
  /** Índice inicial */
  initialIndex?: number;
  /** Permite loop circular */
  loop?: boolean;
  /** Orientação da lista */
  orientation?: 'horizontal' | 'vertical';
  /** Callback ao selecionar item */
  onSelect?: (index: number) => void;
  /** Callback ao mudar de item */
  onChange?: (index: number) => void;
  /** Callback ao fechar/cancelar */
  onClose?: () => void;
}) {
  const {
    itemCount,
    initialIndex = 0,
    loop = true,
    orientation = 'vertical',
    onSelect,
    onChange,
    onClose,
  } = options;

  const currentIndexRef = useRef(initialIndex);

  const moveTo = useCallback(
    (index: number) => {
      currentIndexRef.current = index;
      onChange?.(index);
    },
    [onChange]
  );

  const moveNext = useCallback(() => {
    let next = currentIndexRef.current + 1;
    if (next >= itemCount) {
      next = loop ? 0 : itemCount - 1;
    }
    moveTo(next);
  }, [itemCount, loop, moveTo]);

  const movePrev = useCallback(() => {
    let prev = currentIndexRef.current - 1;
    if (prev < 0) {
      prev = loop ? itemCount - 1 : 0;
    }
    moveTo(prev);
  }, [itemCount, loop, moveTo]);

  const moveToFirst = useCallback(() => {
    moveTo(0);
  }, [moveTo]);

  const moveToLast = useCallback(() => {
    moveTo(itemCount - 1);
  }, [itemCount, moveTo]);

  const select = useCallback(() => {
    onSelect?.(currentIndexRef.current);
  }, [onSelect]);

  const { handleKeyDown } = useKeyboardNavigation({
    orientation,
    onArrowKey: (direction) => {
      if (orientation === 'vertical') {
        if (direction === 'down') moveNext();
        if (direction === 'up') movePrev();
      } else {
        if (direction === 'right') moveNext();
        if (direction === 'left') movePrev();
      }
    },
    onHome: moveToFirst,
    onEnd: moveToLast,
    onEscape: onClose,
    onEnterSpace: select,
  });

  return {
    currentIndex: currentIndexRef.current,
    handlers: {
      onKeyDown: handleKeyDown,
      tabIndex: 0,
    },
    moveTo,
    moveNext,
    movePrev,
    moveToFirst,
    moveToLast,
    select,
  };
}

/**
 * Hook para adicionar listener global de teclado
 * 
 * @example
 * useGlobalKeyboardShortcut('Escape', () => closeModal());
 */
export function useGlobalKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    enabled?: boolean;
    preventDefault?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  } = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key !== key) return;
      if (ctrlKey && !event.ctrlKey) return;
      if (shiftKey && !event.shiftKey) return;
      if (altKey && !event.altKey) return;
      if (metaKey && !event.metaKey) return;

      if (preventDefault) event.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, enabled, preventDefault, ctrlKey, shiftKey, altKey, metaKey]);
}
