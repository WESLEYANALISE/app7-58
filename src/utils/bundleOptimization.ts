// Otimizações de bundle e imports dinâmicos
export const loadComponentDynamically = async (componentPath: string) => {
  try {
    const module = await import(componentPath);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error);
    return null;
  }
};

// Sistema de preloading inteligente
export class PreloadManager {
  private preloadedComponents = new Set<string>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  // Adicionar componente à fila de preload
  addToQueue(componentPath: string) {
    if (!this.preloadedComponents.has(componentPath)) {
      this.preloadQueue.push(componentPath);
      this.processQueue();
    }
  }

  // Processar fila de preload
  private async processQueue() {
    if (this.isPreloading || this.preloadQueue.length === 0) return;
    
    this.isPreloading = true;
    
    while (this.preloadQueue.length > 0) {
      const componentPath = this.preloadQueue.shift()!;
      
      if (!this.preloadedComponents.has(componentPath)) {
        try {
          // Use dynamic import with proper error handling
          const module = await import(/* @vite-ignore */ componentPath);
          this.preloadedComponents.add(componentPath);
          
          // Pequena pausa entre preloads para não bloquear a UI
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          console.warn(`Failed to preload: ${componentPath}`, error);
          // Mark as preloaded even if failed to avoid retries
          this.preloadedComponents.add(componentPath);
        }
      }
    }
    
    this.isPreloading = false;
  }

  preloadCritical() {
    const criticalComponents = [
      '@/components/AppFunctionOptimized',
      '@/components/CategoryAccessSection',
      '@/components/SocialMediaFooter',
    ];

    criticalComponents.forEach(component => {
      this.addToQueue(component);
    });
  }

  // Preload quando idle
  preloadOnIdle() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const idleComponents = [
          '@/components/Videoaulas',
          '@/components/NoticiasJuridicas',  
          '@/components/BancoQuestoes',
          '@/components/Flashcards',
          '@/components/BibliotecaClassicos',
          '@/components/AssistenteIA',
        ];

        idleComponents.forEach(component => {
          this.addToQueue(component);
        });
      });
    }
  }
}

// Instância global do preload manager
export const preloadManager = new PreloadManager();

// Função para otimizar carregamento da aplicação
export const optimizeAppLoading = () => {
  // Preload componentes críticos
  preloadManager.preloadCritical();
  
  // Preload componentes quando o usuário estiver idle
  preloadManager.preloadOnIdle();
  
  // Preload com base na interação do usuário
  document.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLElement;
    if (target.dataset.preload) {
      preloadManager.addToQueue(target.dataset.preload);
    }
  });
};