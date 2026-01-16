/**
 * Testes para useInsightsCache
 * Valida deduplicação por params, TTL, e helpers específicos
 */

import { renderHook, waitFor } from '@testing-library/react';
import {
  useInsightsCache,
  useMonthlyInsightQuery,
  useQuarterlyInsightQuery,
  useAnnualInsightQuery,
  invalidateInsightsCache,
  clearInsightsCache,
  getInsightsCacheStats,
} from '@/hooks/useInsightsCache';

describe('useInsightsCache', () => {
  beforeEach(() => {
    clearInsightsCache();
    jest.clearAllMocks();
  });

  describe('Params-based Deduplication', () => {
    it('should deduplicate requests with same endpoint and params', async () => {
      const mockFetcher = jest.fn(async () => ({
        insight: 'Test insight',
      }));

      const params = { moonPhase: 'luaNova', year: 2025, monthNumber: 1 };

      const { result: result1 } = renderHook(() =>
        useInsightsCache('monthly-insight', params, mockFetcher, {
          autoFetch: true,
        })
      );

      const { result: result2 } = renderHook(() =>
        useInsightsCache('monthly-insight', params, mockFetcher, {
          autoFetch: true,
        })
      );

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      // Should only fetch once (same endpoint + params)
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(result1.current.data).toEqual(result2.current.data);
    });

    it('should not deduplicate requests with different params', async () => {
      const mockFetcher = jest.fn(async () => ({
        insight: 'Test insight',
      }));

      const { result: result1 } = renderHook(() =>
        useInsightsCache(
          'monthly-insight',
          { moonPhase: 'luaNova', year: 2025, monthNumber: 1 },
          mockFetcher,
          { autoFetch: true }
        )
      );

      const { result: result2 } = renderHook(() =>
        useInsightsCache(
          'monthly-insight',
          { moonPhase: 'luaCheia', year: 2025, monthNumber: 1 },
          mockFetcher,
          { autoFetch: true }
        )
      );

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      // Should fetch twice (different params)
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    it('should deduplicate regardless of param order', async () => {
      const mockFetcher = jest.fn(async () => ({
        insight: 'Test insight',
      }));

      const params1 = { moonPhase: 'luaNova', year: 2025, monthNumber: 1 };
      const params2 = { monthNumber: 1, moonPhase: 'luaNova', year: 2025 }; // Different order

      const { result: result1 } = renderHook(() =>
        useInsightsCache('monthly-insight', params1, mockFetcher, {
          autoFetch: true,
        })
      );

      const { result: result2 } = renderHook(() =>
        useInsightsCache('monthly-insight', params2, mockFetcher, {
          autoFetch: true,
        })
      );

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      // Should still deduplicate (params sorted internally)
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('useMonthlyInsightQuery Helper', () => {
    it('should fetch monthly insight with cache', async () => {
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            item: {
              insight: 'Nova Moon insight',
              id: 1,
            },
          })
        )
      );

      global.fetch = mockFetch;

      const { result } = renderHook(() =>
        useMonthlyInsightQuery('luaNova', 2025, 1)
      );

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      expect(result.current.data?.insight).toBe('Nova Moon insight');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/form/monthly-insight'),
        expect.any(Object)
      );
    });

    it('should cache by moonPhase + year + monthNumber', async () => {
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            item: { insight: 'Test', id: 1 },
          })
        )
      );

      global.fetch = mockFetch;

      const { result: result1 } = renderHook(() =>
        useMonthlyInsightQuery('luaNova', 2025, 1)
      );

      const { result: result2 } = renderHook(() =>
        useMonthlyInsightQuery('luaNova', 2025, 1)
      );

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('useQuarterlyInsightQuery Helper', () => {
    it('should fetch quarterly insight with cache', async () => {
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            item: {
              insight: 'Q1 insight',
              id: 1,
            },
          })
        )
      );

      global.fetch = mockFetch;

      const { result: result1 } = renderHook(() =>
        useQuarterlyInsightQuery('luaCheia', 1, 2025)
      );

      const { result: result2 } = renderHook(() =>
        useQuarterlyInsightQuery('luaCheia', 1, 2025)
      );

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('useAnnualInsightQuery Helper', () => {
    it('should fetch annual insight with cache', async () => {
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            item: {
              insight: 'Annual insight',
              id: 1,
            },
          })
        )
      );

      global.fetch = mockFetch;

      const { result: result1 } = renderHook(() => useAnnualInsightQuery(2025));
      const { result: result2 } = renderHook(() => useAnnualInsightQuery(2025));

      await waitFor(() => {
        expect(result1.current.data).toBeTruthy();
        expect(result2.current.data).toBeTruthy();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate different years', async () => {
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            item: { insight: 'Annual insight', id: 1 },
          })
        )
      );

      global.fetch = mockFetch;

      renderHook(() => useAnnualInsightQuery(2025));
      renderHook(() => useAnnualInsightQuery(2026));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate specific insight params', async () => {
      const mockFetcher = jest.fn(async () => ({
        insight: 'Original',
      }));

      const params = { moonPhase: 'luaNova', year: 2025, monthNumber: 1 };

      const { result } = renderHook(() =>
        useInsightsCache('monthly-insight', params, mockFetcher, {
          autoFetch: true,
        })
      );

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Invalidate
      invalidateInsightsCache('monthly-insight', params);

      // Fetch again
      result.current.mutate();

      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });
    });

    it('should clear all insights cache', async () => {
      const mockFetcher = jest.fn(async () => ({
        insight: 'Test',
      }));

      renderHook(() =>
        useInsightsCache(
          'monthly-insight',
          { moonPhase: 'luaNova', year: 2025, monthNumber: 1 },
          mockFetcher,
          { autoFetch: true }
        )
      );

      renderHook(() =>
        useInsightsCache(
          'quarterly-insight',
          { moonPhase: 'luaCheia', quarterNumber: 1, year: 2025 },
          mockFetcher,
          { autoFetch: true }
        )
      );

      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });

      clearInsightsCache();

      const stats = getInsightsCacheStats();
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('TTL Configuration', () => {
    it('should respect custom TTL', async () => {
      jest.useFakeTimers();
      const mockFetcher = jest.fn(async () => ({ insight: 'Test' }));

      const { result } = renderHook(() =>
        useInsightsCache('test', { key: 'value' }, mockFetcher, {
          autoFetch: true,
          ttl: 5000, // 5 seconds
        })
      );

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Advance to within TTL
      jest.advanceTimersByTime(4000);
      result.current.mutate();

      await waitFor(() => {
        // Should still be cached
        expect(mockFetcher).toHaveBeenCalledTimes(1);
      });

      // Advance past TTL
      jest.advanceTimersByTime(1100);
      result.current.mutate();

      await waitFor(() => {
        // Should refetch
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache stats', async () => {
      const mockFetcher = jest.fn(async () => ({ insight: 'Test' }));

      renderHook(() =>
        useInsightsCache('key1', { param: 1 }, mockFetcher, {
          autoFetch: true,
        })
      );

      renderHook(() =>
        useInsightsCache('key2', { param: 2 }, mockFetcher, {
          autoFetch: true,
        })
      );

      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });

      const stats = getInsightsCacheStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
    });
  });
});
