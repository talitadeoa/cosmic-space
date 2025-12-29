'use client';

import React from 'react';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';

type QuarterlyModalLayerProps = {
  isOpen: boolean;
  storageKey: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  badge: string;
  placeholder: string;
  systemGreeting: string;
  systemQuestion: string;
  systemResponses: string[];
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
};

const QuarterlyModalLayer: React.FC<QuarterlyModalLayerProps> = ({
  isOpen,
  storageKey,
  title,
  eyebrow,
  subtitle,
  badge,
  placeholder,
  systemGreeting,
  systemQuestion,
  systemResponses,
  onClose,
  onSubmit,
}) => {
  return (
    <CosmosChatModal
      isOpen={isOpen}
      requiresAuthOnSave
      storageKey={storageKey}
      title={title}
      eyebrow={eyebrow}
      subtitle={subtitle}
      badge={badge}
      placeholder={placeholder}
      systemGreeting={systemGreeting}
      systemQuestion={systemQuestion}
      submitLabel="✨ Concluir insight trimestral"
      tone="sky"
      systemResponses={systemResponses}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

export default QuarterlyModalLayer;
