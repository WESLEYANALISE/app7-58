// Sistema de carregamento instantâneo para todos os componentes
import { preloadManager } from './bundleOptimization';

// Lista completa de componentes para preload agressivo - apenas componentes que existem
const ALL_COMPONENTS = [
  // Layouts
  '@/components/DesktopLayout', 
  '@/components/TabletLayout',
  
  // Core Components
  '@/components/CategoryAccessSection',
  '@/components/SocialMediaFooter',
  '@/components/AppFunctionOptimized',
  '@/components/QuickAccessSection',
  
  // Features que existem
  '@/components/NoticiasJuridicas',
  '@/components/BancoQuestoes',
  '@/components/Flashcards',
  '@/components/BibliotecaClassicos',
  '@/components/AssistenteIA',
  '@/components/Loja',
  '@/components/Premium',
  '@/components/Comunidade',
  '@/components/Explorar',
  '@/components/Downloads',
  
  // Specialized Components
  '@/components/Redacao',
  '@/components/MapasMentais',
  '@/components/Anotacoes',
  '@/components/AIDocumentAnalyzer',
  
  // UI Components
  '@/components/ProductCarousel',
  '@/components/FeaturesGrid',
  '@/components/FeaturesCarousel',
  '@/components/StatsSection',
  '@/components/BibliotecaEstudos',
];

// Componentes de UI críticos
const UI_COMPONENTS = [
  '@/components/ui/button',
  '@/components/ui/card',
  '@/components/ui/dialog',
  '@/components/ui/tabs',
  '@/components/ui/toast',
  '@/components/ui/select',
  '@/components/ui/input',
  '@/components/ui/textarea',
];

class InstantLoader {
  private loadedComponents = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();
  private isInitialized = false;

  // Inicialização agressiva
  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Registrar service worker
    this.registerServiceWorker();
    
    // Preload críticos imediatamente
    this.preloadCritical();
    
    // Preload todos os componentes quando idle
    this.preloadAllWhenIdle();
    
    // Setup prefetch de dados
    this.setupDataPrefetch();
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
          
          // Enviar lista de componentes para preload
          if (registration.active) {
            registration.active.postMessage({
              type: 'PRELOAD_COMPONENTS',
              components: ALL_COMPONENTS
            });
          }
        })
        .catch(error => console.log('SW registration failed:', error));
    }
  }

  // Preload componentes críticos imediatamente
  private preloadCritical() {
    const critical = [
      '@/components/CategoryAccessSection',
      '@/components/SocialMediaFooter',
      '@/components/AppFunctionOptimized',
      '@/components/DesktopLayout',
      ...UI_COMPONENTS.slice(0, 5) // UI mais usados
    ];

    critical.forEach(component => {
      this.preloadComponent(component);
    });
  }

  // Preload todos os componentes quando idle
  private preloadAllWhenIdle() {
    const preloadBatch = (components: string[], delay = 10) => {
      components.forEach((component, index) => {
        setTimeout(() => {
          this.preloadComponent(component);
        }, index * delay);
      });
    };

    // Usar requestIdleCallback se disponível
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadBatch(ALL_COMPONENTS, 5);
        preloadBatch(UI_COMPONENTS, 2);
      }, { timeout: 1000 });
    } else {
      // Fallback para setTimeout
      setTimeout(() => {
        preloadBatch(ALL_COMPONENTS, 5);
        preloadBatch(UI_COMPONENTS, 2);
      }, 100);
    }
  }

  // Preload um componente específico
  async preloadComponent(componentPath: string) {
    if (this.loadedComponents.has(componentPath)) {
      return this.loadingPromises.get(componentPath);
    }

    const loadPromise = import(componentPath)
      .then(module => {
        this.loadedComponents.add(componentPath);
        return module;
      })
      .catch(error => {
        console.warn(`Failed to preload ${componentPath}:`, error);
        return null;
      });

    this.loadingPromises.set(componentPath, loadPromise);
    return loadPromise;
  }

  // Setup prefetch de dados
  private setupDataPrefetch() {
    // Prefetch dados quando usuário hover em botões
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      
      // Prefetch baseado em data attributes
      if (target.dataset.prefetchData) {
        this.prefetchData(target.dataset.prefetchData);
      }
      
      // Prefetch componentes baseado em hover
      if (target.dataset.prefetchComponent) {
        this.preloadComponent(target.dataset.prefetchComponent);
      }
    });

    // Prefetch quando usuário interage com elementos
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.prefetchOnFocus) {
        this.preloadComponent(target.dataset.prefetchOnFocus);
      }
    }, true);
  }

  // Prefetch de dados
  private async prefetchData(dataType: string) {
    // Implementar prefetch baseado no tipo de dados
    switch (dataType) {
      case 'videos':
        // Prefetch lista de videos
        break;
      case 'noticias':
        // Prefetch notícias
        break;
      case 'questoes':
        // Prefetch questões
        break;
    }
  }

  // Verificar se componente está carregado
  isComponentLoaded(componentPath: string): boolean {
    return this.loadedComponents.has(componentPath);
  }

  // Obter estatísticas de carregamento
  getStats() {
    return {
      loaded: this.loadedComponents.size,
      total: ALL_COMPONENTS.length + UI_COMPONENTS.length,
      loadedComponents: Array.from(this.loadedComponents)
    };
  }
}

// Instância global
export const instantLoader = new InstantLoader();

// Hook para usar o instant loader
export const useInstantLoader = () => {
  return {
    preload: (component: string) => instantLoader.preloadComponent(component),
    isLoaded: (component: string) => instantLoader.isComponentLoaded(component),
    stats: () => instantLoader.getStats()
  };
};

// Auto-inicializar
if (typeof window !== 'undefined') {
  // Inicializar o mais cedo possível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      instantLoader.initialize();
    });
  } else {
    instantLoader.initialize();
  }
}