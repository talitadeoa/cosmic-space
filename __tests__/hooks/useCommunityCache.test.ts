/**
 * Testes para useCommunityCache
 * Valida deduplicação, TTL, subscribers e helpers
 */

import { renderHook, waitFor } from '@testing-library/react';
import {
  useCommunityCache,
  useCommunityPosts,
  useCommunityProfile,
  invalidateCommunityCache,
  clearCommunityCache,
  getCommunityInvocationStats,
} from '@/hooks/useCommunityCache';

describe('useCommunityCache', () => {
  beforeEach(() => {
    clearCommunityCache();
    jest.clearAllMocks();
  });

  describe('Basic Cache Operations', () => {
    it('should fetch data on mount', async () => {
      const mockFetcher = jest.fn(async () => ({
        id: '1',
        title: 'Test Post',
      }));

      const { result } = renderHook(() =>
        useCommunityCache('test-key', mockFetcher, { autoFetch: true })
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual({
        id: '1',
        title: 'Test Post',
      });
    });

    it('should cache data and not re-fetch on re-render', async () => {
      const mockFetcher = jest.fn(async () => ({ id: '1' }));

      const { result: result1 } = renderHook(() =>
        useCommunityCache('test-key', mockFetcher, { autoFetch: true })
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      // Second hook with same key
      const { result: result2 } = renderHook(() =>
        useCommunityCache('test-key', mockFetcher, { autoFetch: true })
      );

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      // Should only fetch once (cache hit on second)
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(result2.current.data).toEqual({ id: '1' });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Network error');
      const mockFetcher = jest.fn(async () => {
        throw error;
      });

      const { result } = renderHook(() =>
        useCommunityCache('test-key', mockFetcher, { autoFetch: true })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.data).toBeNull();
    });
  });

  describe('In-flight Request Deduplication', () => {
    it('should deduplicate concurrent requests', async () => {
      const mockFetcher = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { id: '1', data: 'test' };
      });

      // Start two fetches simultaneously
      const promise1 = renderHook(() =>
        useCommunityCache('same-key', mockFetcher, { autoFetch: true })
      );

      const promise2 = renderHook(() =>
        useCommunityCache('same-key', mockFetcher, { autoFetch: true })
      );

      await waitFor(() => {
        expect(promise1.result.current.isLoading).toBe(false);
        expect(promise2.result.current.isLoading).toBe(false);
      });

      // Should only call fetcher once despite two concurrent requests
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('TTL Expiration', () => {
    it('should expire cache after TTL', async () => {
      jest.useFakeTimers();
      const mockFetcher = jest.fn(async () => ({ id: '1' }));

      const { result } = renderHook(() =>
        useCommunityCache('test-key', mockFetcher, {
          autoFetch: true,
          ttl: 1000, // 1 second
        })
      );

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Advance time past TTL
      jest.advanceTimersByTime(1100);

      // Trigger new fetch
      result.current.mutate();

      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });
  });

  describe('useCommunityPosts Helper', () => {
    it('should deduplicate posts requests with same limit', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ posts: [{ id: '1', title: 'Post 1' }] })
          )
        );

      global.fetch = mockFetch;

      const { result: result1 } = renderHook(() => useCommunityPosts(6));
      const { result: result2 } = renderHook(() => useCommunityPosts(6));

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      // Should only fetch once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate posts with different queries', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ posts: [{ id: '1', title: 'Post 1' }] })
          )
        );

      global.fetch = mockFetch;

      const { result: result1 } = renderHook(() => useCommunityPosts(6, 'query1'));
      const { result: result2 } = renderHook(() => useCommunityPosts(6, 'query2'));

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      // Should fetch twice (different queries)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('useCommunityProfile Helper', () => {
    it('should cache profile for 30 minutes', async () => {
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            profile: {
              displayName: 'Test User',
              avatarUrl: 'https://example.com/avatar.jpg',
              bio: 'Test bio',
            },
          })
        )
      );

      global.fetch = mockFetch;

      const { result: result1 } = renderHook(() => useCommunityProfile());
      const { result: result2 } = renderHook(() => useCommunityProfile());

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1.current.data?.displayName).toBe('Test User');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate specific cache key', async () => {
      const mockFetcher = jest.fn(async () => ({ id: '1' }));

      const { result } = renderHook(() =>
        useCommunityCache('test-key', mockFetcher, { autoFetch: true })
      );

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Invalidate
      invalidateCommunityCache('test-key');

      // Fetch again
      result.current.mutate();

      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });
    });

    it('should clear all cache', async () => {
      const mockFetcher = jest.fn(async () => ({ id: '1' }));

      renderHook(() =>
        useCommunityCache('key1', mockFetcher, { autoFetch: true })
      );

      renderHook(() =>
        useCommunityCache('key2', mockFetcher, { autoFetch: true })
      );

      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });

      clearCommunityCache();

      const stats = getCommunityInvocationStats();
      expect(stats.cacheSize).toBe(0);
    });
  });
});
