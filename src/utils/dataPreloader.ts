// Sistema de preload simplificado para carregamento instantâneo
import { cacheManager } from './cacheManager';
import { supabase } from '@/integrations/supabase/client';
interface PreloadConfig {
  key: string;
  query: () => Promise<any>;
  ttl?: number;
  priority: 'high' | 'medium' | 'low';
}

class DataPreloader {
  private preloadQueue: PreloadConfig[] = [];
  private preloadedData = new Set<string>();
  private isPreloading = false;

  setupPreloadQueries() {
    const queries: PreloadConfig[] = [
      // High priority - dados críticos
      {
        key: 'user_profile',
        query: async () => {
          try {
            // Simulação simples sem Supabase complexo
            return { id: 1, name: 'User' };
          } catch (error) {
            return null;
          }
        },
        ttl: 15 * 60 * 1000,
        priority: 'high'
      },
      // Atualizar notícias jurídicas em background antes do usuário abrir
      {
        key: 'legal_news_warmup',
        query: async () => {
          try {
            const { data, error } = await supabase.functions.invoke('legal-news-radar');
            if (error) throw error;
            return data?.data ?? [];
          } catch (e) {
            console.warn('Warmup legal news failed, continuing silently');
            return [];
          }
        },
        ttl: 10 * 60 * 1000,
        priority: 'high'
      },
      // Cachear a lista para leitura imediata
      {
        key: 'legal_news',
        query: async () => {
          try {
            const { data, error } = await supabase.rpc('get_fresh_legal_news');
            if (error) throw error;
            return data ?? [];
          } catch (e) {
            return [];
          }
        },
        ttl: 10 * 60 * 1000,
        priority: 'high'
      }
    ];

    this.preloadQueue = queries;
  }

  // Iniciar preload de dados
  async startPreloading() {
    if (this.isPreloading) return;
    this.isPreloading = true;

    // Preload simples
    setTimeout(() => {
      this.preloadQueue.forEach(config => this.preloadSingle(config));
    }, 100);
  }

  // Preload uma query específica
  private async preloadSingle(config: PreloadConfig) {
    if (this.preloadedData.has(config.key)) return;

    try {
      const result = await config.query();
      cacheManager.set(config.key, result, config.ttl);
      this.preloadedData.add(config.key);
    } catch (error) {
      console.warn(`Failed to preload ${config.key}:`, error);
    }
  }

  getPreloadedData(key: string) {
    return cacheManager.get(key);
  }

  isDataPreloaded(key: string): boolean {
    return this.preloadedData.has(key);
  }
}

// Instância global
export const dataPreloader = new DataPreloader();

// Hook simples
export const usePreloadedData = (key: string) => {
  return {
    data: dataPreloader.getPreloadedData(key),
    isPreloaded: dataPreloader.isDataPreloaded(key)
  };
};

// Auto-inicializar
if (typeof window !== 'undefined') {
  dataPreloader.setupPreloadQueries();
  dataPreloader.startPreloading();
}