import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VideoCategory {
  id: number;
  categoria: string;
  area: string;
  link: string;
  'capa-categoria': string;
  playlistId?: string | null;
  meta?: YouTubePlaylist;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  itemCount: number; // Required for compatibility
  videos: YouTubeVideo[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  channelTitle: string;
}

export interface CategoryGroup {
  categoria: string;
  capa: string;
  items: VideoCategory[];
  totalVideos: number;
}

export const useVideosByCategory = () => {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideosByCategory();
  }, []);

  const loadVideosByCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da tabela VIDEOS
      const { data, error } = await supabase
        .from('VIDEOS')
        .select('id, categoria, area, link, "capa-categoria"')
        .order('categoria')
        .order('area');

      if (error) throw error;

      const videos: VideoCategory[] = (data || []).map((row: any) => ({
        id: row.id,
        categoria: row.categoria,
        area: row.area,
        link: row.link,
        'capa-categoria': row['capa-categoria'],
        playlistId: extractPlaylistId(row.link)
      }));

      // Enriquecer com dados do YouTube
      const enrichedVideos = await Promise.all(
        videos.map(async (video) => {
          try {
            if (video.playlistId) {
              const { data: payload, error: fnError } = await supabase.functions.invoke('youtube-api', {
                body: {
                  action: 'getPlaylistDetails',
                  playlistId: video.playlistId
                }
              });

              if (fnError) throw fnError;
              const playlist = payload as any;
              return { 
                ...video, 
                meta: {
                  ...playlist,
                  videoCount: playlist.videoCount || playlist.itemCount || 0,
                  itemCount: playlist.itemCount || playlist.videoCount || 0
                } as YouTubePlaylist 
              };
            } else {
              // Vídeo único
              const videoId = extractVideoId(video.link);
              if (!videoId) return video;

              const { data: videoData, error: fnError } = await supabase.functions.invoke('youtube-api', {
                body: {
                  action: 'getVideoDetails',
                  videoId
                }
              });

              if (fnError) throw fnError;
              const v = videoData as YouTubeVideo;
              
              const playlistLike: YouTubePlaylist = {
                id: v.id,
                title: v.title,
                description: v.description || '',
                thumbnail: v.thumbnail,
                videoCount: 1,
                itemCount: 1,
                videos: [v]
              };

              return { ...video, meta: playlistLike };
            }
          } catch (e) {
            console.error('Erro ao enriquecer vídeo:', video.id, e);
            return video;
          }
        })
      );

      // Agrupar por categoria
      const categoryMap = new Map<string, CategoryGroup>();

      enrichedVideos.forEach((video) => {
        if (!categoryMap.has(video.categoria)) {
          categoryMap.set(video.categoria, {
            categoria: video.categoria,
            capa: video['capa-categoria'] || '',
            items: [],
            totalVideos: 0
          });
        }

        const category = categoryMap.get(video.categoria)!;
        category.items.push(video);
        category.totalVideos += video.meta?.videoCount || 0;
      });

      setCategories(Array.from(categoryMap.values()));
    } catch (err) {
      console.error('Erro ao carregar vídeos por categoria:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const searchVideos = async (searchTerm: string): Promise<YouTubeVideo[]> => {
    if (!searchTerm.trim()) return [];

    try {
      const { data, error } = await supabase.functions.invoke('youtube-api', {
        body: {
          action: 'searchVideos',
          query: searchTerm
        }
      });

      if (error) throw error;
      return data?.videos || [];
    } catch (e) {
      console.error('Erro ao buscar vídeos:', e);
      return [];
    }
  };

  return {
    categories,
    loading,
    error,
    searchVideos,
    reload: loadVideosByCategory
  };
};

// Helper functions
function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}