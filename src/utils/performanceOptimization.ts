// Otimizações de Performance para o App Jurídico

import { memo, lazy } from 'react';

// Otimização de imagens
export const optimizeImage = (src: string, width?: number, quality = 80) => {
  // Se for uma imagem local, retorna como está
  if (src.startsWith('/') || src.startsWith('./')) {
    return src;
  }
  
  // Para imagens externas, poderia adicionar parâmetros de otimização
  return src;
};

// Debounce para inputs de busca
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle para eventos de scroll
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
};

// HOC para memoização de componentes pesados
export const withPerformance = <P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) => {
  const MemoizedComponent = memo(Component);
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  }
  return MemoizedComponent;
};

// Lazy loading para componentes não críticos
export const createLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) => {
  const LazyComponent = lazy(importFunc);
  return LazyComponent;
};

// Preload de recursos críticos
export const preloadCriticalResources = () => {
  // Preload da fonte Inter se necessário
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  
  // Preload de imagens críticas
  const criticalImages = [
    '/src/assets/categoria-justica.png',
    '/src/assets/logo-direito.png'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Otimização de re-renders
export const areEqual = (prevProps: any, nextProps: any) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

// Cache simples para dados
const cache = new Map();

export const withCache = <T>(
  key: string,
  getData: () => T,
  ttl = 5 * 60 * 1000 // 5 minutos
): T => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = getData();
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

// Cleanup de cache
export const clearCache = () => {
  cache.clear();
};

// Otimização de animações
export const reduceMotionPreference = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Virtual scrolling para listas grandes
export const calculateVisibleItems = (
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number
) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  );
  
  return { startIndex, endIndex };
};