/**
 * Componente CommunitySidebar - Sidebar com widgets complementares
 * Exibe: new post form, active members, trending topics, streams
 */

import type { FormEvent } from 'react';
import { NewPostForm, ActiveMembers, TrendingTopics, StreamList } from '../components';
import type { PostFormState, PostStatus, CommunityProfile } from '../hooks';

export interface Community Stream {
  id: string;
  title: string;
  description: string;
  cadence: string;
}

export interface CommunitySidebarProps {
  profile: CommunityProfile;
  postForm: PostFormState;
  postStatus: PostStatus;
  postError: string;
  streams: CommunityStream[];
  onPostChange: (field: keyof PostFormState, value: string) => void;
  onPostSubmit: (e: FormEvent) => Promise<void>;
  onTopicClick: (topic: { name: string }) => void;
}

export const CommunitySidebar = ({
  profile,
  postForm,
  postStatus,
  postError,
  streams,
  onPostChange,
  onPostSubmit,
  onTopicClick,
}: CommunitySidebarProps) => {
  return (
    <aside className="space-y-6">
      {/* New Post Form */}
      <NewPostForm
        form={postForm}
        status={postStatus}
        error={postError}
        onChange={onPostChange}
        onSubmit={onPostSubmit}
      />

      {/* Active Members */}
      <ActiveMembers />

      {/* Trending Topics */}
      <TrendingTopics onTopicClick={onTopicClick} />

      {/* Streams */}
      <StreamList streams={streams} />
    </aside>
  );
};
