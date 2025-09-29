// Sistema de monitoramento de performance em tempo real
class PerformanceMonitor {
  private metrics = new Map<string, Array<{ timestamp: number; value: number }>>();
  private observers = new Map<string, PerformanceObserver>();
  private memoryIntervals = new Set<NodeJS.Timeout>();
  private reportingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupCoreObservers();
    this.startMemoryMonitoring();
  }

  // Configurar observadores principais
  private setupCoreObservers() {
    // Observador para métricas de navegação
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page-load', navEntry.loadEventEnd);
            this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd);
            this.recordMetric('first-paint', navEntry.loadEventStart);
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Observador para Web Vitals
      const vitalsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              this.recordMetric('lcp', entry.startTime);
              break;
            case 'first-input':
              this.recordMetric('fid', (entry as PerformanceEventTiming).processingStart - entry.startTime);
              break;
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                this.recordMetric('cls', (entry as any).value);
              }
              break;
          }
        });
      });

      try {
        vitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        this.observers.set('vitals', vitalsObserver);
      } catch (e) {
        console.warn('Web Vitals observer not supported');
      }

      // Observador para recursos
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.recordMetric('resource-load', resourceEntry.duration);
          
          // Identificar recursos lentos
          if (resourceEntry.duration > 1000) { // > 1s
            this.recordSlowResource(resourceEntry);
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  // Monitoramento de memória
  private startMemoryMonitoring() {
    if ('memory' in performance) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('heap-used', memory.usedJSHeapSize);
        this.recordMetric('heap-total', memory.totalJSHeapSize);
        this.recordMetric('heap-limit', memory.jsHeapSizeLimit);
      }, 5000); // A cada 5 segundos

      this.memoryIntervals.add(interval);
    }
  }

  // Registrar métrica
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const entries = this.metrics.get(name)!;
    entries.push({ timestamp: Date.now(), value });

    // Manter apenas os últimos 100 registros
    if (entries.length > 100) {
      entries.shift();
    }
  }

  // Registrar recursos lentos
  private recordSlowResource(entry: PerformanceResourceTiming) {
    console.warn(`Slow resource detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
    
    const slowResources = this.getSlowResources();
    slowResources.push({
      name: entry.name,
      duration: entry.duration,
      timestamp: Date.now(),
      type: this.getResourceType(entry)
    });

    // Manter apenas os últimos 20 recursos lentos
    if (slowResources.length > 20) {
      slowResources.shift();
    }

    localStorage.setItem('slow-resources', JSON.stringify(slowResources));
  }

  private getResourceType(entry: PerformanceResourceTiming): string {
    const url = entry.name;
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Medir performance de função
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(`function-${name}`, end - start);
    
    return result;
  }

  // Medir performance de função async
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(`async-function-${name}`, end - start);
    
    return result;
  }

  // Medir performance de renderização
  measureRender(componentName: string) {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      this.recordMetric(`render-${componentName}`, end - start);
    };
  }

  // Obter estatísticas
  getStats(metricName?: string) {
    if (metricName) {
      const entries = this.metrics.get(metricName) || [];
      return this.calculateStats(entries.map(e => e.value));
    }

    const allStats: Record<string, any> = {};
    this.metrics.forEach((entries, name) => {
      allStats[name] = this.calculateStats(entries.map(e => e.value));
    });

    return allStats;
  }

  private calculateStats(values: number[]) {
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  // Detectar problemas de performance
  detectPerformanceIssues() {
    const issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }> = [];

    // Verificar LCP
    const lcpStats = this.getStats('lcp');
    if (lcpStats && lcpStats.avg > 2500) {
      issues.push({
        type: 'lcp',
        severity: lcpStats.avg > 4000 ? 'high' : 'medium',
        message: `Largest Contentful Paint muito alto: ${lcpStats.avg.toFixed(0)}ms`
      });
    }

    // Verificar FID
    const fidStats = this.getStats('fid');
    if (fidStats && fidStats.avg > 100) {
      issues.push({
        type: 'fid',
        severity: fidStats.avg > 300 ? 'high' : 'medium',
        message: `First Input Delay muito alto: ${fidStats.avg.toFixed(0)}ms`
      });
    }

    // Verificar uso de memória
    const heapStats = this.getStats('heap-used');
    if (heapStats && heapStats.max > 50 * 1024 * 1024) { // 50MB
      issues.push({
        type: 'memory',
        severity: heapStats.max > 100 * 1024 * 1024 ? 'high' : 'medium',
        message: `Alto uso de memória: ${(heapStats.max / 1024 / 1024).toFixed(1)}MB`
      });
    }

    // Verificar recursos lentos
    const slowResources = this.getSlowResources();
    if (slowResources.length > 5) {
      issues.push({
        type: 'slow-resources',
        severity: 'medium',
        message: `${slowResources.length} recursos lentos detectados`
      });
    }

    return issues;
  }

  private getSlowResources() {
    try {
      return JSON.parse(localStorage.getItem('slow-resources') || '[]');
    } catch {
      return [];
    }
  }

  // Relatório de performance
  generateReport() {
    const stats = this.getStats();
    const issues = this.detectPerformanceIssues();
    const slowResources = this.getSlowResources();

    return {
      timestamp: new Date().toISOString(),
      metrics: stats,
      issues,
      slowResources,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generateRecommendations(issues: any[]) {
    const recommendations: string[] = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'lcp':
          recommendations.push('Otimize o carregamento de imagens e fonts críticos');
          break;
        case 'fid':
          recommendations.push('Reduza o JavaScript no thread principal');
          break;
        case 'memory':
          recommendations.push('Implemente limpeza de memória e cache mais agressivo');
          break;
        case 'slow-resources':
          recommendations.push('Otimize recursos lentos ou implemente lazy loading');
          break;
      }
    });

    return recommendations;
  }

  // Iniciar relatórios automáticos
  startAutoReporting(intervalMs = 60000) { // 1 minuto
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }

    this.reportingInterval = setInterval(() => {
      const report = this.generateReport();
      
      // Log apenas se houver problemas
      if (report.issues.length > 0) {
        console.group('Performance Issues Detected');
        report.issues.forEach(issue => {
          console.warn(`[${issue.severity.toUpperCase()}] ${issue.message}`);
        });
        console.groupEnd();
      }
    }, intervalMs);
  }

  // Parar monitoramento
  stop() {
    this.observers.forEach(observer => observer.disconnect());
    this.memoryIntervals.forEach(interval => clearInterval(interval));
    
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }
  }
}

// Instância global
export const performanceMonitor = new PerformanceMonitor();

// Hook React para monitoramento
export const usePerformanceMonitor = () => {
  return {
    monitor: performanceMonitor,
    measureRender: performanceMonitor.measureRender.bind(performanceMonitor),
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  };
};

// Inicialização automática
if (typeof window !== 'undefined') {
  // Iniciar relatórios em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    performanceMonitor.startAutoReporting(30000); // 30 segundos em dev
  } else {
    performanceMonitor.startAutoReporting(300000); // 5 minutos em produção
  }
}