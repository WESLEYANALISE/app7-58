
import { useState, useEffect } from 'react';
import { Star, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { detectPlatform, getStoreUrl } from '@/utils/platformDetection';
import { useRatingSystem } from '@/hooks/useRatingSystem';

export const RatingCard = () => {
  const { showRating, dismissRating, rateApp } = useRatingSystem();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showRating) {
      setIsVisible(true);
    }
  }, [showRating]);

  const handleRate = () => {
    const platform = detectPlatform();
    const storeUrl = getStoreUrl(platform);
    
    // Abrir a loja apropriada
    window.open(storeUrl, '_blank');
    
    // Marcar como avaliado
    rateApp();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    dismissRating();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="mx-4 max-w-sm w-full bg-card border-2 border-primary/20 shadow-2xl animate-scale-in">
        <CardContent className="p-6 text-center relative">
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-8 w-8 hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Ícone principal */}
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold mb-2 gradient-text">
            Gostando do Direito?
          </h3>

          {/* Descrição */}
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Sua avaliação nos ajuda a melhorar e alcançar mais estudantes de direito! ⭐
          </p>

          {/* Estrelas decorativas */}
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-6 w-6 text-amber-400 fill-amber-400 animate-pulse"
                style={{ animationDelay: `${star * 0.1}s` }}
              />
            ))}
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRate}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-amber-500/25 transform hover:scale-105 transition-all duration-300"
            >
              ⭐ Avaliar Agora
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground py-2"
            >
              Mais tarde
            </Button>
          </div>

          {/* Texto pequeno */}
          <p className="text-xs text-muted-foreground/60 mt-4">
            Esta mensagem aparece apenas 1x por semana
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
