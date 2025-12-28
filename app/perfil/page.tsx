'use client';

import { SpacePageLayout } from '@/components/SpacePageLayout';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';

type CommunityProfile = {
  displayName: string;
  avatarUrl: string;
  bio: string;
  email: string;
};

const PerfilPage = () => {
  const [profile, setProfile] = useState<CommunityProfile>({
    displayName: '',
    avatarUrl: '',
    bio: '',
    email: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/community/profile');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Erro ao buscar perfil');
        }
        if (isActive && data?.profile) {
          setProfile({
            displayName: data.profile.displayName ?? '',
            avatarUrl: data.profile.avatarUrl ?? '',
            bio: data.profile.bio ?? '',
            email: data.profile.email ?? '',
          });
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage('Faça login para acessar o perfil.');
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (field: keyof CommunityProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setStatus('idle');
    setErrorMessage('');
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('saving');
    setErrorMessage('');
    try {
      const response = await fetch('/api/community/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Erro ao salvar perfil');
      }
      setProfile((prev) => ({
        ...prev,
        displayName: data.profile.displayName ?? '',
        avatarUrl: data.profile.avatarUrl ?? '',
        bio: data.profile.bio ?? '',
      }));
      setStatus('saved');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Nao foi possivel salvar o perfil.');
    }
  };

  const initialsFor = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
    return initials.join('') || 'C';
  };

  return (
    <SpacePageLayout className="px-6 py-12 sm:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Perfil</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Sua identidade{' '}
            <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-rose-300 bg-clip-text text-transparent">
              cosmica
            </span>
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Ajuste como voce aparece na comunidade e mantenha sua bio sempre viva.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <Link
              href="/comunidade"
              className="rounded-full border border-slate-700/70 bg-black/30 px-4 py-2 transition hover:border-indigo-400 hover:text-white"
            >
              Voltar para Comunidade
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Identidade</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Como a comunidade te ve</h2>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-700/70 bg-slate-900 text-base font-semibold text-slate-200">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || 'Perfil'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>{initialsFor(profile.displayName || 'Tripulacao')}</span>
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {profile.displayName || 'Tripulacao'}
                </div>
                <div className="text-sm text-slate-400">{profile.email || '—'}</div>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              {profile.bio || 'Sem bio cadastrada ainda.'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800/70 bg-black/40 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Editar</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Atualize seu perfil</h2>
            <form className="mt-6 space-y-4" onSubmit={saveProfile}>
              <input
                value={profile.displayName}
                onChange={(event) => handleChange('displayName', event.target.value)}
                placeholder="Nome publico"
                className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <input
                value={profile.avatarUrl}
                onChange={(event) => handleChange('avatarUrl', event.target.value)}
                placeholder="URL do avatar"
                className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <textarea
                value={profile.bio}
                onChange={(event) => handleChange('bio', event.target.value)}
                placeholder="Bio curta"
                rows={4}
                className="w-full rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>{errorMessage}</span>
                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className="rounded-full border border-slate-700/70 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'saving' ? 'Salvando' : 'Salvar perfil'}
                </button>
              </div>
              {status === 'saved' ? (
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  Perfil atualizado
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </div>
    </SpacePageLayout>
  );
};

export default PerfilPage;
