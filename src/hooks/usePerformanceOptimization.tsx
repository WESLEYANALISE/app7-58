import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from '@/utils/performanceOptimization';

// Hook para otimização de performance
export const usePerformanceOptimization = () => {
  // Debounced search
  const createDebouncedSearch = useCallback((callback: (term: string) => void, delay = 300) => {
    return debounce(callback, delay);
  }, []);

  // Memoização otimizada
  const memoizeWithDeps = useCallback(<T,>(factory: () => T, deps: React.DependencyList): T => {
    return useMemo(factory, deps);
  }, []);

  // Preload de recursos
  const preloadImage = useCallback((src: string) => {
    const img = new Image();
    img.src = src;
  }, []);

  const preloadImages = useCallback((srcs: string[]) => {
    srcs.forEach(preloadImage);
  }, [preloadImage]);

  // Lazy loading observer
  const createIntersectionObserver = useCallback((callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }, []);

  // Virtual scrolling helper
  const calculateVisibleRange = useCallback((scrollTop: number, itemHeight: number, containerHeight: number, totalItems: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 2, totalItems);
    return { startIndex: Math.max(0, startIndex - 1), endIndex };
  }, []);

  // Performance monitor
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  }, []);

  return {
    createDebouncedSearch,
    memoizeWithDeps,
    preloadImage,
    preloadImages,
    createIntersectionObserver,
    calculateVisibleRange,
    measurePerformance
  };
};

// Hook para cache inteligente
export const useSmartCache = <T,>(key: string, fetcher: () => Promise<T>, ttl = 300000) => {
  const cachedData = useMemo(() => {
    const cached = localStorage.getItem(`cache_${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
    return null;
  }, [key, ttl]);

  const setCache = useCallback((data: T) => {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }, [key]);

  return { cachedData, setCache, fetcher };
};