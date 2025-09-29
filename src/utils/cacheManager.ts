// Sistema de cache avançado para otimização
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 15 * 60 * 1000; // 15 minutos

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear() {
    this.cache.clear();
  }

  // Limpar cache expirado
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Obter estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância global do cache
export const cacheManager = new CacheManager();

// Auto-cleanup a cada 10 minutos
setInterval(() => {
  cacheManager.cleanup();
}, 10 * 60 * 1000);

// Hook para usar cache com React Query
export const useCachedQuery = <T>(key: string, queryFn: () => Promise<T>, ttl?: number) => {
  const cachedData = cacheManager.get(key);
  
  if (cachedData) {
    return { data: cachedData, isLoading: false, error: null };
  }

  // Se não estiver no cache, executa a query e cacheia o resultado
  return {
    data: null,
    isLoading: true,
    error: null,
    refetch: async () => {
      try {
        const result = await queryFn();
        cacheManager.set(key, result, ttl);
        return result;
      } catch (error) {
        throw error;
      }
    }
  };
};