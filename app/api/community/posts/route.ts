import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTokenPayload, validateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeTags(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeImages(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, index) => {
      if (typeof item === 'string') {
        return { url: item, alt: null, position: index };
      }
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const url = typeof record.url === 'string' ? record.url.trim() : '';
      if (!url) return null;
      const alt = typeof record.alt === 'string' ? record.alt : null;
      const position =
        typeof record.position === 'number' && Number.isFinite(record.position)
          ? record.position
          : index;
      return { url, alt, position };
    })
    .filter((item): item is { url: string; alt: string | null; position: number } => !!item)
    .slice(0, 12);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseNumber(searchParams.get('limit'), DEFAULT_LIMIT), MAX_LIMIT);
    const offset = Math.max(parseNumber(searchParams.get('offset'), 0), 0);
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');

    const db = getDb();
    const searchFilter = q
      ? db`AND community_posts.search_vector @@ websearch_to_tsquery('portuguese', ${q})`
      : db``;
    const tagFilter = tag
      ? db`AND EXISTS (
          SELECT 1
          FROM community_post_tags cpt
          JOIN community_tags ct ON ct.id = cpt.tag_id
          WHERE cpt.post_id = community_posts.id AND ct.name = ${tag}
        )`
      : db``;

    const rows = (await db`
      SELECT
        community_posts.id,
        community_posts.title,
        community_posts.body,
        community_posts.created_at,
        community_posts.updated_at,
        users.email AS author_email,
        COALESCE(user_profiles.display_name, split_part(users.email, '@', 1)) AS author_name,
        user_profiles.avatar_url AS author_avatar_url,
        COALESCE(
          json_agg(DISTINCT community_tags.name)
            FILTER (WHERE community_tags.name IS NOT NULL),
          '[]'::json
        ) AS tags,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'url', community_post_images.url,
              'alt', community_post_images.alt,
              'position', community_post_images.position
            )
          ) FILTER (WHERE community_post_images.url IS NOT NULL),
          '[]'::json
        ) AS images,
        (
          SELECT COUNT(*)
          FROM community_comments
          WHERE community_comments.post_id = community_posts.id
        ) AS comments_count
      FROM community_posts
      JOIN users ON users.id = community_posts.author_id
      LEFT JOIN user_profiles ON user_profiles.user_id = users.id
      LEFT JOIN community_post_tags ON community_post_tags.post_id = community_posts.id
      LEFT JOIN community_tags ON community_tags.id = community_post_tags.tag_id
      LEFT JOIN community_post_images ON community_post_images.post_id = community_posts.id
      WHERE community_posts.status = 'published'
      ${searchFilter}
      ${tagFilter}
      GROUP BY community_posts.id, users.email, user_profiles.display_name, user_profiles.avatar_url
      ORDER BY community_posts.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `) as Array<{
      id: string;
      title: string | null;
      body: string;
      created_at: string;
      updated_at: string;
      author_email: string;
      author_name: string;
      author_avatar_url: string | null;
      tags: string[];
      images: Array<{ url: string; alt: string | null; position: number }>;
      comments_count: string | number;
    }>;

    const posts = rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      body: row.body,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        name: row.author_name,
        email: row.author_email,
        avatarUrl: row.author_avatar_url,
      },
      tags: Array.isArray(row.tags) ? row.tags : [],
      images: Array.isArray(row.images) ? row.images : [],
      commentsCount: Number(row.comments_count ?? 0),
    }));

    return NextResponse.json(
      { posts, pagination: { limit, offset, count: posts.length } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar posts da comunidade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário inválido' }, { status: 401 });
    }

    const data = await request.json();
    const title = typeof data?.title === 'string' ? data.title.trim() : null;
    const body = typeof data?.body === 'string' ? data.body.trim() : '';
    const tags = normalizeTags(data?.tags);
    const images = normalizeImages(data?.images);

    if (!body) {
      return NextResponse.json({ error: 'Conteúdo do post é obrigatório' }, { status: 400 });
    }

    const db = getDb();
    const postRows = (await db`
      INSERT INTO community_posts (author_id, title, body)
      VALUES (${userId}, ${title}, ${body})
      RETURNING id, created_at
    `) as Array<{ id: string; created_at: string }>;
    const postId = postRows?.[0]?.id;

    if (!postId) {
      return NextResponse.json({ error: 'Não foi possível criar o post' }, { status: 500 });
    }

    if (tags.length > 0) {
      await db`
        WITH inserted_tags AS (
          INSERT INTO community_tags (name)
          SELECT DISTINCT UNNEST(${tags}::text[])
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        )
        INSERT INTO community_post_tags (post_id, tag_id)
        SELECT ${postId}, id FROM inserted_tags
        ON CONFLICT DO NOTHING
      `;
    }

    if (images.length > 0) {
      const urls = images.map((image) => image.url);
      const alts = images.map((image) => image.alt);
      const positions = images.map((image) => image.position);
      await db`
        INSERT INTO community_post_images (post_id, url, alt, position)
        SELECT ${postId}, url, alt, position
        FROM UNNEST(${urls}::text[], ${alts}::text[], ${positions}::int[])
          AS images(url, alt, position)
      `;
    }

    return NextResponse.json(
      { success: true, postId, createdAt: postRows?.[0]?.created_at },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar post da comunidade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
