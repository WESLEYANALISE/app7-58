import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { cacheManager } from '@/utils/cacheManager';

interface UseOptimizedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
  useExternalCache?: boolean;
}

export const useOptimizedQuery = <T,>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus = false,
  enabled = true,
  useExternalCache = false,
}: UseOptimizedQueryOptions<T>) => {
  const memoizedQueryKey = useMemo(() => queryKey, [queryKey.join(',')]);
  const cacheKey = memoizedQueryKey.join('-');
  
  // Check external cache first if enabled
  const cachedData = useExternalCache ? cacheManager.get(cacheKey) : null;
  
  const query = useQuery({
    queryKey: memoizedQueryKey,
    queryFn: async () => {
      const result = await queryFn();
      
      // Store in external cache if enabled
      if (useExternalCache) {
        cacheManager.set(cacheKey, result, staleTime);
      }
      
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled: enabled && !cachedData, // Skip query if we have cached data
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Use network-first strategy for better performance
    refetchOnMount: false,
    refetchOnReconnect: 'always',
  });

  // Return cached data if available, otherwise return query result
  if (cachedData && useExternalCache) {
    return {
      ...query,
      data: cachedData,
      isLoading: false,
      isFetching: false,
    };
  }

  return query;
};