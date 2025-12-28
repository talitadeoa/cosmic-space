-- ========================================
-- COMUNIDADE (Perfis, Posts, Comentarios, Tags)
-- ========================================

-- Perfis de usuario (avatar, nome publico, bio)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles (display_name);

-- Posts da comunidade
CREATE TABLE IF NOT EXISTS community_posts (
  id BIGSERIAL PRIMARY KEY,
  author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'hidden')),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author_date
  ON community_posts (author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_created_at
  ON community_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_status
  ON community_posts (status);

CREATE INDEX IF NOT EXISTS idx_community_posts_search
  ON community_posts USING GIN (search_vector);

-- Imagens anexadas a posts
CREATE TABLE IF NOT EXISTS community_post_images (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  position INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_community_post_images_post
  ON community_post_images (post_id, position);

-- Comentarios
CREATE TABLE IF NOT EXISTS community_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_date
  ON community_comments (post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_comments_author
  ON community_comments (author_id);

-- Tags
CREATE TABLE IF NOT EXISTS community_tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_tags_name
  ON community_tags (name);

CREATE TABLE IF NOT EXISTS community_post_tags (
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES community_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_community_post_tags_tag
  ON community_post_tags (tag_id);
