import { useEffect, useCallback, useMemo } from 'react';
import { superCache, imageCache, preloadCriticalData } from '@/utils/superCache';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { useUltraFastNavigation } from './useUltraFastNavigation';
import { useSmartPreload } from './useSmartPreload';

// Hook principal para otimização do app
export const useAppOptimization = () => {
  const { preloadForRoute } = useUltraFastNavigation();
  const { preloadCritical, adaptivePreload } = useSmartPreload();

  // Inicialização de otimizações críticas
  useEffect(() => {
    const initOptimizations = async () => {
      try {
        // 1. Preload de dados críticos
        await preloadCriticalData();
        
        // 2. Preload de componentes críticos
        preloadCritical();
        
        // 3. Preload adaptativo baseado em uso
        adaptivePreload();
        
        // 4. Otimizar imagens críticas
        const criticalImages = [
          '/src/assets/categoria-justica.png',
          '/src/assets/logo-direito.png',
          '/src/assets/mapas-mentais-hero.png'
        ];
        imageCache.preloadBatch(criticalImages);
        
        // 5. Configurar monitoramento
        performanceMonitor.startAutoReporting(60000); // 1 minuto
        
        console.log('✅ App optimization initialized');
      } catch (error) {
        console.warn('⚠️ Some optimizations failed:', error);
      }
    };

    initOptimizations();
  }, [preloadCritical, adaptivePreload]);

  // Otimização de scroll
  const optimizeScrolling = useCallback(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Otimização de resize
  const optimizeResize = useCallback(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      document.body.classList.add('is-resizing');
      
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        document.body.classList.remove('is-resizing');
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Cleanup de memória automático
  const setupMemoryCleanup = useCallback(() => {
    const cleanup = () => {
      // Limpar cache expirado
      superCache.cleanup();
      
      // Forçar garbage collection se disponível
      if (window.gc && process.env.NODE_ENV === 'development') {
        window.gc();
      }
      
      // Log de estatísticas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        const stats = superCache.getStats();
        console.log('🧹 Memory cleanup - Cache stats:', stats);
      }
    };

    // Cleanup a cada 5 minutos
    const interval = setInterval(cleanup, 5 * 60 * 1000);
    
    // Cleanup quando a página fica oculta
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Configurar otimizações de evento
  useEffect(() => {
    const cleanupScroll = optimizeScrolling();
    const cleanupResize = optimizeResize();
    const cleanupMemory = setupMemoryCleanup();
    
    return () => {
      cleanupScroll();
      cleanupResize();
      cleanupMemory();
    };
  }, [optimizeScrolling, optimizeResize, setupMemoryCleanup]);

  // Otimização de fontes
  useEffect(() => {
    // Preload de fontes críticas
    const fontPreloads = [
      'Inter',
      'system-ui'
    ];

    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.googleapis.com/css2?family=${font}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    });
  }, []);

  // Otimização de animações baseada em preferências
  const optimizeAnimations = useMemo(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }
    
    return !prefersReducedMotion;
  }, []);

  // Bundle de métodos úteis
  const optimizationUtils = useMemo(() => ({
    // Preload inteligente de rota
    preloadRoute: (routeName: string) => {
      preloadForRoute(routeName);
    },
    
    // Forçar cleanup de memória
    forceCleanup: () => {
      superCache.cleanup();
      imageCache.clear();
    },
    
    // Obter estatísticas de performance
    getPerformanceStats: () => ({
      cache: superCache.getStats(),
      performance: performanceMonitor.getStats(),
      memory: (performance as any).memory
    }),
    
    // Verificar saúde da aplicação
    checkHealth: () => {
      const issues = performanceMonitor.detectPerformanceIssues();
      const cacheStats = superCache.getStats();
      
      return {
        healthy: issues.length === 0,
        issues,
        cacheSize: cacheStats.totalItems,
        recommendations: issues.length > 0 ? 
          ['Considere limpar cache', 'Reduza componentes pesados'] : 
          ['App executando otimamente']
      };
    }
  }), [preloadForRoute]);

  return {
    optimizationUtils,
    animationsEnabled: optimizeAnimations,
    cacheStats: superCache.getStats(),
    performanceIssues: performanceMonitor.detectPerformanceIssues()
  };
};

// Hook para componentes pesados
export const useHeavyComponentOptimization = (componentName: string) => {
  const { measureRender } = performanceMonitor;
  
  const startMeasure = useCallback(() => {
    return measureRender(componentName);
  }, [componentName, measureRender]);

  // Memoização inteligente para props
  const memoizeProps = useCallback(<T extends object>(props: T): T => {
    const key = `props-${componentName}-${JSON.stringify(props)}`;
    
    const cached = superCache.get(key);
    if (cached) return cached;
    
    superCache.set(key, props, 30000, 2); // 30s, prioridade média
    return props;
  }, [componentName]);

  return {
    startMeasure,
    memoizeProps
  };
};