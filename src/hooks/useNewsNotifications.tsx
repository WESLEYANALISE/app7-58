import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsAudio {
  id: number;
  Titulo: string | null;
  capa: string | null;
  data: string | null;
  isRead?: boolean;
}

export const useNewsNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNews, setRecentNews] = useState<NewsAudio[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Buscar últimas notícias
        const { data: news, error: newsError } = await supabase
          .from('NOTICIAS-AUDIO')
          .select('id, Titulo, capa, data')
          .order('data', { ascending: false })
          .limit(10);

        if (newsError) throw newsError;
        const newsWithReadStatus = (news || []).map(item => ({ ...item, isRead: false }));
        setRecentNews(newsWithReadStatus);
        setFilteredNews(newsWithReadStatus);

        // Se usuário logado, contar não lidas
        if (user) {
          const { data: countData, error: countError } = await supabase
            .rpc('get_unread_news_count', { user_uuid: user.id });

          if (countError) throw countError;
          setUnreadCount(countData || 0);
        } else {
          setUnreadCount(news?.length || 0);
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
      .channel('news-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'NOTICIAS-AUDIO'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const markAsRead = async (newsId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('mark_news_as_read', {
        user_uuid: user.id,
        news_uuid: newsId.toString()
      });

      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Atualizar status de leitura na lista
      setFilteredNews(prev => prev.map(item => 
        item.id === newsId ? { ...item, isRead: true } : item
      ));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const news of recentNews) {
        await supabase.rpc('mark_news_as_read', {
          user_uuid: user.id,
          news_uuid: news.id.toString()
        });
      }

      setUnreadCount(0);
      
      // Filtrar notícias não lidas da lista
      setFilteredNews([]);
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  const resetNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnreadCount(0);
        return;
      }

      for (const news of recentNews) {
        await supabase.rpc('mark_news_as_read', {
          user_uuid: user.id,
          news_uuid: news.id.toString()
        });
      }

      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao resetar notificações:', err);
    }
  };

  return {
    unreadCount,
    recentNews: filteredNews,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    resetNotifications
  };
};