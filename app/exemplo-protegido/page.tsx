// app/exemplo-protegido/page.tsx
/**
 * Exemplo de página protegida com autenticação
 * Você pode copiar este arquivo e adaptá-lo para outras páginas
 */

'use client';

import { useState } from 'react';
import AuthGate from '@/components/AuthGate';
import DataCollectionForm from '@/components/DataCollectionForm';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function ExemploPage() {
  const { logout } = useAuth();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AuthGate>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Header com Logout */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-100 mb-2">
                Área Protegida
              </h1>
              <p className="text-slate-400">
                ✅ Você está autenticado e pode acessar este conteúdo
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/universo"
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 transition"
              >
                Voltar ao Universo
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-slate-300 hover:bg-slate-700 transition"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Grid de conteúdo */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Seção 1: Informações */}
            <div className="rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                📌 Conteúdo Exclusivo
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Este é um exemplo de página protegida por autenticação. Apenas 
                usuários que inseriram a senha correta podem ver este conteúdo.
              </p>
              <div className="space-y-3 text-sm text-slate-400">
                <p>✨ A autenticação é gerenciada por cookies HTTP-only</p>
                <p>🔒 Tokens são verificados a cada requisição</p>
                <p>📊 Dados de formulários são enviados para Google Sheets</p>
              </div>
            </div>

            {/* Seção 2: Formulário */}
            <div className="rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur">
              <DataCollectionForm
                onSuccess={() => {
                  setFormSubmitted(true);
                  setTimeout(() => setFormSubmitted(false), 3000);
                }}
              />
              {formSubmitted && (
                <p className="mt-3 text-center text-sm text-emerald-400 animate-pulse">
                  ✨ Seus dados foram salvos com sucesso!
                </p>
              )}
            </div>
          </div>

          {/* Seção 3: Como usar em suas páginas */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">
              💡 Como proteger suas páginas
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-indigo-300 mb-2">
                  1. Envolver com AuthGate
                </h3>
                <pre className="bg-slate-900/50 p-3 rounded text-xs text-slate-300 overflow-x-auto">
{`'use client';

import AuthGate from '@/components/AuthGate';
import YourComponent from '@/components/YourComponent';

export default function Page() {
  return (
    <AuthGate>
      <YourComponent />
    </AuthGate>
  );
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-indigo-300 mb-2">
                  2. Usar o hook useAuth
                </h3>
                <pre className="bg-slate-900/50 p-3 rounded text-xs text-slate-300 overflow-x-auto">
{`'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Component() {
  const { logout, isAuthenticated } = useAuth();

  return (
    <button onClick={logout}>
      Sair
    </button>
  );
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-indigo-300 mb-2">
                  3. Adicionar formulário de coleta
                </h3>
                <pre className="bg-slate-900/50 p-3 rounded text-xs text-slate-300 overflow-x-auto">
{`import DataCollectionForm from '@/components/DataCollectionForm';

export default function Page() {
  return (
    <DataCollectionForm 
      onSuccess={() => console.log('Enviado!')} 
    />
  );
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-slate-400">
            <p>🌌 Cosmic Space - Sistema de Autenticação e Coleta de Dados</p>
            <p className="mt-2">Para mais informações, veja SETUP_AUTENTICACAO.md</p>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
