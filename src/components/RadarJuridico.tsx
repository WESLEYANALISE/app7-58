import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, RefreshCw, Settings, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WebView } from '@/components/WebView';
import { EnhancedWebView } from '@/components/EnhancedWebView';
import { useLegalNewsRead } from '@/hooks/useLegalNewsRead';
import { EnhancedNewsReader } from '@/components/RadarJuridico/EnhancedNewsReader';
import { NewsCard } from '@/components/RadarJuridico/NewsCard';
import { RadarStats } from '@/components/RadarJuridico/RadarStats';
import { NewsFilters } from '@/components/RadarJuridico/NewsFilters';
interface LegalNews {
  id: string;
  portal: string;
  title: string;
  preview?: string;
  image_url?: string;
  news_url: string;
  published_at?: string;
  cached_at: string;
}
interface NewsContent {
  title?: string;
  description?: string;
  image_url?: string;
  content_html?: string;
  content_text?: string;
  success: boolean;
  error?: string;
}
export const RadarJuridico = () => {
  const {
    setCurrentFunction
  } = useNavigation();
  const [news, setNews] = useState<LegalNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<LegalNews | null>(null);
  const [newsContent, setNewsContent] = useState<NewsContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewTitle, setWebViewTitle] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'favorites'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const {
    toast
  } = useToast();
  const {
    markAsRead,
    isRead
  } = useLegalNewsRead();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchNews = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        toast({
          title: "Buscando notícias...",
          description: "Processando as últimas notícias jurídicas"
        });
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('legal-news-radar');
      if (error) throw error;
      if (data.success) {
        const conjurNews = data.data.filter((item: LegalNews) => item.portal === 'conjur');
        setNews(conjurNews);
        setLastUpdate(new Date());
        if (!silent) {
          toast({
            title: "Notícias atualizadas",
            description: `${conjurNews.length} notícias do Conjur carregadas`
          });
        }
      } else {
        throw new Error(data.error || 'Erro ao carregar notícias');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      if (!silent) {
        toast({
          title: "Erro ao carregar notícias",
          description: "Tente novamente em alguns instantes",
          variant: "destructive"
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => {
    fetchNews();
    intervalRef.current = setInterval(() => {
      fetchNews(true);
    }, 30 * 60 * 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  const openNewsReader = async (newsItem: LegalNews) => {
    markAsRead(newsItem.id);

    // Abrir diretamente na WebView com botões flutuantes
    openWebView(newsItem.news_url, newsItem.title);
  };
  const toggleFavorite = (newsId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(newsId)) {
        newFavorites.delete(newsId);
        toast({
          title: "Removido dos favoritos",
          description: "Notícia removida da lista de favoritas"
        });
      } else {
        newFavorites.add(newsId);
        toast({
          title: "Adicionado aos favoritos",
          description: "Notícia salva na lista de favoritas"
        });
      }
      return newFavorites;
    });
  };

  // Filter and sort news
  const filteredNews = useMemo(() => {
    let filtered = news;
    if (searchTerm) {
      filtered = filtered.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.preview?.toLowerCase().includes(searchTerm.toLowerCase()) || item.portal.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(item => !isRead(item.id));
        break;
      case 'favorites':
        filtered = filtered.filter(item => favorites.has(item.id));
        break;
      default:
        break;
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.published_at || a.cached_at);
      const dateB = new Date(b.published_at || b.cached_at);
      return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
    return filtered;
  }, [news, searchTerm, selectedFilter, favorites, isRead, sortOrder]);
  const stats = useMemo(() => {
    const readCount = news.filter(item => isRead(item.id)).length;
    const favoriteCount = favorites.size;
    return {
      total: news.length,
      read: readCount,
      favorites: favoriteCount
    };
  }, [news, isRead, favorites]);
  const handleBack = () => {
    setCurrentFunction(null);
  };
  const openWebView = (url: string, title: string) => {
    setWebViewUrl(url);
    setWebViewTitle(title);
  };
  const refreshNews = () => {
    fetchNews();
  };
  if (webViewUrl) {
    return <EnhancedWebView url={webViewUrl} title={webViewTitle} onClose={() => setWebViewUrl(null)} />;
  }
  return <div className="min-h-screen bg-background py-0">
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-accent px-[18px] py-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mx-[8px]">
                <TrendingUp className="h-6 w-6 text-yellow-400" />
                Radar Jurídico
              </h1>
              <p className="text-sm text-muted-foreground py-0 px-[14px]">
                Notícias jurídicas com análise inteligente
                {lastUpdate && <span className="ml-2">
                    • Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshNews} disabled={loading} className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 px-[11px] py-[2px] my-0 mx-0">
        <RadarStats totalNews={stats.total} readNews={stats.read} favoriteNews={stats.favorites} lastUpdate={lastUpdate} />

        <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <TrendingUp className="h-5 w-5" />
              Análise Inteligente de Notícias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Clique em qualquer notícia para acessar uma experiência completa de leitura com múltiplas funcionalidades de IA: 
              <strong className="text-yellow-400"> Resumo Executivo</strong>, 
              <strong className="text-blue-400"> Explicação Didática</strong>, 
              <strong className="text-green-400"> Exemplos Práticos</strong>, 
              <strong className="text-purple-400"> Análise Jurídica</strong> e 
              <strong className="text-orange-400"> Precedentes</strong>. 
              Além disso, chat inteligente para tirar dúvidas específicas.
            </p>
          </CardContent>
        </Card>

        <NewsFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} sortOrder={sortOrder} onSortChange={setSortOrder} totalCount={news.length} filteredCount={filteredNews.length} />

        {loading ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => <Card key={i} className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              </Card>)}
          </div> : filteredNews.length === 0 ? <Card className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </Card> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNews.map(item => <NewsCard key={item.id} news={item} isRead={isRead(item.id)} isFavorite={favorites.has(item.id)} onRead={openNewsReader} onToggleFavorite={toggleFavorite} />)}
          </div>}
      </div>

    </div>;
};