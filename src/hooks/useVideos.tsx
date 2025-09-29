
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Video {
  id: number;
  area: string;
  link: string;
}

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('VIDEOS')
          .select('id, area, link')
          .order('area', { ascending: true });

        if (error) throw error;
        setVideos(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar vídeos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { videos, loading, error };
};
