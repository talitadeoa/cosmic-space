export type CommunityPost = {
  id: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  title?: string | null;
  body: string;
  tags: string[];
  commentsCount: number;
};

export type CommunityPostImage = {
  url: string;
  alt?: string | null;
  position?: number | null;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  body: string;
  createdAt: string;
};
