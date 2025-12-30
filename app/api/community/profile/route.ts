import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenPayload, validateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getUserId(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token || !validateToken(token)) return null;
  const payload = getTokenPayload(token);
  return payload?.userId ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const db = getDb();
    const rows = (await db`
      SELECT
        users.id,
        users.email,
        COALESCE(user_profiles.display_name, split_part(users.email, '@', 1)) AS display_name,
        user_profiles.avatar_url,
        user_profiles.bio
      FROM users
      LEFT JOIN user_profiles ON user_profiles.user_id = users.id
      WHERE users.id = ${userId}
      LIMIT 1
    `) as Array<{
      id: string;
      email: string;
      display_name: string;
      avatar_url: string | null;
      bio: string | null;
    }>;

    const profile = rows?.[0];

    if (!profile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile: {
          id: String(profile.id),
          email: profile.email,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar perfil da comunidade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const data = await request.json();
    const displayName = typeof data?.displayName === 'string' ? data.displayName.trim() : null;
    const avatarUrl = typeof data?.avatarUrl === 'string' ? data.avatarUrl.trim() : null;
    const bio = typeof data?.bio === 'string' ? data.bio.trim() : null;

    const db = getDb();
    const rows = (await db`
      INSERT INTO user_profiles (user_id, display_name, avatar_url, bio, updated_at)
      VALUES (
        ${userId},
        NULLIF(${displayName}, ''),
        NULLIF(${avatarUrl}, ''),
        NULLIF(${bio}, ''),
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        display_name = COALESCE(NULLIF(${displayName}, ''), user_profiles.display_name),
        avatar_url = COALESCE(NULLIF(${avatarUrl}, ''), user_profiles.avatar_url),
        bio = COALESCE(NULLIF(${bio}, ''), user_profiles.bio),
        updated_at = NOW()
      RETURNING user_id, display_name, avatar_url, bio
    `) as Array<{
      user_id: string;
      display_name: string | null;
      avatar_url: string | null;
      bio: string | null;
    }>;

    const profile = rows?.[0];

    return NextResponse.json(
      {
        profile: {
          id: String(profile.user_id),
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar perfil da comunidade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
