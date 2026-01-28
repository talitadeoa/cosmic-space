import { ChatMessage, ChatMessageMeta } from '@/lib/chatHistory';
import { Tone } from './chatConstants';

export interface CosmosChatModalProps {
  isOpen: boolean;
  inline?: boolean;
  requiresAuthOnSave?: boolean;
  allowUnauthedSubmit?: boolean;
  authNudgeMessage?: string;
  authRedirectPath?: string;
  storageKey: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  badge?: string;
  placeholder: string;
  systemGreeting?: string;
  systemQuestion?: string;
  initialValue?: string;
  initialValueLabel?: string;
  submitLabel?: string;
  tone?: Tone;
  systemResponses?: string[];
  submitStrategy?: 'concat' | 'last';
  resetOnSubmit?: boolean;
  closeOnSubmit?: boolean;
  submitOnSend?: boolean;
  windowClassName?: string;
  enableBrainstorm?: boolean;
  onClose: () => void;
  onSubmit: (value: string, messages: ChatMessage[], meta?: ChatMessageMeta) => Promise<void>;
  headerExtra?: React.ReactNode;
  contextTitle?: string;
  contextEntries?: Array<{
    id: string;
    label: string;
    content: string;
  }>;
  suggestions?: Array<{
    id: string;
    label: string;
    value?: string;
    meta?: ChatMessageMeta;
    tone?: Tone;
    action?: 'auth';
  }>;
}
