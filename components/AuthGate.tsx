// components/AuthGate.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, loading, error, login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Renderiza o conteúdo autenticado
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Mostra o loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-400 border-t-transparent"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    if (!email) {
      setLocalError('Insira um email');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setLocalError('Insira uma senha');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'signup') {
      if (!firstName) {
        setLocalError('Insira seu nome');
        setIsSubmitting(false);
        return;
      }

      if (!lastName) {
        setLocalError('Insira seu sobrenome');
        setIsSubmitting(false);
        return;
      }

      if (!birthDate) {
        setLocalError('Insira sua data de nascimento');
        setIsSubmitting(false);
        return;
      }

      if (!gender) {
        setLocalError('Selecione seu sexo');
        setIsSubmitting(false);
        return;
      }
    }

    const success =
      mode === 'login'
        ? await login(email, password)
        : await signup({ email, password, firstName, lastName, birthDate, gender });
    setIsSubmitting(false);

    if (!success) {
      setLocalError(
        mode === 'login' ? 'Email ou senha incorretos' : 'Não foi possível criar a conta'
      );
      setEmail('');
      setPassword('');
      if (mode === 'signup') {
        setFirstName('');
        setLastName('');
        setBirthDate('');
        setGender('');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full rounded-3xl border border-slate-800 bg-black/40 px-6 py-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Acesso ao{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-rose-300 bg-clip-text text-transparent">
              Espaço
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 md:text-base">
            {mode === 'login'
              ? 'Digite a senha para explorar o cosmos'
              : 'Crie seu acesso ao cosmos'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-200">
                Nome
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  placeholder="Seu nome"
                />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                Sobrenome
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  placeholder="Seu sobrenome"
                />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                Data de nascimento
                <input
                  type="date"
                  name="birthDate"
                  autoComplete="bday"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                Sexo
                <select
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_informar">Prefiro não informar</option>
                </select>
              </label>
            </div>
          )}
          <label className="block text-sm font-medium text-slate-200">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              placeholder="seu@email.com"
            />
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Senha
            <input
              type="password"
              name="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-black/40 px-4 py-2.5 text-sm text-slate-50 shadow-inner shadow-black/40 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              placeholder="••••••••"
            />
          </label>

          {(error || localError) && (
            <p className="text-sm text-rose-400" role="alert">
              {error || localError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">
              {isSubmitting
                ? mode === 'login'
                  ? 'Entrando...'
                  : 'Criando conta...'
                : mode === 'login'
                  ? 'Entrar no cosmos'
                  : 'Criar conta'}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-300">
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setLocalError(null);
            }}
            className="ml-2 text-indigo-300 hover:text-indigo-200"
          >
            {mode === 'login' ? 'Criar agora' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}
