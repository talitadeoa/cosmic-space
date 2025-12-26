import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${base}/api/auth/google/callback`;

    if (!clientId) {
      return NextResponse.json({ error: 'Google client id não configurado' }, { status: 500 });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  } catch (error) {
    console.error('Erro ao iniciar OAuth Google:', error);
    return NextResponse.json({ error: 'Erro ao iniciar OAuth Google' }, { status: 500 });
  }
}
