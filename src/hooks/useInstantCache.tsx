import { useState, useCallback, useEffect } from 'react';

// Cache ultra-rápido com persistência local e prioridade inteligente
class InstantCache {
  private cache = new Map<string, { data: any; timestamp: number; priority: number }>();
  private maxSize = 500;
  private defaultTTL = 30 * 60 * 1000; // 30 minutos

  set(key: string, data: any, priority = 1) {
    // Limpa cache se muito grande
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      priority
    });

    // Salva no localStorage para persistência entre sessões
    try {
      localStorage.setItem(`instant_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        priority
      }));
    } catch (e) {
      // Ignora se localStorage está cheio
    }
  }

  get(key: string) {
    // Tenta cache em memória primeiro
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.defaultTTL) {
      return cached.data;
    }

    // Tenta localStorage como fallback
    try {
      const stored = localStorage.getItem(`instant_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < this.defaultTTL) {
          // Restaura para cache em memória
          this.cache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (e) {
      // Ignora erros do localStorage
    }

    return null;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  cleanup() {
    // Remove 20% dos itens menos prioritários e mais antigos
    const entries = Array.from(this.cache.entries())
      .map(([key, value]) => ({
        key,
        ...value,
        score: value.priority * 1000 - (Date.now() - value.timestamp)
      }))
      .sort((a, b) => a.score - b.score);

    const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2));
    toRemove.forEach(({ key }) => {
      this.cache.delete(key);
      localStorage.removeItem(`instant_cache_${key}`);
    });
  }

  preload(key: string, fetcher: () => Promise<any>, priority = 2) {
    if (!this.has(key)) {
      fetcher()
        .then(data => this.set(key, data, priority))
        .catch(error => console.warn('Preload failed:', error));
    }
  }

  clear() {
    this.cache.clear();
    // Limpa localStorage relacionado
    Object.keys(localStorage)
      .filter(key => key.startsWith('instant_cache_'))
      .forEach(key => localStorage.removeItem(key));
  }
}

// Cache global singleton
const instantCache = new InstantCache();

export const useInstantCache = () => {
  const [, forceUpdate] = useState(0);

  const invalidate = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Auto-cleanup a cada 5 minutos
    const interval = setInterval(() => {
      instantCache.cleanup();
      invalidate();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [invalidate]);

  const setData = useCallback((key: string, data: any, priority = 1) => {
    instantCache.set(key, data, priority);
    invalidate();
  }, [invalidate]);

  const getData = useCallback((key: string) => {
    return instantCache.get(key);
  }, []);

  const hasData = useCallback((key: string) => {
    return instantCache.has(key);
  }, []);

  const preloadData = useCallback((key: string, fetcher: () => Promise<any>, priority = 2) => {
    instantCache.preload(key, fetcher, priority);
  }, []);

  const clearCache = useCallback(() => {
    instantCache.clear();
    invalidate();
  }, [invalidate]);

  return {
    setData,
    getData,
    hasData,
    preloadData,
    clearCache
  };
};

export default instantCache;