import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { throttle } from '@/utils/performance';

interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

interface VirtualScrollResult<T> {
  visibleItems: Array<T & { index: number }>;
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
}

// Hook principal para virtual scrolling
export const useVirtualScrolling = <T,>(
  items: T[],
  config: VirtualScrollConfig
): VirtualScrollResult<T> => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  
  const { itemHeight, containerHeight, overscan = 5, threshold = 0.1 } = config;

  // Calcular itens visíveis
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Itens visíveis com índices
  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, idx) => ({
        ...item,
        index: visibleRange.start + idx
      }));
  }, [items, visibleRange.start, visibleRange.end]);

  // Altura total para scrollbar
  const totalHeight = items.length * itemHeight;
  
  // Offset Y para posicionamento
  const offsetY = visibleRange.start * itemHeight;

  // Handler de scroll otimizado
  const handleScroll = useCallback(
    throttle((event: Event) => {
      const target = event.target as HTMLElement;
      setScrollTop(target.scrollTop);
    }, 16), // ~60fps
    []
  );

  // Scroll para índice específico
  const scrollToIndex = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight;
      scrollElementRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [itemHeight]);

  // Scroll para o topo
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  // Configurar scroll listener
  useEffect(() => {
    const element = scrollElementRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollToIndex,
    scrollToTop
  };
};

// Hook para virtual scrolling com busca
export const useVirtualScrollingWithSearch = <T,>(
  items: T[],
  config: VirtualScrollConfig,
  searchFn: (item: T, query: string) => boolean,
  searchQuery: string = ''
) => {
  // Filtrar itens baseado na busca
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(item => searchFn(item, searchQuery));
  }, [items, searchQuery, searchFn]);

  const virtualResult = useVirtualScrolling(filteredItems, config);

  // Função para buscar próximo item
  const findNext = useCallback((query: string) => {
    const currentIndex = Math.floor(virtualResult.offsetY / config.itemHeight);
    const nextIndex = filteredItems.findIndex((item, idx) => 
      idx > currentIndex && searchFn(item, query)
    );
    
    if (nextIndex !== -1) {
      virtualResult.scrollToIndex(nextIndex);
    }
  }, [filteredItems, virtualResult, config.itemHeight, searchFn]);

  return {
    ...virtualResult,
    filteredItemsCount: filteredItems.length,
    totalItemsCount: items.length,
    findNext
  };
};

// Hook para virtual scrolling com grupos
export const useVirtualScrollingWithGroups = <T,>(
  groups: Array<{ title: string; items: T[] }>,
  config: VirtualScrollConfig & { headerHeight?: number }
) => {
  const { headerHeight = 40 } = config;

  // Flatten grupos em lista linear
  const flatItems = useMemo(() => {
    const result: Array<{ type: 'header' | 'item'; data: any; groupIndex: number; itemIndex?: number }> = [];
    
    groups.forEach((group, groupIndex) => {
      result.push({
        type: 'header',
        data: group.title,
        groupIndex
      });
      
      group.items.forEach((item, itemIndex) => {
        result.push({
          type: 'item',
          data: item,
          groupIndex,
          itemIndex
        });
      });
    });
    
    return result;
  }, [groups]);

  // Configuração adaptada para alturas diferentes
  const adaptedConfig = {
    ...config,
    itemHeight: config.itemHeight, // Altura padrão para itens
    containerHeight: config.containerHeight
  };

  // Calcular alturas dinâmicas
  const getItemHeight = useCallback((index: number) => {
    const item = flatItems[index];
    return item?.type === 'header' ? headerHeight : config.itemHeight;
  }, [flatItems, headerHeight, config.itemHeight]);

  // Virtual scrolling customizado para alturas dinâmicas
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    let currentY = 0;
    let startIndex = 0;
    let endIndex = flatItems.length;

    // Encontrar startIndex
    for (let i = 0; i < flatItems.length; i++) {
      const itemHeight = getItemHeight(i);
      if (currentY + itemHeight > scrollTop) {
        startIndex = Math.max(0, i - 2);
        break;
      }
      currentY += itemHeight;
    }

    // Encontrar endIndex
    currentY = 0;
    for (let i = 0; i < flatItems.length; i++) {
      const itemHeight = getItemHeight(i);
      currentY += itemHeight;
      if (currentY > scrollTop + config.containerHeight + 100) {
        endIndex = Math.min(flatItems.length, i + 2);
        break;
      }
    }

    return { start: startIndex, end: endIndex };
  }, [scrollTop, flatItems, getItemHeight, config.containerHeight]);

  const visibleItems = flatItems.slice(visibleRange.start, visibleRange.end);

  // Calcular altura total
  const totalHeight = useMemo(() => {
    return flatItems.reduce((total, _, index) => total + getItemHeight(index), 0);
  }, [flatItems, getItemHeight]);

  // Calcular offset Y
  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.start; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [visibleRange.start, getItemHeight]);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop,
    getItemHeight
  };
};

// Component wrapper para virtual scrolling
interface VirtualScrollContainerProps {
  height: number;
  children: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

export const VirtualScrollContainer: React.FC<VirtualScrollContainerProps> = ({
  height,
  children,
  onScroll,
  className = ''
}) => {
  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e.currentTarget.scrollTop);
    }, 16),
    [onScroll]
  );

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      {children}
    </div>
  );
};