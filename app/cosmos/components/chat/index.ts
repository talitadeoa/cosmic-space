/**
 * Chat module exports
 */

// Components
export { ChatHeader, ChatMessages, ChatComposer } from './ChatComponents';
export { ContextEntries, MessageCounter, CloseButton } from './ChatSubComponents';

// Constants and types
export { toneStyles, type Tone, type ChatStyles } from './chatConstants';
export type { CosmosChatModalProps } from './types';

// Hooks
export { useChatState } from './useChatState';
export { useMessageSubmit } from './useMessageSubmit';
export { useBrainstormIntegration } from './useBrainstormIntegration';
export { useCosmosChatHandlers } from './useCosmosChatHandlers';
export { useScrollToBottom } from './useScrollToBottom';

// Utilities
export { computeComposerProps, type ComputedComposerProps } from './computeComposerProps';
