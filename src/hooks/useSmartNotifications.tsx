import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsAudio {
  id: number;
  Titulo: string | null;
  capa: string | null;
  data: string | null;
  isRead?: boolean;
  isNew?: boolean;
}

export const useSmartNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNews, setRecentNews] = useState<NewsAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local storage keys for anonymous users
  const VIEWED_NEWS_KEY = 'direito_premium_viewed_news';
  const LAST_CHECK_KEY = 'direito_premium_last_check';

  const getViewedNews = useCallback((): number[] => {
    try {
      const viewed = localStorage.getItem(VIEWED_NEWS_KEY);
      return viewed ? JSON.parse(viewed) : [];
    } catch {
      return [];
    }
  }, []);

  const markNewsAsViewed = useCallback((newsId: number) => {
    try {
      const viewed = getViewedNews();
      if (!viewed.includes(newsId)) {
        viewed.push(newsId);
        localStorage.setItem(VIEWED_NEWS_KEY, JSON.stringify(viewed));
      }
    } catch (error) {
      console.error('Erro ao marcar notícia como visualizada:', error);
    }
  }, [getViewedNews]);

  const getLastCheckTime = useCallback((): Date | null => {
    try {
      const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
      return lastCheck ? new Date(lastCheck) : null;
    } catch {
      return null;
    }
  }, []);

  const updateLastCheckTime = useCallback(() => {
    try {
      localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Erro ao atualizar último check:', error);
    }
  }, []);

  const isNewsNew = useCallback((newsDate: string | null): boolean => {
    if (!newsDate) return false;
    
    try {
      const lastCheck = getLastCheckTime();
      if (!lastCheck) return true; // Se nunca checou, considerar como nova
      
      // Parse da data da notícia
      let date: Date;
      if (newsDate.includes('/')) {
        const parts = newsDate.split('/');
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          date = new Date(newsDate);
        }
      } else {
        date = new Date(newsDate);
      }
      
      return date > lastCheck;
    } catch {
      return false;
    }
  }, [getLastCheckTime]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Buscar últimas notícias
        const { data: news, error: newsError } = await supabase
          .from('NOTICIAS-AUDIO')
          .select('id, Titulo, capa, data')
          .order('data', { ascending: false })
          .limit(20);

        if (newsError) throw newsError;

        if (user) {
          // Usuário logado - usar nova função melhorada
          const { data: countData, error: countError } = await supabase
            .rpc('get_truly_new_news_count', { user_uuid: user.id });

          if (countError) {
            console.warn('Função nova não encontrada, usando a antiga:', countError);
            // Fallback para função antiga
            const { data: fallbackCount, error: fallbackError } = await supabase
              .rpc('get_unread_news_count', { user_uuid: user.id });
            if (fallbackError) throw fallbackError;
            setUnreadCount(fallbackCount || 0);
          } else {
            setUnreadCount(countData || 0);
          }
          
          const newsWithStatus = (news || []).map(item => ({
            ...item,
            isRead: false, // Será definido pela RPC
            isNew: isNewsNew(item.data)
          }));
          
          setRecentNews(newsWithStatus);
        } else {
          // Usuário anônimo - usar localStorage
          const viewedNews = getViewedNews();
          const newsWithStatus = (news || []).map(item => ({
            ...item,
            isRead: viewedNews.includes(item.id),
            isNew: isNewsNew(item.data)
          }));
          
          // Filtrar apenas notícias não visualizadas
          const unviewedNews = newsWithStatus.filter(item => !item.isRead);
          
          setRecentNews(unviewedNews);
          setUnreadCount(unviewedNews.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
        console.error('Erro ao buscar notificações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscription para real-time updates
    const subscription = supabase
      .channel('smart-news-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'NOTICIAS-AUDIO'
        },
        (payload) => {
          console.log('Nova notícia recebida:', payload);
          // Recarregar notificações quando uma nova é inserida
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getViewedNews, isNewsNew]);

  const markAsRead = async (newsId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Usuário logado
        await supabase.rpc('mark_news_as_read', {
          user_uuid: user.id,
          news_uuid: newsId.toString()
        });
      } else {
        // Usuário anônimo
        markNewsAsViewed(newsId);
      }

      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Atualizar status na lista
      setRecentNews(prev => prev.map(item => 
        item.id === newsId ? { ...item, isRead: true } : item
      ));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Usuário logado - usar função de atualização
        await supabase.rpc('update_user_last_check', { user_uuid: user.id });
        
        for (const news of recentNews) {
          await supabase.rpc('mark_news_as_read', {
            user_uuid: user.id,
            news_uuid: news.id.toString()
          });
        }
      } else {
        // Usuário anônimo - marcar todas como visualizadas
        const newsIds = recentNews.map(news => news.id);
        newsIds.forEach(id => markNewsAsViewed(id));
      }

      setUnreadCount(0);
      setRecentNews([]);
      updateLastCheckTime();
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  const resetNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Usuário logado - usar função de atualização
        await supabase.rpc('update_user_last_check', { user_uuid: user.id });
        
        for (const news of recentNews) {
          await supabase.rpc('mark_news_as_read', {
            user_uuid: user.id,
            news_uuid: news.id.toString()
          });
        }
      } else {
        // Usuário anônimo
        const newsIds = recentNews.map(news => news.id);
        newsIds.forEach(id => markNewsAsViewed(id));
      }

      setUnreadCount(0);
      updateLastCheckTime();
    } catch (err) {
      console.error('Erro ao resetar notificações:', err);
    }
  };

  return {
    unreadCount,
    recentNews: recentNews.filter(news => !news.isRead), // Só mostrar não lidas
    loading,
    error,
    markAsRead,
    markAllAsRead,
    resetNotifications
  };
};