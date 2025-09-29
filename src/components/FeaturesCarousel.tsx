
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const carouselData = [
  {
    id: 1,
    title: "Vade Mecum Digital",
    description: "Leis e códigos sempre atualizados com busca inteligente",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 2,
    title: "Assistente IA Jurídico",
    description: "Inteligência artificial especializada em Direito brasileiro",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "Biblioteca Jurídica",
    description: "Milhares de livros, doutrinas e jurisprudências organizadas",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "Flashcards Inteligentes",
    description: "Sistema de repetição espaçada para memorização eficaz",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 5,
    title: "Áudio-aulas Especializadas",
    description: "Conteúdo em áudio para estudo em qualquer lugar",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 6,
    title: "Mapas Mentais Jurídicos",
    description: "Visualize conexões entre institutos e conceitos do Direito",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 7,
    title: "Downloads Jurídicos",
    description: "Acervo completo de livros e materiais para download",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 8,
    title: "Notícias Jurídicas",
    description: "Mantenha-se atualizado com as últimas novidades do Direito",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 9,
    title: "Jurisprudência Atualizada",
    description: "Decisões judiciais mais recentes organizadas por área",
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 10,
    title: "Petições Modelo",
    description: "Templates profissionais para todas as áreas do Direito",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 11,
    title: "Simulados OAB",
    description: "Questões atualizadas para aprovação no exame da Ordem",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 12,
    title: "Cursos Online",
    description: "Videoaulas com professores especializados e certificados",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 13,
    title: "Calculadoras Jurídicas",
    description: "Ferramentas para cálculos trabalhistas e previdenciários",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 14,
    title: "Agenda Profissional",
    description: "Gestão completa de prazos e compromissos advocatícios",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 15,
    title: "Contratos Digitais",
    description: "Modelos de contratos com assinatura eletrônica",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop&crop=center"
  }
];

export const FeaturesCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselData.length);
    }, 4000); // Increased time for more content
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + carouselData.length) % carouselData.length);
  };

  const currentItem = carouselData[currentSlide];

  return (
    <div 
      className="relative h-[160px] sm:h-[200px] md:h-[240px] w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-deep shadow-red-glow hover:shadow-interactive transition-all duration-500" 
      onMouseEnter={() => setIsAutoPlaying(false)} 
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image with enhanced overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform" 
        style={{
          backgroundImage: `url(${currentItem.image})`,
          filter: 'brightness(0.4) contrast(1.1) saturate(0.8)'
        }} 
      />
      
      {/* Enhanced Legal Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background-deep/95 via-background-deep/70 to-background-deep/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background-deep/90 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-legal/20 via-transparent to-primary/10" />
      
      {/* Content with better positioning and legal styling */}
      <div className="relative z-10 flex h-full items-center px-3 sm:px-6 md:px-8">
        <div className="max-w-2xl text-white">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white drop-shadow-2xl animate-fade-in-up gradient-text-legal-light">
            {currentItem.title}
          </h1>
          <p 
            className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 drop-shadow-lg animate-fade-in-up leading-relaxed line-clamp-2" 
            style={{ animationDelay: '0.2s' }}
          >
            {currentItem.description}
          </p>
          
          {/* Professional accent line */}
          <div 
            className="mt-4 w-20 h-1 bg-gradient-to-r from-accent-legal to-accent-legal/60 rounded-full animate-fade-in-up" 
            style={{ animationDelay: '0.4s' }} 
          />
        </div>
      </div>

      {/* Enhanced Navigation Arrows with legal styling */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={prevSlide} 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full w-10 h-10 p-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={nextSlide} 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full w-10 h-10 p-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Enhanced Progress bar with legal styling */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-background-deep/50">
        <div 
          className="h-full bg-gradient-to-r from-accent-legal via-primary to-accent-legal transition-all duration-500 shadow-lg shadow-accent-legal/30" 
          style={{ width: `${(currentSlide + 1) / carouselData.length * 100}%` }} 
        />
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentSlide + 1} / {carouselData.length}
      </div>

      {/* Subtle particle effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-4 right-8 w-2 h-2 bg-accent-legal/40 rounded-full animate-legal-pulse" 
          style={{ animationDelay: '0s' }} 
        />
        <div 
          className="absolute top-12 right-16 w-1 h-1 bg-white/30 rounded-full animate-legal-pulse" 
          style={{ animationDelay: '1s' }} 
        />
        <div 
          className="absolute top-8 right-12 w-1.5 h-1.5 bg-accent-legal/30 rounded-full animate-legal-pulse" 
          style={{ animationDelay: '2s' }} 
        />
      </div>
    </div>
  );
};
