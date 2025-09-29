import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsUpdate {
  id: number;
  Titulo: string | null;
  capa: string | null;
  data: string | null;
  link?: string | null;
  isNew?: boolean;
}

export const useNewsUpdates = () => {
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Buscar últimas notícias
        const { data: news, error } = await supabase
          .from('NOTICIAS-AUDIO')
          .select('id, Titulo, capa, data')
          .order('data', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (news && news.length > 0) {
          setLatestNews(news);
          
          // Verificar se há notícias não vistas
          const lastSeenId = localStorage.getItem('last_seen_news_id');
          const hasNew = !lastSeenId || news[0].id > parseInt(lastSeenId);
          
          setHasNewUpdates(hasNew);
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      } finally {
        setLoading(false);
      }
    };

    checkForUpdates();

    // Verificar atualizações a cada 5 minutos
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    // Subscription para atualizações em tempo real
    const subscription = supabase
      .channel('news-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'NOTICIAS-AUDIO'
        },
        (payload) => {
          console.log('Nova notícia inserida:', payload);
          checkForUpdates();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, []);

  const markAsSeen = () => {
    if (latestNews.length > 0) {
      localStorage.setItem('last_seen_news_id', latestNews[0].id.toString());
      setHasNewUpdates(false);
    }
  };


  return {
    hasNewUpdates,
    latestNews: latestNews.map(n => ({
      ...n,
      link: null
    })),
    loading,
    markAsSeen
  };
};