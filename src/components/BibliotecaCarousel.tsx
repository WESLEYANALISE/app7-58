import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileBookCard } from './MobileBookCard';
import { JuridicalBookCard } from './JuridicalBookCard';
import { useAccessHistory } from '@/hooks/useAccessHistory';
import { useIsMobile } from '@/hooks/use-mobile';

interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
}

interface BibliotecaCarouselProps {
  area: string;
  livros: LivroJuridico[];
  onVerMais: (area: string) => void;
}

export const BibliotecaCarousel = memo(({ area, livros, onVerMais }: BibliotecaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { addToHistory } = useAccessHistory();
  const isMobile = useIsMobile();

  // Responsivo: 1 item no mobile, 2 no tablet, 4 no desktop
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 640) return 1; // mobile
    if (width < 1024) return 2; // tablet  
    return 4; // desktop
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView);
  const maxIndex = Math.max(0, livros.length - itemsPerView);

  // Atualizar itemsPerView no resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
      setCurrentIndex(0); // Reset no resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para registrar acesso ao livro
  const handleBookClick = useCallback((livro: LivroJuridico) => {
    addToHistory({
      id: `biblioteca-${livro.id}`,
      title: `📚 ${livro.livro}`,
      icon: '📚'
    });
  }, [addToHistory]);

  const handlePrevious = useCallback(() => {
    if (isDragging) return;
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, [isDragging]);

  const handleNext = useCallback(() => {
    if (isDragging) return;
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  }, [maxIndex, isDragging]);

  const handleVerMais = useCallback(() => {
    onVerMais(area);
  }, [area, onVerMais]);

  // Touch handlers
  const minSwipeDistance = 50;
  
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    
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
    
    if (isLeftSwipe && currentIndex < maxIndex) {
      handleNext();
    } else if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentIndex, maxIndex, handleNext, handlePrevious]);

  if (!livros || livros.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header da área */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{area}</h3>
          <p className="text-sm text-muted-foreground">
            {livros.length} {livros.length === 1 ? 'livro' : 'livros'} disponível{livros.length === 1 ? '' : 'is'}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleVerMais}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Ver mais
        </Button>
      </div>

      {/* Carrossel */}
      <div className="relative">
        {/* Botões de navegação - só mostrar se necessário e não for mobile */}
        {!isMobile && currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background/90"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        {!isMobile && currentIndex < maxIndex && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background/90"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {/* Container do carrossel */}
        <div 
          ref={carouselRef}
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <motion.div
            className="flex gap-4"
            animate={{
              x: `calc(-${currentIndex * (100 / itemsPerView)}% + ${dragOffset}px)`
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: isDragging ? 0 : undefined
            }}
            style={{
              width: `${(livros.length / itemsPerView) * 100}%`
            }}
          >
            {livros.map((livro) => (
              <div
                key={livro.id}
                className="flex-shrink-0"
                style={{ width: `${100 / livros.length * itemsPerView}%` }}
              >
                {isMobile ? (
                  <MobileBookCard 
                    livro={livro} 
                    onClick={() => handleBookClick(livro)}
                  />
                ) : (
                  <JuridicalBookCard 
                    livro={livro} 
                    onClick={() => handleBookClick(livro)}
                  />
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Indicadores - adaptar para mobile */}
        {maxIndex > 0 && (
          <div className="flex justify-center mt-4 gap-1">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-200 ${
                  isMobile 
                    ? 'w-2 h-2 rounded-full' 
                    : 'w-2 h-2 rounded-full'
                } ${
                  index === currentIndex 
                    ? 'bg-primary scale-110' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

BibliotecaCarousel.displayName = 'BibliotecaCarousel';