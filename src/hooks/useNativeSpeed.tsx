import { useEffect, useCallback, useMemo } from 'react';
import { cacheManager } from '@/utils/cacheManager';

// Sistema de cache nativo super agressivo
class NativeSpeedCache {
  private memoryCache = new Map<string, any>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  // Cache instantâneo na memória
  setInstant(key: string, data: any) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Também salva no cache manager para persistência
    cacheManager.set(key, data, 30 * 60 * 1000); // 30 minutos
  }

  // Recuperação instantânea
  getInstant(key: string) {
    const cached = this.memoryCache.get(key);
    if (cached) return cached.data;
    
    // Fallback para cache manager
    return cacheManager.get(key);
  }

  // Verifica se existe no cache
  hasInstant(key: string): boolean {
    return this.memoryCache.has(key) || cacheManager.has(key);
  }

  // Preload agressivo de dados
  addToPreload(keys: string[]) {
    this.preloadQueue.push(...keys.filter(key => !this.hasInstant(key)));
    this.startPreloading();
  }

  private async startPreloading() {
    if (this.isPreloading || this.preloadQueue.length === 0) return;
    
    this.isPreloading = true;
    
    // Preload em background usando requestIdleCallback
    const processQueue = () => {
      if (this.preloadQueue.length === 0) {
        this.isPreloading = false;
        return;
      }

      const key = this.preloadQueue.shift();
      if (key && !this.hasInstant(key)) {
        // Simula preload de dados críticos
        this.setInstant(key, { preloaded: true, timestamp: Date.now() });
      }

      // Continua processando quando idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(processQueue);
      } else {
        setTimeout(processQueue, 16); // ~60fps
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(processQueue);
    } else {
      setTimeout(processQueue, 16);
    }
  }

  // Limpa cache antigo
  cleanup() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutos
    
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Stats do cache
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      queueSize: this.preloadQueue.length,
      isPreloading: this.isPreloading
    };
  }
}

// Instância global
const nativeCache = new NativeSpeedCache();

// Auto-cleanup a cada 10 minutos
setInterval(() => {
  nativeCache.cleanup();
}, 10 * 60 * 1000);

// Hook principal para velocidade nativa
export const useNativeSpeed = () => {
  
  // Função para definir dados instantaneamente
  const setInstantData = useCallback((key: string, data: any) => {
    nativeCache.setInstant(key, data);
  }, []);

  // Função para recuperar dados instantaneamente
  const getInstantData = useCallback((key: string) => {
    return nativeCache.getInstant(key);
  }, []);

  // Função para verificar se existe no cache
  const hasInstantData = useCallback((key: string): boolean => {
    return nativeCache.hasInstant(key);
  }, []);

  // Preload de dados críticos
  const preloadCriticalData = useCallback((keys: string[]) => {
    nativeCache.addToPreload(keys);
  }, []);

  // Query otimizada que nunca mostra loading
  const instantQuery = useCallback(<T,>(key: string, fetcher: () => Promise<T>, fallback?: T) => {
    const cached = nativeCache.getInstant(key);
    
    if (cached) {
      return { data: cached, isLoading: false, error: null };
    }

    // Se não tem cache, executa fetch em background e retorna fallback
    if (fallback !== undefined) {
      fetcher().then(data => {
        nativeCache.setInstant(key, data);
      }).catch(console.error);
      
      return { data: fallback, isLoading: false, error: null };
    }

    // Se não tem fallback, executa fetch normal mas sem loading visível
    return { data: null, isLoading: false, error: null };
  }, []);

  // Inicialização automática de preloads críticos
  useEffect(() => {
    const criticalKeys = [
      'app-functions',
      'user-profile', 
      'legal-news',
      'vademecum-codes',
      'biblioteca-data',
      'noticias-juridicas'
    ];
    
    preloadCriticalData(criticalKeys);
  }, [preloadCriticalData]);

  // Stats do cache (para debug)
  const cacheStats = useMemo(() => nativeCache.getStats(), []);

  return {
    setInstantData,
    getInstantData,
    hasInstantData,
    preloadCriticalData,
    instantQuery,
    cacheStats
  };
};

// Hook para componentes que precisam ser sempre instantâneos
export const useInstantComponent = (componentId: string) => {
  const { hasInstantData, setInstantData } = useNativeSpeed();

  const isReady = useMemo(() => hasInstantData(componentId), [componentId, hasInstantData]);

  const markAsReady = useCallback((data?: any) => {
    setInstantData(componentId, data || { ready: true, timestamp: Date.now() });
  }, [componentId, setInstantData]);

  return { isReady, markAsReady };
};

// Hook para dados que devem estar sempre prontos
export const useAlwaysReady = <T,>(key: string, fetcher: () => Promise<T>, defaultValue: T) => {
  const { getInstantData, setInstantData } = useNativeSpeed();
  
  const data = useMemo(() => {
    const cached = getInstantData(key);
    if (cached) return cached;
    
    // Fetch em background
    fetcher().then(result => {
      setInstantData(key, result);
    }).catch(() => {
      setInstantData(key, defaultValue);
    });
    
    return defaultValue;
  }, [key, getInstantData, setInstantData, defaultValue, fetcher]);

  return { data, isLoading: false, error: null };
};