import { NextRequest, NextResponse } from 'next/server';
import { createAuthToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const params = new URLSearchParams({
    code,
    client_id: clientId || '',
    client_secret: clientSecret || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('Token exchange failed: ' + text);
  }

  return await resp.json();
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${base}/api/auth/google/callback`;

    if (!code) {
      return NextResponse.json({ error: 'Código OAuth ausente' }, { status: 400 });
    }

    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // Buscar perfil do usuário
    const userResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResp.ok) {
      throw new Error('Erro ao buscar userinfo');
    }

    const profile = await userResp.json();

    const db = getDb();
    const userRows = await db`
      INSERT INTO users (email, provider, last_login)
      VALUES (${profile.email}, 'google', NOW())
      ON CONFLICT (email) DO UPDATE
      SET last_login = NOW()
      RETURNING id
    `;
    const userId = userRows?.[0]?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não foi possível identificar o usuário' }, { status: 500 });
    }

    // Criar token de sessão local
    const token = createAuthToken({
      email: profile.email,
      name: profile.name,
      provider: 'google',
      userId,
    });

    const response = NextResponse.redirect(`${base}`);
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Erro no callback OAuth Google:', error);
    return NextResponse.json({ error: 'Erro no callback OAuth Google' }, { status: 500 });
  }
}
