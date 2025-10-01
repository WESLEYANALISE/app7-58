// Otimizações específicas para cursos
import { cacheManager } from './cacheManager';

// Cache para imagens de curso
const imageCache = new Map<string, string>();
const preloadedImages = new Set<string>();

export const optimizeCourseImage = (url: string): string => {
  if (!url) return '/placeholder.svg';
  
  // Se já está no cache, retorna imediatamente
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }

  // Para imagens do Supabase, adiciona parâmetros de otimização
  if (url.includes('supabase')) {
    const optimizedUrl = `${url}?width=600&quality=85&format=webp`;
    imageCache.set(url, optimizedUrl);
    return optimizedUrl;
  }

  imageCache.set(url, url);
  return url;
};

// Preload de imagens críticas com prioridade ultra-alta
export const preloadCourseImages = (urls: string[], priority: 'high' | 'low' = 'high') => {
  // Usar requestIdleCallback para não bloquear thread principal
  const preloadBatch = () => {
    urls.forEach(url => {
      if (!url || preloadedImages.has(url)) return;
      
      const optimizedUrl = optimizeCourseImage(url);
      
      // Preload agressivo para melhor performance
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;
      if (priority === 'high') {
        link.fetchPriority = 'high';
      }
      document.head.appendChild(link);
      
      // Também criar objeto Image para cache do navegador
      const img = new Image();
      img.src = optimizedUrl;
      img.loading = 'eager';
      
      preloadedImages.add(url);
    });
  };

  // Se prioridade alta, executar imediatamente
  if (priority === 'high') {
    preloadBatch();
  } else {
    // Se prioridade baixa, usar requestIdleCallback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadBatch);
    } else {
      setTimeout(preloadBatch, 1);
    }
  }
};

// Cache para dados de progresso
export const cacheProgress = (userId: string, courseId: string, progress: any) => {
  const key = `progress_${userId}_${courseId}`;
  cacheManager.set(key, progress, 24 * 60 * 60 * 1000); // 24 horas
};

export const getCachedProgress = (userId: string, courseId: string) => {
  const key = `progress_${userId}_${courseId}`;
  return cacheManager.get(key);
};

// Otimização de scroll virtual para listas grandes
export const calculateVisibleCourseItems = (
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
  overscan: number = 3
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
};

// Lazy loading para conteúdo de aulas
export const lazyLoadLessonContent = async (lessonId: string) => {
  const cacheKey = `lesson_content_${lessonId}`;
  
  // Verifica cache primeiro
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  // Simula carregamento (substituir pela API real)
  const content = await new Promise(resolve => {
    setTimeout(() => {
      resolve({ id: lessonId, content: "Conteúdo da aula..." });
    }, 100);
  });

  // Cacheia por 1 hora
  cacheManager.set(cacheKey, content, 60 * 60 * 1000);
  return content;
};

// Otimização de busca
export const createSearchIndex = (courses: any[]) => {
  const searchIndex = new Map();
  
  courses.forEach(course => {
    const searchTerms = [
      course.title,
      course.subtitle,
      course.description,
      ...(course.tags || [])
    ].filter(Boolean).map(term => term.toLowerCase());
    
    searchTerms.forEach(term => {
      if (!searchIndex.has(term)) {
        searchIndex.set(term, []);
      }
      searchIndex.get(term).push(course);
    });
  });
  
  return searchIndex;
};

// Debounce para busca
export const debounceSearch = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};