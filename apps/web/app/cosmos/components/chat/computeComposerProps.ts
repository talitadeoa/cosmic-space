/**
 * Helper para computar valores derivados para o composer
 */
import type { Tone } from './chatConstants';
import type { CosmosChatModalProps } from './types';

export interface ComputedComposerProps {
  displayMessages: any[];
  placeholder: string;
  inputType: 'text' | 'password' | 'email';
  autoComplete?: string;
  inputName?: string;
  suggestions: NonNullable<CosmosChatModalProps['suggestions']>;
  inputDisabled: boolean;
  minInputLength: number;
}

interface ComputeComposerPropsArgs {
  messages: any[];
  authMessages: any[];
  showAuthPrompt: boolean;
  showAuthNudge: boolean;
  authStep: string;
  authSuggestions: any[];
  authInputLocked: boolean;
  placeholder: string;
  tone: Tone;
  suggestions: NonNullable<CosmosChatModalProps['suggestions']>;
}

export function computeComposerProps({
  messages,
  authMessages,
  showAuthPrompt,
  showAuthNudge,
  authStep,
  authSuggestions,
  authInputLocked,
  placeholder,
  tone,
  suggestions,
}: ComputeComposerPropsArgs): ComputedComposerProps {
  const displayMessages = showAuthPrompt ? [...messages, ...authMessages] : messages;

  const composerPlaceholder = showAuthPrompt
    ? authStep === 'password'
      ? 'Digite sua senha...'
      : 'Digite sua resposta...'
    : placeholder;

  const composerInputType = showAuthPrompt
    ? authStep === 'password'
      ? 'password'
      : authStep === 'email'
        ? 'email'
        : 'text'
    : 'text';

  const composerAutoComplete = showAuthPrompt
    ? authStep === 'email'
      ? 'email'
      : authStep === 'password'
        ? 'current-password'
        : undefined
    : undefined;

  const composerInputName = showAuthPrompt
    ? authStep === 'email'
      ? 'email'
      : authStep === 'password'
        ? 'password'
        : undefined
    : undefined;

  const authNudgeSuggestions =
    !showAuthPrompt && showAuthNudge
      ? [{ id: 'auth-cta', label: 'Entrar ou criar conta', action: 'auth' as const, tone: 'amber' as Tone }]
      : [];

  const composerSuggestions = showAuthPrompt
    ? authSuggestions.map((s) => ({ ...s, tone }))
    : [...authNudgeSuggestions, ...(suggestions ?? [])];

  const composerInputDisabled = showAuthPrompt ? authInputLocked : false;

  return {
    displayMessages,
    placeholder: composerPlaceholder,
    inputType: composerInputType,
    autoComplete: composerAutoComplete,
    inputName: composerInputName,
    suggestions: composerSuggestions,
    inputDisabled: composerInputDisabled,
    minInputLength: showAuthPrompt ? 1 : 3,
  };
}
