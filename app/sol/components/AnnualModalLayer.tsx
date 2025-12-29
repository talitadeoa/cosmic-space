'use client';

import React from 'react';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';

type AnnualModalLayerProps = {
  isOpen: boolean;
  storageKey: string;
  title: string;
  subtitle: string;
  displayYear: number;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
};

const AnnualModalLayer: React.FC<AnnualModalLayerProps> = ({
  isOpen,
  storageKey,
  title,
  subtitle,
  displayYear,
  onClose,
  onSubmit,
}) => {
  return (
    <CosmosChatModal
      isOpen={isOpen}
      requiresAuthOnSave
      storageKey={storageKey}
      title={title}
      eyebrow="Insight Anual"
      subtitle={subtitle}
      placeholder="Escreva sua reflexão, aprendizados e conquistas do ano..."
      systemGreeting={`Bem-vindo ao seu insight anual de ${displayYear}`}
      systemQuestion="Qual foi a essência do seu ano? ☀️"
      submitLabel="✨ Concluir insight anual"
      tone="amber"
      systemResponses={[
        'Que ano cheio de significado! ✨',
        'Seu caminho ficou ainda mais claro. ☀️',
        'Lindo fechamento de ciclo. 🌟',
      ]}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

export default AnnualModalLayer;
