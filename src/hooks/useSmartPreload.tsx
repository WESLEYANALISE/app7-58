import { useCallback, useEffect, useRef } from 'react';
import { superCache, imageCache } from '@/utils/superCache';

interface PreloadConfig {
  priority?: number;
  ttl?: number;
  threshold?: number;
  delay?: number;
}

// Hook para preload inteligente de recursos
export const useSmartPreload = () => {
  const preloadQueue = useRef<Set<string>>(new Set());
  const isPreloading = useRef(false);

  // Preload de componente com intersection observer
  const preloadComponent = useCallback(async (
    componentPath: string, 
    config: PreloadConfig = {}
  ) => {
    const { priority = 2, ttl = 300000, delay = 0 } = config;

    if (superCache.has(`component-${componentPath}`)) return;

    const preloadFn = async () => {
      try {
        const component = await import(componentPath);
        superCache.set(`component-${componentPath}`, component.default, ttl, priority);
      } catch (error) {
        console.warn(`Failed to preload component: ${componentPath}`, error);
      }
    };

    if (delay > 0) {
      setTimeout(preloadFn, delay);
    } else {
      requestIdleCallback(preloadFn);
    }
  }, []);

  // Preload de dados com cache inteligente
  const preloadData = useCallback(async (
    key: string,
    fetcher: () => Promise<any>,
    config: PreloadConfig = {}
  ) => {
    const { priority = 2, ttl = 300000, delay = 0 } = config;

    if (superCache.has(key)) return superCache.get(key);

    const preloadFn = async () => {
      try {
        const data = await fetcher();
        superCache.set(key, data, ttl, priority);
        return data;
      } catch (error) {
        console.warn(`Failed to preload data: ${key}`, error);
        return null;
      }
    };

    if (delay > 0) {
      setTimeout(preloadFn, delay);
    } else {
      return requestIdleCallback(() => preloadFn());
    }
  }, []);

  // Preload de imagens com lazy loading
  const preloadImages = useCallback(async (
    images: string[],
    config: PreloadConfig = {}
  ) => {
    const { delay = 0 } = config;

    const preloadFn = () => {
      imageCache.preloadBatch(images);
    };

    if (delay > 0) {
      setTimeout(preloadFn, delay);
    } else {
      requestIdleCallback(preloadFn);
    }
  }, []);

  // Preload baseado em interação do usuário
  const createHoverPreload = useCallback((
    resources: { 
      components?: string[]; 
      data?: Array<{ key: string; fetcher: () => Promise<any> }>; 
      images?: string[] 
    },
    config: PreloadConfig = {}
  ) => {
    return {
      onMouseEnter: () => {
        requestIdleCallback(() => {
          if (resources.components) {
            resources.components.forEach(comp => preloadComponent(comp, config));
          }
          if (resources.data) {
            resources.data.forEach(({ key, fetcher }) => preloadData(key, fetcher, config));
          }
          if (resources.images) {
            preloadImages(resources.images, config);
          }
        });
      }
    };
  }, [preloadComponent, preloadData, preloadImages]);

  // Preload com intersection observer
  const createIntersectionPreload = useCallback((
    resources: {
      components?: string[];
      data?: Array<{ key: string; fetcher: () => Promise<any> }>;
      images?: string[]
    },
    config: PreloadConfig & { rootMargin?: string } = {}
  ) => {
    const { threshold = 0.1, rootMargin = '100px' } = config;

    return (element: HTMLElement | null) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              requestIdleCallback(() => {
                if (resources.components) {
                  resources.components.forEach(comp => preloadComponent(comp, config));
                }
                if (resources.data) {
                  resources.data.forEach(({ key, fetcher }) => preloadData(key, fetcher, config));
                }
                if (resources.images) {
                  preloadImages(resources.images, config);
                }
              });
              observer.unobserve(element);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      
      return () => observer.unobserve(element);
    };
  }, [preloadComponent, preloadData, preloadImages]);

  // Preload sequencial com controle de concorrência
  const preloadSequence = useCallback(async (
    sequence: Array<{
      type: 'component' | 'data' | 'images';
      target: any;
      config?: PreloadConfig;
    }>,
    maxConcurrent = 3
  ) => {
    if (isPreloading.current) return;
    isPreloading.current = true;

    try {
      // Dividir em chunks para controlar concorrência
      for (let i = 0; i < sequence.length; i += maxConcurrent) {
        const chunk = sequence.slice(i, i + maxConcurrent);
        
        const promises = chunk.map(async ({ type, target, config = {} }) => {
          switch (type) {
            case 'component':
              return preloadComponent(target, config);
            case 'data':
              return preloadData(target.key, target.fetcher, config);
            case 'images':
              return preloadImages(target, config);
          }
        });

        await Promise.allSettled(promises);
        
        // Pequena pausa entre chunks para não sobrecarregar
        if (i + maxConcurrent < sequence.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } finally {
      isPreloading.current = false;
    }
  }, [preloadComponent, preloadData, preloadImages]);

  // Preload crítico para primeira carga
  const preloadCritical = useCallback(() => {
    const criticalSequence = [
      {
        type: 'data' as const,
        target: {
          key: 'app-functions',
          fetcher: () => import('@/hooks/useSuperFastAppFunctions').then(m => m.useSuperFastAppFunctions)
        },
        config: { priority: 5, ttl: 600000 } // 10 minutos, máxima prioridade
      },
      {
        type: 'images' as const,
        target: [
          '/src/assets/categoria-justica.png',
          '/src/assets/logo-direito.png'
        ],
        config: { priority: 4 }
      }
    ];

    preloadSequence(criticalSequence, 2);
  }, [preloadSequence]);

  // Preload baseado no comportamento do usuário
  const adaptivePreload = useCallback(() => {
    // Analisar padrões de uso do usuário
    const userPatterns = superCache.get('user-patterns') || {};
    const mostUsedFunctions = Object.entries(userPatterns)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([fn]) => fn);

    // Preload baseado nos padrões
    mostUsedFunctions.forEach((functionName, index) => {
      const delay = index * 500; // Escalonar preload
      setTimeout(() => {
        preloadData(
          `function-${functionName}`,
          () => Promise.resolve({}), // Placeholder
          { priority: 3 - Math.floor(index / 2), delay }
        );
      }, delay);
    });
  }, [preloadData]);

  // Preload no idle do browser
  useEffect(() => {
    const idleCallback = () => {
      adaptivePreload();
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(idleCallback, { timeout: 5000 });
    } else {
      setTimeout(idleCallback, 1000);
    }
  }, [adaptivePreload]);

  return {
    preloadComponent,
    preloadData,
    preloadImages,
    createHoverPreload,
    createIntersectionPreload,
    preloadSequence,
    preloadCritical,
    adaptivePreload
  };
};