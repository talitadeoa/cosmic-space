'use client';

import InputWindow from '@/components/shared/cosmos/InputWindow';
import { useAuth } from '@/hooks/useAuth';
import AuthChatFlow from './AuthChatFlow';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated } = useAuth();

  // Renderiza o conteúdo autenticado
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.12),transparent_36%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <InputWindow
            variant="glass"
            size="md"
            radius="lg"
            showAccent
            className="flex flex-col gap-4"
          >
            <AuthChatFlow
              variant="page"
              header={{
                title: "Bem-vindo ao Cosmic Space",
              }}
            />
          </InputWindow>
        </div>
      </div>
    </div>
  );
}
