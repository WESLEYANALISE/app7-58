import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLegalNewsRead = () => {
  const [readNews, setReadNews] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        // For anonymous users, load from localStorage
        const saved = localStorage.getItem('legal_news_read');
        if (saved) {
          setReadNews(new Set(JSON.parse(saved)));
        }
      } else {
        // For authenticated users, load from database
        loadReadNews(user.id);
      }
    };

    checkUser();
  }, []);

  const loadReadNews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_news_read')
        .select('news_id')
        .eq('user_id', userId);

      if (error) throw error;

      const readIds = new Set(data?.map(item => item.news_id.toString()) || []);
      setReadNews(readIds);
    } catch (error) {
      console.error('Error loading read news:', error);
    }
  };

  const markAsRead = async (newsId: string) => {
    const newReadNews = new Set(readNews);
    newReadNews.add(newsId);
    setReadNews(newReadNews);

    if (user) {
      // Save to database for authenticated users
      try {
        await supabase
          .from('user_news_read')
          .insert({ user_id: user.id, news_id: parseInt(newsId) });
      } catch (error) {
        console.error('Error marking news as read:', error);
      }
    } else {
      // Save to localStorage for anonymous users
      localStorage.setItem('legal_news_read', JSON.stringify([...newReadNews]));
    }
  };

  const isRead = (newsId: string) => readNews.has(newsId);

  return {
    markAsRead,
    isRead,
    readNewsCount: readNews.size
  };
};