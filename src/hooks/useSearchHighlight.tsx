import { useEffect, useState, useCallback } from 'react';

export interface SearchHighlightData {
  itemId?: string;
  itemTitle?: string;
  highlightItem?: boolean;
  pulseAnimation?: boolean;
  scrollToItem?: boolean;
  highlightTerm?: string;
}

export const useSearchHighlight = () => {
  const [highlightData, setHighlightData] = useState<SearchHighlightData | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Verificar se há dados de navegação no sessionStorage
  useEffect(() => {
    const checkNavigationContext = () => {
      const contextData = sessionStorage.getItem('navigationContext');
      if (contextData) {
        try {
          const context = JSON.parse(contextData);
          if (context.highlightItem || context.pulseAnimation || context.scrollToItem) {
            setHighlightData(context);
            setHighlightedItemId(context.itemId || context.itemTitle);
            
            // Limpar dados após uso
            setTimeout(() => {
              sessionStorage.removeItem('navigationContext');
            }, 1000);
          }
        } catch (error) {
          console.error('Error parsing navigation context:', error);
        }
      }
    };

    checkNavigationContext();
    
    // Verificar periodicamente por novos dados
    const interval = setInterval(checkNavigationContext, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Função para scrollar e destacar um item específico
  const highlightAndScrollToItem = useCallback((itemElement: HTMLElement, delay: number = 1000) => {
    if (!itemElement) return;

    // Scroll suave até o item
    itemElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // Adicionar classes de destaque com delay
    setTimeout(() => {
      itemElement.classList.add('search-highlight', 'animate-pulse');
      itemElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
      itemElement.style.border = '2px solid rgba(59, 130, 246, 0.8)';
      itemElement.style.transform = 'scale(1.05)';
      itemElement.style.transition = 'all 0.3s ease-in-out';
      
      // Remover destaque após alguns segundos
      setTimeout(() => {
        itemElement.classList.remove('search-highlight', 'animate-pulse');
        itemElement.style.boxShadow = '';
        itemElement.style.border = '';
        itemElement.style.transform = '';
        setHighlightedItemId(null);
        setHighlightData(null);
      }, 3000);
    }, delay);
  }, []);

  // Função para verificar se um item deve ser destacado
  const shouldHighlightItem = useCallback((itemId: string | number, itemTitle?: string): boolean => {
    if (!highlightData || !highlightedItemId) return false;
    
    const idMatch = itemId.toString() === highlightedItemId;
    const titleMatch = itemTitle?.toLowerCase().includes(highlightData.highlightTerm?.toLowerCase() || '');
    
    return idMatch || (titleMatch && Boolean(highlightData.highlightTerm));
  }, [highlightData, highlightedItemId]);

  // Hook para elementos que precisam ser observados
  const useItemHighlight = useCallback((itemId: string | number, ref: React.RefObject<HTMLElement>, itemTitle?: string) => {
    useEffect(() => {
      if (shouldHighlightItem(itemId, itemTitle) && ref.current && highlightData?.scrollToItem) {
        highlightAndScrollToItem(ref.current);
      }
    }, [itemId, itemTitle, ref]);
  }, [shouldHighlightItem, highlightAndScrollToItem, highlightData]);

  return {
    highlightData,
    highlightedItemId,
    shouldHighlightItem,
    highlightAndScrollToItem,
    useItemHighlight
  };
};