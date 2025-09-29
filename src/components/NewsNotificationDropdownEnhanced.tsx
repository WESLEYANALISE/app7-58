import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { useNavigation } from '@/context/NavigationContext';
import { Clock, X, CheckCheck, Sparkles, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsNotificationDropdownEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsNotificationDropdownEnhanced = ({ 
  isOpen, 
  onClose 
}: NewsNotificationDropdownEnhancedProps) => {
  const { recentNews, loading, markAsRead, markAllAsRead } = useSmartNotifications();
  const { setCurrentFunction } = useNavigation();

  const handleNewsClick = (newsId: number) => {
    markAsRead(newsId);
    setCurrentFunction('Noticias  Comentadas');
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    onClose();
  };

  const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'Data não disponível';
    
    try {
      let date: Date;
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (!date || isNaN(date.getTime())) {
        return dateString;
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      
      if (diffInHours < 1) {
        return 'Há poucos minutos';
      } else if (diffInHours < 24) {
        return `Há ${Math.floor(diffInHours)} hora${Math.floor(diffInHours) > 1 ? 's' : ''}`;
      } else if (diffInDays < 7) {
        return `Há ${Math.floor(diffInDays)} dia${Math.floor(diffInDays) > 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Enhanced Overlay with blur */}
      <div 
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Enhanced Dropdown */}
      <div className={cn(
        "fixed top-16 right-4 left-4 z-50 max-w-md mx-auto",
        "transform transition-all duration-500 ease-out",
        isOpen 
          ? "translate-y-0 opacity-100 scale-100" 
          : "-translate-y-8 opacity-0 scale-95"
      )}>
        <Card className="bg-background/90 backdrop-blur-2xl border border-border/30 shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-legal/5 pointer-events-none" />
          
          <CardContent className="p-0 relative">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/20 bg-gradient-to-r from-background/50 to-card/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-primary animate-pulse" />
                  {recentNews.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Notícias Recentes</h3>
                  <p className="text-xs text-muted-foreground">
                    {recentNews.length} nova{recentNews.length !== 1 ? 's' : ''} notícia{recentNews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {recentNews.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-primary/10"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-4 animate-pulse">
                      <div className="w-14 h-14 bg-gradient-to-br from-muted to-muted/50 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gradient-to-r from-muted via-muted/70 to-muted rounded-lg w-3/4" />
                        <div className="h-3 bg-gradient-to-r from-muted via-muted/70 to-muted rounded-lg w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentNews.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhuma notícia nova</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Você está em dia com as notícias!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/10">
                  {recentNews.map((news, index) => (
                    <button
                      key={news.id}
                      onClick={() => handleNewsClick(news.id)}
                      className={cn(
                        "w-full p-4 flex items-start space-x-4 text-left transition-all duration-300",
                        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent-legal/5",
                        "active:scale-[0.98] active:bg-primary/10",
                        "group relative overflow-hidden"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {/* Hover background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      
                      {/* Enhanced image container */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-muted/80 to-muted/60 flex-shrink-0 shadow-lg relative group">
                        {news.capa ? (
                          <img
                            src={news.capa}
                            alt={news.Titulo || 'Notícia'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary/60 to-accent-legal/60 flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/60 to-accent-legal/60 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        {/* New indicator */}
                        {news.isNew && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Enhanced content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
                          {news.Titulo || 'Sem título'}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 opacity-60" />
                          <span className="font-medium">
                            {formatRelativeTime(news.data)}
                          </span>
                          
                          {news.isNew && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full border border-red-500/30">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-red-400 font-medium text-xs">NOVA</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Hover arrow */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            {recentNews.length > 0 && (
              <div className="p-4 border-t border-border/20 bg-gradient-to-r from-background/80 to-card/80">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentFunction('Noticias  Comentadas');
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-background to-card border-primary/30 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent-legal/5 transition-all duration-300"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Ver todas as notícias
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent-legal) / 0.3));
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent-legal) / 0.5));
        }
      `}</style>
    </>
  );
};