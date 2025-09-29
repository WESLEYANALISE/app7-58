import React, { useEffect, useState, memo, useCallback, useMemo, useRef } from 'react';
import { useProdutos } from '@/hooks/useProdutos';
import { useNavigation } from '@/context/NavigationContext';
const ProductCarousel = memo(() => {
  const {
    data: produtos,
    isLoading
  } = useProdutos();
  const {
    setCurrentFunction
  } = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledProdutos, setShuffledProdutos] = useState([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Função para embaralhar array - memoizada
  const shuffleArray = useCallback((array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Memoizar produtos filtrados e embaralhados - otimizado para performance
  const filteredAndShuffledProdutos = useMemo(() => {
    if (!produtos || produtos.length === 0) return [];
    const filteredProdutos = produtos.filter((produto: any) => {
      const area = produto.area;
      return area === 'Oratória' || area === 'Oratorio' || area === 'Clássicos' || area === 'Classicos' || 
             area === 'Constitucional' || area === 'Civil' || area === 'Penal' || area === 'Tributário' ||
             area === 'Direito Empresarial' || area === 'Administrativo' || area === 'Trabalhista';
    }).slice(0, 20); // Aumentar para ter bastante livros
    
    const shuffled = shuffleArray(filteredProdutos);
    return shuffled;
  }, [produtos, shuffleArray]);

  // Atualizar shuffledProdutos apenas quando necessário
  useEffect(() => {
    setShuffledProdutos(filteredAndShuffledProdutos);
  }, [filteredAndShuffledProdutos]);

  // Navegação melhorada com animações
  const handlePrevious = useCallback(() => {
    if (isTransitioning || isDragging) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev === 0 ? shuffledProdutos.length - 1 : prev - 1);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [shuffledProdutos.length, isTransitioning, isDragging]);
  const handleNext = useCallback(() => {
    if (isTransitioning || isDragging) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev === shuffledProdutos.length - 1 ? 0 : prev + 1);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [shuffledProdutos.length, isTransitioning, isDragging]);

  // Auto-scroll otimizado
  useEffect(() => {
    if (!shuffledProdutos || shuffledProdutos.length === 0 || isDragging) return;
    const interval = setInterval(() => {
      if (!isDragging && !isTransitioning) {
        setCurrentIndex(prevIndex => (prevIndex + 1) % shuffledProdutos.length);
      }
    }, 5000); // Tempo aumentado para melhor UX
    return () => clearInterval(interval);
  }, [shuffledProdutos.length, isDragging, isTransitioning]);

  // Funções melhoradas para swipe fluido
  const minSwipeDistance = 50;
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchCurrentX(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchCurrentX(currentX);
    setTouchEnd(currentX);

    // Calcular offset para animação em tempo real
    const offset = currentX - touchStart;
    const maxOffset = carouselRef.current?.offsetWidth || 300;
    const normalizedOffset = Math.max(-maxOffset / 3, Math.min(maxOffset / 3, offset));
    setDragOffset(normalizedOffset);
  }, [touchStart]);
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
    setTouchCurrentX(null);
  }, [touchStart, touchEnd, handleNext, handlePrevious]);

  // Função para navegar para Biblioteca de Clássicos
  const handleBookClick = useCallback(() => {
    if (!isDragging) {
      setCurrentFunction('Biblioteca de Clássicos');
    }
  }, [setCurrentFunction, isDragging]);
  if (isLoading) {
    return <div className="w-full h-32 bg-gradient-to-r from-store-primary/10 to-premium-primary/10 
                      rounded-xl flex items-center justify-center shadow-lg">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-store-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        </div>
      </div>;
  }
  if (!shuffledProdutos || shuffledProdutos.length === 0) {
    return <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-r from-store-primary/10 to-premium-primary/10 
                      rounded-2xl flex items-center justify-center shadow-lg animate-fade-in">
        <p className="text-sm text-muted-foreground">Produtos em breve...</p>
      </div>;
  }
  return <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-store-primary/5 to-premium-primary/5 
                    shadow-lg sm:shadow-2xl border animate-scale-in">
      {/* Título do Carrossel com animação melhorada */}
      <div className="text-center py-3 sm:py-4 md:py-6 bg-gradient-to-r from-store-primary/10 to-premium-primary/10 
                      relative overflow-hidden animate-fade-in-up">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent-legal/5 to-primary/5 animate-shimmer" />
        
        <div className="relative z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text-legal mb-1 sm:mb-2 animate-stagger-fade">
            📚 Livros em Destaque
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-4 animate-fade-in" style={{
          animationDelay: '200ms'
        }}>
            Livros selecionados especialmente para seus estudos
          </p>
        </div>
      </div>
      
      {/* Carrossel de Imagens - Melhorado para touch */}
      <div ref={carouselRef} className="relative h-40 sm:h-48 md:h-56 lg:h-72 xl:h-80 overflow-hidden group rounded-2xl
                   shadow-2xl bg-gradient-to-br from-background via-card to-background
                   cursor-grab active:cursor-grabbing select-none" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{
      userSelect: 'none'
    }}>
        {/* Botões de navegação melhorados */}
        <button onClick={handlePrevious} disabled={isTransitioning || isDragging} className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 
                     bg-gradient-to-r from-black/70 to-black/50 hover:from-black/90 hover:to-black/70 
                     text-white rounded-full p-3 
                     opacity-0 group-hover:opacity-100 transition-all duration-500
                     hover:scale-110 active:scale-95 disabled:opacity-50
                     shadow-2xl backdrop-blur-sm border border-white/20
                     animate-slide-in-left">
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button onClick={handleNext} disabled={isTransitioning || isDragging} className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 
                     bg-gradient-to-l from-black/70 to-black/50 hover:from-black/90 hover:to-black/70 
                     text-white rounded-full p-3 
                     opacity-0 group-hover:opacity-100 transition-all duration-500
                     hover:scale-110 active:scale-95 disabled:opacity-50
                     shadow-2xl backdrop-blur-sm border border-white/20
                     animate-slide-in-right">
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Container das imagens com transições fluidas */}
        <div className="flex h-full px-2 sm:px-4 gap-2 sm:gap-3 will-change-transform pr-0" style={{
        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
        transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}>
          {shuffledProdutos.map((produto: any, index: number) => <div key={produto.id} className={`flex-shrink-0 relative cursor-pointer overflow-hidden rounded-xl
                         transition-all duration-300 ease-out transform-gpu will-change-transform
                         ${index === currentIndex ? 'opacity-100 scale-100 shadow-xl z-10' : 'opacity-70 scale-95 hover:opacity-85 hover:scale-98'}
                         ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}
                         group/card`} style={{
          width: `${100 / Math.min(shuffledProdutos.length, 4)}%`,
          minWidth: '100px',
          maxWidth: '120px'
        }} onClick={handleBookClick}>
              {/* Background com gradiente animado */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent-legal/20 
                             opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-10" />
              
              {/* Container da imagem */}
              <div className="relative group h-full w-full max-w-[130px] mx-auto">
                <img src={produto.imagem} alt={`${produto.livro || 'Livro'} - ${produto.autor || 'Autor'}`} className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-xl 
                             transition-all duration-700 group-hover:scale-105" style={{
              aspectRatio: '2/3',
              minHeight: '140px',
              maxHeight: '200px'
            }} onError={(e: any) => {
              console.log('Erro ao carregar imagem:', produto.imagem);
              e.currentTarget.src = '/placeholder.svg';
            }} loading="lazy" />
                
                {/* Overlay com informações */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20
                               flex items-end p-2 rounded-lg">
                  <div className="text-white transform translate-y-4 group-hover:translate-y-0 
                                transition-transform duration-500">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-xs font-bold animate-fade-in-up">
                        {produto.livro || `Livro #${produto.id}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Indicador de foco */}
              {index === currentIndex && <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full 
                               animate-pulse-glow shadow-lg z-30" />}
              
              {/* Borda animada quando ativo */}
              {index === currentIndex && <div className="absolute inset-0 border-2 border-primary/50 rounded-xl 
                               animate-pulse opacity-60 z-30" />}
            </div>)}
        </div>
        
        {/* Indicadores de posição simplificados */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30 flex gap-1">
          {shuffledProdutos.slice(0, Math.min(4, shuffledProdutos.length)).map((_, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-primary scale-110 shadow-md' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Indicador de arraste */}
        {isDragging && <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            Arraste para navegar
          </div>}
      </div>
    </div>;
});
ProductCarousel.displayName = 'ProductCarousel';
export default ProductCarousel;