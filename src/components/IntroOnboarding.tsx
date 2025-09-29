import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useIntroCards, IntroCard } from '@/hooks/useIntroCards';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import Lottie from 'lottie-react';

interface IntroOnboardingProps {
  onComplete: () => void;
}

const IntroIcon = ({ icon, isActive }: { icon: string; isActive: boolean }) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if it's a Lottie URL
    if (icon.includes('lottie.host')) {
      setLoading(true);
      
      // Convert embed URL to API URL
      let apiUrl = icon;
      if (icon.includes('/embed/')) {
        // Extract the animation ID from the embed URL
        const matches = icon.match(/\/embed\/([^/]+)/);
        if (matches && matches[1]) {
          apiUrl = `https://lottie.host/${matches[1]}.json`;
        }
      } else if (icon.includes('.lottie')) {
        // Convert .lottie URL to .json
        apiUrl = icon.replace('.lottie', '.json');
      }

      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch animation');
          }
          return response.json();
        })
        .then(data => {
          setAnimationData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error loading Lottie animation:', error);
          setAnimationData(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [icon]);

  // Show loading state
  if (loading && icon.includes('lottie.host')) {
    return (
      <div className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-all duration-500 ${
        isActive ? 'animate-scale-in' : ''
      }`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render Lottie animation if data is available
  if (animationData) {
    return (
      <div className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-all duration-500 ${
        isActive ? 'animate-scale-in' : ''
      }`}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  // Fallback to emoji/text icon or default icon
  return (
    <div className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-4xl md:text-5xl transition-all duration-500 ${
      isActive ? 'animate-bounce-soft' : ''
    }`}>
      {icon.includes('lottie.host') ? '⚖️' : icon}
    </div>
  );
};

export const IntroOnboarding = ({ onComplete }: IntroOnboardingProps) => {
  const { cards, loading } = useIntroCards();
  const { isMobile } = useDeviceDetection();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [showVideo, setShowVideo] = useState(false);

  // Preload do vídeo
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/intro-video.mp4';
    video.preload = 'auto';
  }, []);

  useEffect(() => {
    // Auto-advance slides every 4 seconds
    const interval = setInterval(() => {
      if (currentIndex < cards.length - 1) {
        handleNext();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, cards.length]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection('next');
      setCurrentIndex(prev => prev + 1);
    } else {
      // Se chegou no último card, mostra o vídeo
      setShowVideo(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('prev');
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('intro_seen_v1', 'true');
    onComplete();
  };

  const handleVideoEnd = () => {
    handleComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (loading || cards.length === 0) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  // Se deve mostrar o vídeo
  if (showVideo) {
    return (
      <div className="fixed inset-0 bg-background/98 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <video
            src="/intro-video.mp4"
            autoPlay
            controls
            preload="auto"
            onEnded={handleVideoEnd}
            className="w-full h-auto rounded-lg shadow-2xl"
          >
            Seu navegador não suporta vídeos.
          </video>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Skip button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSkip}
        className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
      >
        <X className="h-5 w-5 mr-2" />
        Pular
      </Button>

      {/* Main content */}
      <div className="w-full max-w-md mx-auto">
        {/* Card container */}
        <div className="relative overflow-hidden rounded-lg">
          <Card className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-2xl">
            <CardContent className="p-8 md:p-10 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`transition-all duration-700 ${
                  direction === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                }`}>
                  <IntroIcon icon={currentCard.icon} isActive={true} />
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-xl md:text-2xl font-bold text-foreground mb-4 transition-all duration-700 ${
                direction === 'next' ? 'animate-fade-in-up' : 'animate-fade-in-up'
              }`}>
                {currentCard.title}
              </h2>

              {/* Description */}
              <p className={`text-muted-foreground text-sm md:text-base leading-relaxed mb-8 transition-all duration-700 delay-100 ${
                direction === 'next' ? 'animate-fade-in-up' : 'animate-fade-in-up'
              }`}>
                {currentCard.description}
              </p>

              {/* Progress indicators */}
              <div className="flex justify-center gap-2 mb-6">
                {cards.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-primary animate-glow'
                        : index < currentIndex
                        ? 'w-2 bg-primary/60'
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                {isLastCard ? (
                  <Button
                    onClick={handleNext}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 animate-pulse-glow"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card counter */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          {currentIndex + 1} de {cards.length}
        </div>
      </div>
    </div>
  );
};