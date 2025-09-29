import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VideoRedacao {
  id: number;
  area: string;
  nome: string;
  link: string;
}

export const useVideoaulasRedacao = () => {
  const [videos, setVideos] = useState<VideoRedacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideosRedacao = async () => {
      try {
        const { data, error } = await supabase
          .from('video-aulas-youtube')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        }

        // Mapear dados da tabela para interface esperada
        const videosFormatados = data?.map((video: any) => ({
          id: video.id,
          area: determinarArea(video.Título),
          nome: video.Título,
          link: video.Link
        })) || [];

        setVideos(videosFormatados);
      } catch (err) {
        console.error('Erro ao buscar videoaulas de redação:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar videoaulas de redação');
      } finally {
        setLoading(false);
      }
    };

    fetchVideosRedacao();
  }, []);

  const determinarArea = (titulo: string): string => {
    const tituloLower = titulo.toLowerCase();
    
    if (tituloLower.includes('redação') || tituloLower.includes('redacao')) {
      return 'Redação Jurídica';
    }
    if (tituloLower.includes('português') || tituloLower.includes('portugues')) {
      return 'Português Jurídico';
    }
    if (tituloLower.includes('estrutura')) {
      return 'Estrutura da Redação';
    }
    if (tituloLower.includes('argumentação') || tituloLower.includes('argumentacao')) {
      return 'Argumentação';
    }
    if (tituloLower.includes('peça') || tituloLower.includes('peca') || tituloLower.includes('petição')) {
      return 'Peças Processuais';
    }
    
    return 'Técnicas de Redação';
  };

  return { videos, loading, error };
};