'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNativeGestures } from '@/hooks/useNativeGestures';

export interface BottomSheetProps {
  /** Controla se o sheet está aberto */
  isOpen: boolean;
  /** Callback quando o sheet fecha */
  onClose: () => void;
  /** Conteúdo do sheet */
  children: React.ReactNode;
  /** Altura inicial em % da tela (0-100) */
  initialHeight?: number;
  /** Alturas de snap points em % */
  snapPoints?: number[];
  /** Permite fechar arrastando para baixo */
  dismissible?: boolean;
  /** Mostra handle de arrasto */
  showHandle?: boolean;
  /** Cor de fundo */
  backgroundColor?: string;
  /** Backdrop blur */
  backdropBlur?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Bottom Sheet com gestos nativos
 * 
 * @example
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   snapPoints={[25, 50, 90]}
 * >
 *   <SheetContent />
 * </BottomSheet>
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  initialHeight = 50,
  snapPoints = [25, 50, 90],
  dismissible = true,
  showHandle = true,
  backgroundColor = 'rgba(10, 15, 30, 0.95)',
  backdropBlur = true,
  className = '',
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialHeight);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const startHeight = useRef(initialHeight);

  const { hapticPattern, triggerHaptic } = useNativeGestures({}, { hapticFeedback: true });

  const y = useMotionValue(0);
  const backdropOpacity = useTransform(
    y,
    [0, window.innerHeight * 0.5],
    [0.5, 0]
  );

  /**
   * Encontra o snap point mais próximo
   */
  const findNearestSnap = useCallback((height: number): number => {
    return snapPoints.reduce((prev, curr) =>
      Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev
    );
  }, [snapPoints]);

  /**
   * Handler para início do arrasto
   */
  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    startHeight.current = currentSnap;
  }, [currentSnap]);

  /**
   * Handler para movimento de arrasto
   */
  const handleDrag = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = dragStartY.current - clientY;
    const screenHeight = window.innerHeight;
    const heightDiff = (diff / screenHeight) * 100;
    
    let newHeight = startHeight.current + heightDiff;
    
    // Limita entre 0 e o maior snap point
    const maxSnap = Math.max(...snapPoints);
    newHeight = Math.max(0, Math.min(maxSnap + 10, newHeight));
    
    setCurrentSnap(newHeight);
  }, [snapPoints]);

  /**
   * Handler para fim do arrasto
   */
  const handleDragEnd = useCallback(async () => {
    const nearestSnap = findNearestSnap(currentSnap);
    
    // Se arrastou muito para baixo, fecha
    if (dismissible && currentSnap < Math.min(...snapPoints) / 2) {
      await triggerHaptic('light');
      onClose();
      return;
    }
    
    // Snap para o ponto mais próximo
    if (nearestSnap !== currentSnap) {
      await hapticPattern('selection');
    }
    setCurrentSnap(nearestSnap);
  }, [currentSnap, snapPoints, dismissible, findNearestSnap, onClose, hapticPattern, triggerHaptic]);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(initialHeight);
    }
  }, [isOpen, initialHeight]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-40 ${backdropBlur ? 'backdrop-blur-sm' : ''}`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={dismissible ? onClose : undefined}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: `${100 - currentSnap}%` }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden ${className}`}
            style={{
              backgroundColor,
              height: '100%',
              maxHeight: `${Math.max(...snapPoints)}%`,
            }}
          >
            {/* Handle */}
            {showHandle && (
              <div
                className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                onTouchStart={handleDragStart}
                onTouchMove={handleDrag}
                onTouchEnd={handleDragEnd}
                onMouseDown={handleDragStart}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
              >
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>
            )}

            {/* Content */}
            <div
              className="h-full overflow-auto"
              style={{ paddingTop: showHandle ? 32 : 0 }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface ActionSheetOption {
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface ActionSheetProps {
  /** Controla se o sheet está aberto */
  isOpen: boolean;
  /** Callback quando o sheet fecha */
  onClose: () => void;
  /** Título do action sheet */
  title?: string;
  /** Mensagem descritiva */
  message?: string;
  /** Opções do menu */
  options: ActionSheetOption[];
  /** Texto do botão cancelar */
  cancelText?: string;
}

/**
 * Action Sheet estilo iOS com gestos nativos
 * 
 * @example
 * <ActionSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Ações"
 *   options={[
 *     { label: 'Editar', icon: '✏️', onPress: handleEdit },
 *     { label: 'Excluir', icon: '🗑️', destructive: true, onPress: handleDelete },
 *   ]}
 * />
 */
export function ActionSheet({
  isOpen,
  onClose,
  title,
  message,
  options,
  cancelText = 'Cancelar',
}: ActionSheetProps) {
  const { triggerHaptic } = useNativeGestures({}, { hapticFeedback: true });

  const handleOptionPress = useCallback(async (option: ActionSheetOption) => {
    if (option.disabled) return;
    
    await triggerHaptic(option.destructive ? 'warning' : 'light');
    option.onPress();
    onClose();
  }, [triggerHaptic, onClose]);

  const handleCancel = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [triggerHaptic, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
          >
            {/* Options container */}
            <div className="bg-gray-900/95 rounded-2xl overflow-hidden mb-2">
              {/* Header */}
              {(title || message) && (
                <div className="px-4 py-3 text-center border-b border-white/10">
                  {title && (
                    <p className="text-sm font-semibold text-white/60">{title}</p>
                  )}
                  {message && (
                    <p className="text-xs text-white/40 mt-1">{message}</p>
                  )}
                </div>
              )}

              {/* Options */}
              {options.map((option, index) => (
                <motion.button
                  key={option.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionPress(option)}
                  disabled={option.disabled}
                  className={`
                    w-full px-4 py-4 flex items-center justify-center gap-3
                    ${index > 0 ? 'border-t border-white/10' : ''}
                    ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'active:bg-white/10'}
                    ${option.destructive ? 'text-red-400' : 'text-white'}
                  `}
                >
                  {option.icon && <span className="text-lg">{option.icon}</span>}
                  <span className="font-medium">{option.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Cancel button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="w-full py-4 bg-gray-900/95 rounded-2xl text-white font-semibold active:bg-white/10"
            >
              {cancelText}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
