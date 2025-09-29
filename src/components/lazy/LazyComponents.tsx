// Performance-optimized lazy loading for instant navigation
import { lazy } from 'react';

// Core components - high priority
export const LazyFlashcards = lazy(() => import('@/components/Flashcards'));
export const LazyBloggerJuridico = lazy(() => import('@/components/BloggerJuridico'));
export const LazyPlanoEstudo = lazy(() => import('@/components/PlanoEstudo/PlanoEstudo').then(module => ({ default: module.PlanoEstudo })));
export const LazyRedacao = lazy(() => import('@/components/Redacao').then(module => ({ default: module.Redacao })));
export const LazyVadeMecum = lazy(() => import('@/components/VadeMecum').then(module => ({ default: module.VadeMecum })));
export const LazyBibliotecaAreas = lazy(() => import('@/components/BibliotecaAreas').then(module => ({ default: module.BibliotecaAreas })));
export const LazyNoticiasJuridicas = lazy(() => import('@/components/NoticiasJuridicas').then(module => ({ default: module.NoticiasJuridicas })));
export const LazyRadarJuridico = lazy(() => import('@/components/RadarJuridico').then(module => ({ default: module.RadarJuridico })));
export const LazyVideoaulas = lazy(() => import('@/components/Videoaulas').then(module => ({ default: module.Videoaulas })));
export const LazyCursosPreparatorios = lazy(() => import('@/components/CursosPreparatorios').then(module => ({ default: module.CursosPreparatorios })));
export const LazyBancoQuestoes = lazy(() => import('@/components/BancoQuestoes').then(module => ({ default: module.BancoQuestoes })));
export const LazyAssistenteIA = lazy(() => import('@/components/AssistenteIA').then(module => ({ default: module.AssistenteIA })));
export const LazyProfessoraIA = lazy(() => import('@/components/ProfessoraIA'));
export const LazyMapasMentais = lazy(() => import('@/components/MapasMentais').then(module => ({ default: module.MapasMentais })));
export const LazyListaTarefas = lazy(() => import('@/components/ListaTarefas').then(module => ({ default: module.ListaTarefas })));
export const LazyAnotacoes = lazy(() => import('@/components/Anotacoes').then(module => ({ default: module.Anotacoes })));
export const LazyDownloads = lazy(() => import('@/components/Downloads').then(module => ({ default: module.Downloads })));
export const LazyComunidade = lazy(() => import('@/components/Comunidade').then(module => ({ default: module.Comunidade })));
export const LazyPremium = lazy(() => import('@/components/Premium').then(module => ({ default: module.Premium })));

// Lazy loading para componentes pesados com preloading
export const LazyFeaturesGrid = lazy(() => 
  import('@/components/FeaturesGrid').then(module => ({ default: module.FeaturesGrid }))
);

export const LazyFeaturesCarousel = lazy(() => 
  import('@/components/FeaturesCarousel').then(module => ({ default: module.FeaturesCarousel }))
);

export const LazyStatsSection = lazy(() => 
  import('@/components/StatsSection').then(module => ({ default: module.StatsSection }))
);

export const LazySocialMediaFooter = lazy(() => 
  import('@/components/SocialMediaFooter').then(module => ({ default: module.SocialMediaFooter }))
);

export const LazySuporteTab = lazy(() => 
  import('@/components/SuporteTab').then(module => ({ default: module.SuporteTab }))
);

export const LazyAppFunction = lazy(() => 
  import('@/components/AppFunctionOptimized').then(module => ({ default: module.AppFunction }))
);

// Novos componentes lazy para otimização
export const LazyProductCarousel = lazy(() => 
  import('@/components/ProductCarousel')
);

export const LazyQuickAccessSection = lazy(() => 
  import('@/components/QuickAccessSection').then(module => ({ default: module.QuickAccessSection }))
);

export const LazyBibliotecaClassicos = lazy(() => 
  import('@/components/BibliotecaClassicos').then(module => ({ default: module.BibliotecaClassicos }))
);

export const LazyBibliotecaConcursoPublico = lazy(() => 
  import('@/components/BibliotecaConcursoPublico').then(module => ({ default: module.BibliotecaConcursoPublico }))
);

export const LazyBibliotecaExameOAB = lazy(() => 
  import('@/components/BibliotecaExameOAB').then(module => ({ default: module.BibliotecaExameOAB }))
);

export const LazyLoja = lazy(() => 
  import('@/components/Loja').then(module => ({ default: module.Loja }))
);

export const LazyAIDocumentAnalyzer = lazy(() => 
  import('@/components/AIDocumentAnalyzer').then(module => ({ default: module.AIDocumentAnalyzer }))
);

export const LazyCategoryAccessSection = lazy(() => 
  import('@/components/CategoryAccessSection').then(module => ({ default: module.CategoryAccessSection }))
);

export const LazyPeticoes = lazy(() => 
  import('@/components/Peticoes')
);

// Preload functions para componentes críticos
export const preloadCriticalComponents = () => {
  // Preload componentes que serão usados com frequência
  import('@/components/ProductCarousel');
  import('@/components/CategoryAccessSection');
  import('@/components/AppFunctionOptimized');
  
  // Preload recursos críticos
  requestIdleCallback(() => {
    import('@/components/Videoaulas');
    import('@/components/NoticiasJuridicas');
    import('@/components/BancoQuestoes');
    import('@/components/PlanoEstudo/PlanoEstudo');
    import('@/components/Flashcards');
    import('@/components/BloggerJuridico');
  });
};