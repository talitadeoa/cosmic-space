'use client';

import { useRouter } from 'next/navigation';
import { SpaceBackground } from '@/app/cosmos/components/SpaceBackground';
import InputWindow from '@/app/cosmos/components/InputWindow';
import { useAuth } from '@/hooks/useAuth';
import AuthChatFlow from './AuthChatFlow';

interface AuthGateProps {
  children: React.ReactNode;
  chatButtonSize?: 'default' | 'compact';
  accessTarget?: string;
}

export default function AuthGate({ children, chatButtonSize = 'default', accessTarget }: AuthGateProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Renderiza o conteúdo autenticado
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative min-h-screen cursor-pointer overflow-hidden bg-slate-950 text-slate-50"
      onClick={() => router.back()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          router.back();
        }
      }}
      aria-label="Voltar"
    >
      <SpaceBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-2xl cursor-auto"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <InputWindow
            variant="glass"
            size="md"
            radius="lg"
            showAccent
            className="flex flex-col gap-4"
          >
            <AuthChatFlow
              variant="page"
              sendButtonSize={chatButtonSize}
              accessTarget={accessTarget}
              header={{
                title: "Seja bem-vindo(a)",
              }}
            />
          </InputWindow>
        </div>
      </div>
    </div>
  );
}
