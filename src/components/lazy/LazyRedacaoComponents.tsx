import { lazy } from 'react';

// Lazy load redação components for better performance
export const LazyCorrigirRedacao = lazy(() => 
  import('@/components/Redacao/CorrigirRedacao').then(module => ({ 
    default: module.CorrigirRedacao 
  }))
);

export const LazyRedacaoVideoaulas = lazy(() => 
  import('@/components/Redacao/RedacaoVideoaulas').then(module => ({ 
    default: module.RedacaoVideoaulas 
  }))
);

export const LazyRedacaoMenuInicial = lazy(() => 
  import('@/components/Redacao/RedacaoMenuInicial').then(module => ({ 
    default: module.RedacaoMenuInicial 
  }))
);