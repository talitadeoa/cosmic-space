/**
 * 🌐 Community Types
 * @module domains/community/types
 */

export type CommunityPostImage = {
  url: string;
  alt?: string | null;
  position?: number | null;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  title?: string | null;
  body: string;
  tags: string[];
  images?: CommunityPostImage[];
  commentsCount: number;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  body: string;
  createdAt: string;
};
