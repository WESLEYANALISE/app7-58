import { useCallback, useEffect, useMemo } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { superCache } from '@/utils/superCache';
import { preloadCriticalData } from '@/utils/superCache';

// Mapeamento de rotas para preload inteligente
const ROUTE_PRELOAD_MAP = {
  'vade-mecum': ['legal-codes', 'vade-mecum-articles'],
  'videoaulas': ['video-areas', 'video-metadata'],
  'biblioteca': ['book-categories', 'book-covers'],
  'noticias': ['news-sources', 'latest-news'],
  'assistente-ia': ['ai-contexts', 'conversation-history'],
  'banco-questoes': ['question-categories', 'quiz-metadata'],
  'mapas-mentais': ['mind-map-templates', 'user-maps'],
  'flashcards': ['card-decks', 'user-progress'],
  'cursos': ['course-categories', 'lesson-progress'],
  'simulados': ['exam-types', 'simulation-history']
};

interface NavigationState {
  currentFunction: string | null;
  history: string[];
  preloadQueue: string[];
}

// Hook para navegação ultra-rápida
export const useUltraFastNavigation = () => {
  const { currentFunction, setCurrentFunction } = useNavigation();

  // Estado da navegação em cache
  const navigationState = useMemo(() => 
    superCache.get('navigation-state') || {
      currentFunction: null,
      history: [],
      preloadQueue: []
    }, 
    [currentFunction]
  );

  // Preload inteligente baseado na rota atual
  const preloadForRoute = useCallback(async (route: string | null) => {
    if (!route || !ROUTE_PRELOAD_MAP[route as keyof typeof ROUTE_PRELOAD_MAP]) return;

    const preloadKeys = ROUTE_PRELOAD_MAP[route as keyof typeof ROUTE_PRELOAD_MAP];
    
    // Preload em background sem bloquear UI
    requestIdleCallback(() => {
      preloadKeys.forEach(key => {
        if (!superCache.has(key)) {
          // Adicionar à fila de preload
          const currentQueue = superCache.get('preload-queue') || [];
          if (!currentQueue.includes(key)) {
            superCache.set('preload-queue', [...currentQueue, key], 30000, 3);
          }
        }
      });
    });
  }, []);

  // Navegação otimizada com cache e preload
  const navigateToFunction = useCallback((functionName: string | null) => {
    // Salvar estado atual
    const newState: NavigationState = {
      currentFunction: functionName,
      history: functionName 
        ? [...navigationState.history.slice(-9), functionName] 
        : navigationState.history,
      preloadQueue: navigationState.preloadQueue
    };

    // Cache do estado de navegação
    superCache.set('navigation-state', newState, 60000, 5); // 1 minuto, alta prioridade

    // Aplicar mudança
    setCurrentFunction(functionName);

    // Preload para a nova rota
    preloadForRoute(functionName);

    // Scroll suave para o topo
    if (functionName) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Analytics de navegação (não bloqueia UI)
    setTimeout(() => {
      console.log(`Navigation: ${navigationState.currentFunction} -> ${functionName}`);
    }, 0);
  }, [navigationState, setCurrentFunction, preloadForRoute]);

  // Navegação com histórico
  const goBack = useCallback(() => {
    const history = navigationState.history;
    if (history.length > 1) {
      const previousFunction = history[history.length - 2];
      const newHistory = history.slice(0, -1);
      
      const newState: NavigationState = {
        currentFunction: previousFunction,
        history: newHistory,
        preloadQueue: navigationState.preloadQueue
      };

      superCache.set('navigation-state', newState, 60000, 5);
      setCurrentFunction(previousFunction);
    } else {
      navigateToFunction(null); // Volta para home
    }
  }, [navigationState, setCurrentFunction, navigateToFunction]);

  // Navegação instantânea para rotas frequentes
  const quickNavigate = useCallback((functionName: string) => {
    // Verifica se já temos dados em cache
    const routeKeys = ROUTE_PRELOAD_MAP[functionName as keyof typeof ROUTE_PRELOAD_MAP] || [];
    const hasCachedData = routeKeys.some(key => superCache.has(key));

    if (hasCachedData) {
      // Navegação instantânea
      navigateToFunction(functionName);
    } else {
      // Navegação com loading mínimo
      navigateToFunction(functionName);
      
      // Preload crítico em paralelo
      requestIdleCallback(() => {
        preloadForRoute(functionName);
      });
    }
  }, [navigateToFunction, preloadForRoute]);

  // Preload das rotas mais acessadas
  const preloadPopularRoutes = useCallback(() => {
    const popularRoutes = ['vade-mecum', 'videoaulas', 'biblioteca', 'noticias'];
    
    requestIdleCallback(() => {
      popularRoutes.forEach(route => {
        preloadForRoute(route);
      });
    });
  }, [preloadForRoute]);

  // Reset completo da navegação
  const resetNavigation = useCallback(() => {
    const resetState: NavigationState = {
      currentFunction: null,
      history: [],
      preloadQueue: []
    };

    superCache.set('navigation-state', resetState, 60000, 5);
    setCurrentFunction(null);
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentFunction]);

  // Navegação com contexto (para deep linking)
  const navigateWithContext = useCallback((functionName: string, context?: any) => {
    if (context) {
      superCache.set(`context-${functionName}`, context, 300000, 4); // 5 minutos
    }
    navigateToFunction(functionName);
  }, [navigateToFunction]);

  // Preload inicial na primeira renderização
  useEffect(() => {
    preloadCriticalData();
    preloadPopularRoutes();
  }, [preloadPopularRoutes]);

  // Preload quando o usuário fica idle
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        preloadPopularRoutes();
      }, 2000); // 2 segundos de idle
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [preloadPopularRoutes]);

  return {
    currentFunction,
    navigationHistory: navigationState.history,
    navigateToFunction,
    quickNavigate,
    goBack,
    resetNavigation,
    navigateWithContext,
    preloadForRoute,
    canGoBack: navigationState.history.length > 1
  };
};

// Hook para preload baseado em interação
export const useSmartPreload = () => {
  const { preloadForRoute } = useUltraFastNavigation();

  // Preload on hover
  const preloadOnHover = useCallback((functionName: string) => {
    return {
      onMouseEnter: () => {
        requestIdleCallback(() => {
          preloadForRoute(functionName);
        });
      }
    };
  }, [preloadForRoute]);

  // Preload on focus (para acessibilidade)
  const preloadOnFocus = useCallback((functionName: string) => {
    return {
      onFocus: () => {
        requestIdleCallback(() => {
          preloadForRoute(functionName);
        });
      }
    };
  }, [preloadForRoute]);

  return {
    preloadOnHover,
    preloadOnFocus
  };
};