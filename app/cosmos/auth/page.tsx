'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';

export default function CosmosAuthPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/cosmos');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <AuthGate>
      <main className="sr-only">
        {isAuthenticated && !loading ? 'Acesso liberado. Redirecionando...' : 'Autenticando.'}
      </main>
    </AuthGate>
  );
}
