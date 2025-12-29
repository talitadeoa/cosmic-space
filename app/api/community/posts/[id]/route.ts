import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_COMMENTS_LIMIT = 20;
const MAX_COMMENTS_LIMIT = 50;

function parseNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const commentsLimit = Math.min(
      parseNumber(searchParams.get('commentsLimit'), DEFAULT_COMMENTS_LIMIT),
      MAX_COMMENTS_LIMIT
    );
    const commentsOffset = Math.max(parseNumber(searchParams.get('commentsOffset'), 0), 0);

    const db = getDb();
    const postRows = (await db`
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
      WHERE community_posts.id = ${id}
      GROUP BY community_posts.id, users.email, user_profiles.display_name, user_profiles.avatar_url
      LIMIT 1
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

    const post = postRows?.[0];

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    const comments = (await db`
      SELECT
        community_comments.id,
        community_comments.body,
        community_comments.created_at,
        users.email AS author_email,
        COALESCE(user_profiles.display_name, split_part(users.email, '@', 1)) AS author_name,
        user_profiles.avatar_url AS author_avatar_url
      FROM community_comments
      JOIN users ON users.id = community_comments.author_id
      LEFT JOIN user_profiles ON user_profiles.user_id = users.id
      WHERE community_comments.post_id = ${id}
      ORDER BY community_comments.created_at ASC
      LIMIT ${commentsLimit}
      OFFSET ${commentsOffset}
    `) as Array<{
      id: string;
      body: string;
      created_at: string;
      author_email: string;
      author_name: string;
      author_avatar_url: string | null;
    }>;

    return NextResponse.json(
      {
        post: {
          id: String(post.id),
          title: post.title,
          body: post.body,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          author: {
            name: post.author_name,
            email: post.author_email,
            avatarUrl: post.author_avatar_url,
          },
          tags: Array.isArray(post.tags) ? post.tags : [],
          images: Array.isArray(post.images) ? post.images : [],
          commentsCount: Number(post.comments_count ?? 0),
        },
        comments: comments.map((comment) => ({
          id: String(comment.id),
          postId: String(id),
          body: comment.body,
          createdAt: comment.created_at,
          author: {
            name: comment.author_name,
            email: comment.author_email,
            avatarUrl: comment.author_avatar_url,
          },
        })),
        pagination: { limit: commentsLimit, offset: commentsOffset, count: comments.length },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar post da comunidade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
