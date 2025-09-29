import { useEffect } from 'react';
import { cacheManager } from '@/utils/cacheManager';

interface CoverPreloaderOptions {
  images: string[];
  priority?: 'high' | 'low';
}

export const useCoverPreloader = ({ images, priority = 'high' }: CoverPreloaderOptions) => {
  useEffect(() => {
    if (!images.length) return;

    const preloadImages = async () => {
      const preloadPromises = images.map(async (src) => {
        if (!src || src === '/placeholder.svg') return;
        
        // Check if already cached
        const cacheKey = `preloaded-image-${src}`;
        if (cacheManager.has(cacheKey)) return;

        try {
          const img = new Image();
          
          return new Promise<void>((resolve, reject) => {
            img.onload = () => {
              // Cache the successful load
              cacheManager.set(cacheKey, true, 30 * 60 * 1000); // 30 minutes
              resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            
            // Set loading priority
            if (priority === 'high') {
              img.loading = 'eager';
            }
            
            img.src = src;
          });
        } catch (error) {
          console.warn('Failed to preload image:', src, error);
        }
      });

      // Use requestIdleCallback for low priority or immediate for high priority
      if (priority === 'high') {
        await Promise.allSettled(preloadPromises);
      } else {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            Promise.allSettled(preloadPromises);
          });
        } else {
          setTimeout(() => {
            Promise.allSettled(preloadPromises);
          }, 100);
        }
      }
    };

    preloadImages();
  }, [images, priority]);
};

// Hook específico para precarregar capas de cursos
export const useCursosCoversPreloader = (areas: any[]) => {
  const coverImages = areas.flatMap(area => [
    area.capa,
    ...area.modulos.flatMap((modulo: any) => [
      modulo.capa,
      ...modulo.aulas.map((aula: any) => aula.capa)
    ])
  ]).filter(Boolean);

  useCoverPreloader({ 
    images: coverImages, 
    priority: 'high' 
  });
};