import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText, Clock } from 'lucide-react';
import { useNewsUpdates } from '@/hooks/useNewsUpdates';
import { useNavigation } from '@/context/NavigationContext';

export const NewsUpdateNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNews, setCurrentNews] = useState<any>(null);
  const { hasNewUpdates, latestNews, markAsSeen } = useNewsUpdates();
  const { setCurrentFunction } = useNavigation();

  useEffect(() => {
    // Mostrar notificação quando há notícias não lidas
    if (hasNewUpdates && latestNews.length > 0 && !isVisible) {
      setCurrentNews(latestNews[0]);
      setIsVisible(true);
      
      // Auto-hide após 8 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [hasNewUpdates, latestNews.length]);

  const handleClose = () => {
    setIsVisible(false);
    markAsSeen();
  };

  const handleViewNews = () => {
    setCurrentFunction('Noticias  Comentadas');
    setIsVisible(false);
    markAsSeen();
  };

  if (!isVisible || !currentNews) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto animate-scale-in">
        <Card className="w-full max-w-md bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Notícias atualizadas</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center mb-4">
              <p className="text-primary font-medium mb-2">
                {latestNews.length} notícias do Conjur carregadas
              </p>
            </div>

            {/* Preview da primeira notícia */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                {currentNews.capa && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={currentNews.capa}
                      alt="Capa da notícia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
                    {currentNews.Titulo || 'Nova notícia disponível'}
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Agora mesmo
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="flex-1"
              >
                Depois
              </Button>
              <Button
                onClick={handleViewNews}
                size="sm"
                className="flex-1"
              >
                Ver agora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};