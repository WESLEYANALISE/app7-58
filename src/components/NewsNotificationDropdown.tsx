import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNewsNotifications } from '@/hooks/useNewsNotifications';
import { useNavigation } from '@/context/NavigationContext';
import { Clock, X, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsNotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsNotificationDropdown = ({ isOpen, onClose }: NewsNotificationDropdownProps) => {
  const { recentNews, loading, markAsRead, markAllAsRead } = useNewsNotifications();
  const { setCurrentFunction } = useNavigation();

  const handleNewsClick = (newsId: number) => {
    markAsRead(newsId);
    setCurrentFunction('Radar Jurídico');
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className={cn(
        "fixed top-16 right-4 left-4 z-50 max-w-md mx-auto",
        "transform transition-all duration-300 ease-out",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}>
        <Card className="bg-background/95 backdrop-blur-xl border-border/20 shadow-2xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <h3 className="font-semibold text-foreground">Notícias Recentes</h3>
              <div className="flex items-center gap-2">
                {recentNews.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentNews.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma notícia recente</p>
                </div>
              ) : (
                <div className="divide-y divide-border/10">
                  {recentNews.map((news) => (
                    <button
                      key={news.id}
                      onClick={() => handleNewsClick(news.id)}
                      className="w-full p-4 flex items-start space-x-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      {/* Imagem da notícia */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {news.capa ? (
                          <img
                            src={news.capa}
                            alt={news.Titulo || 'Notícia'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo da notícia */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
                          {news.Titulo || 'Sem título'}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {news.data ? (() => {
                            try {
                              // Tentar diferentes formatos de data
                              let date;
                              if (news.data.includes('/')) {
                                // Formato DD/MM/YYYY ou MM/DD/YYYY
                                const parts = news.data.split('/');
                                if (parts.length === 3) {
                                  date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                }
                              } else if (news.data.includes('-')) {
                                // Formato YYYY-MM-DD
                                date = new Date(news.data);
                              } else {
                                // Tentar parsing direto
                                date = new Date(news.data);
                              }
                              
                              if (date && !isNaN(date.getTime())) {
                                return date.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                });
                              } else {
                                return news.data;
                              }
                            } catch {
                              return news.data;
                            }
                          })() : 'Data não disponível'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNews.length > 0 && (
              <div className="p-4 border-t border-border/20">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentFunction('Radar Jurídico');
                      onClose();
                    }}
                    className="w-full"
                  >
                    Ver todas as notícias
                  </Button>
                  
                  <div className="flex items-center space-x-2 px-2">
                    <input
                      type="checkbox"
                      id="disable-notifications"
                      className="rounded border-border/20"
                      onChange={(e) => {
                        localStorage.setItem('news-notifications-disabled', e.target.checked.toString());
                      }}
                      defaultChecked={localStorage.getItem('news-notifications-disabled') === 'true'}
                    />
                    <label htmlFor="disable-notifications" className="text-xs text-muted-foreground">
                      Não quero receber mais notificações
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};