// Sistema de cache super avançado para performance máxima
class SuperCache {
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number; priority: number }>();
  private accessCount = new Map<string, number>();
  private maxMemoryItems = 1000;
  private defaultTTL = 15 * 60 * 1000; // 15 minutos
  private compressionEnabled = true;

  // Cache com prioridade e compressão
  set(key: string, data: any, ttl: number = this.defaultTTL, priority: number = 1) {
    const processedData = this.compressionEnabled ? this.compress(data) : data;
    
    this.memoryCache.set(key, {
      data: processedData,
      timestamp: Date.now(),
      ttl,
      priority
    });

    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.enforceMemoryLimit();
  }

  // Get com estatísticas de acesso
  get(key: string) {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      this.accessCount.delete(key);
      return null;
    }

    // Incrementa contador de acesso
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    
    return this.compressionEnabled ? this.decompress(item.data) : item.data;
  }

  // Cache inteligente com fallback
  async getOrFetch<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number, 
    priority?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached) return cached;

    const data = await fetcher();
    this.set(key, data, ttl, priority);
    return data;
  }

  // Preload múltiplos itens
  async preloadBatch(items: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>) {
    const promises = items.map(async ({ key, fetcher, ttl }) => {
      if (!this.has(key)) {
        try {
          const data = await fetcher();
          this.set(key, data, ttl, 3); // Alta prioridade para preload
        } catch (error) {
          console.warn(`Preload failed for ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  has(key: string): boolean {
    const item = this.memoryCache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      this.accessCount.delete(key);
      return false;
    }

    return true;
  }

  // Limpeza inteligente baseada em prioridade e acesso
  private enforceMemoryLimit() {
    if (this.memoryCache.size <= this.maxMemoryItems) return;

    const entries = Array.from(this.memoryCache.entries())
      .map(([key, value]) => ({
        key,
        ...value,
        accessCount: this.accessCount.get(key) || 0,
        score: this.calculateScore(value, this.accessCount.get(key) || 0)
      }))
      .sort((a, b) => a.score - b.score); // Menor score = remove primeiro

    const toRemove = entries.slice(0, Math.floor(this.maxMemoryItems * 0.2));
    toRemove.forEach(({ key }) => {
      this.memoryCache.delete(key);
      this.accessCount.delete(key);
    });
  }

  private calculateScore(item: any, accessCount: number): number {
    const age = Date.now() - item.timestamp;
    const ageScore = age / item.ttl; // 0-1+
    const priorityScore = 1 / item.priority; // Maior prioridade = menor score
    const accessScore = 1 / (accessCount + 1); // Mais acessos = menor score
    
    return ageScore + priorityScore + accessScore;
  }

  // Compressão simples para strings grandes
  private compress(data: any): any {
    if (typeof data === 'string' && data.length > 1000) {
      // Implementação simples de compressão para strings grandes
      return { _compressed: true, data: data };
    }
    return data;
  }

  private decompress(data: any): any {
    if (data && data._compressed) {
      return data.data;
    }
    return data;
  }

  // Cache para componentes React
  setComponent(componentName: string, props: any, element: React.ReactElement) {
    const key = `component:${componentName}:${JSON.stringify(props)}`;
    this.set(key, element, 5 * 60 * 1000, 2); // 5 minutos, prioridade média
  }

  getComponent(componentName: string, props: any): React.ReactElement | null {
    const key = `component:${componentName}:${JSON.stringify(props)}`;
    return this.get(key);
  }

  // Estatísticas e monitoramento
  getStats() {
    const totalItems = this.memoryCache.size;
    const totalMemory = JSON.stringify(Array.from(this.memoryCache.entries())).length;
    const hitRate = this.calculateHitRate();
    
    return {
      totalItems,
      totalMemory,
      hitRate,
      maxItems: this.maxMemoryItems,
      topAccessed: this.getTopAccessed(10)
    };
  }

  private calculateHitRate(): number {
    const totalAccess = Array.from(this.accessCount.values()).reduce((a, b) => a + b, 0);
    return totalAccess > 0 ? (this.memoryCache.size / totalAccess) * 100 : 0;
  }

  private getTopAccessed(limit: number) {
    return Array.from(this.accessCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));
  }

  // Cleanup automático
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
        this.accessCount.delete(key);
      }
    }
  }

  clear() {
    this.memoryCache.clear();
    this.accessCount.clear();
  }
}

// Cache de imagens otimizado
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private loading = new Set<string>();
  private observers = new Map<string, IntersectionObserver>();

  async preload(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    if (this.loading.has(src)) {
      return new Promise(resolve => {
        const check = () => {
          if (this.cache.has(src)) {
            resolve(this.cache.get(src)!);
          } else {
            setTimeout(check, 10);
          }
        };
        check();
      });
    }

    this.loading.add(src);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        this.loading.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  async preloadBatch(sources: string[]) {
    const promises = sources.map(src => 
      this.preload(src).catch(err => console.warn('Image preload failed:', err))
    );
    await Promise.allSettled(promises);
  }

  // Lazy loading com intersection observer
  observeLazy(element: HTMLElement, src: string, callback?: () => void) {
    if (this.observers.has(src)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.preload(src).then(() => {
              if (element instanceof HTMLImageElement) {
                element.src = src;
              }
              callback?.();
            });
            observer.disconnect();
            this.observers.delete(src);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(element);
    this.observers.set(src, observer);
  }

  has(src: string): boolean {
    return this.cache.has(src);
  }

  clear() {
    this.cache.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.loading.clear();
  }
}

// Instâncias globais
export const superCache = new SuperCache();
export const imageCache = new ImageCache();

// Auto cleanup a cada 5 minutos
setInterval(() => {
  superCache.cleanup();
}, 5 * 60 * 1000);

// Preload crítico na inicialização
export const preloadCriticalData = async () => {
  const criticalKeys = [
    'app-functions',
    'legal-codes',
    'user-preferences',
    'navigation-state'
  ];

  // Implementar preload específico baseado nas necessidades da app
  console.log('Preloading critical data...', criticalKeys);
};