
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NoticiaJuridica {
  portal: string;
  link: string;
  logo: string;
}

export const useNoticiasJuridicas = () => {
  const [noticias, setNoticias] = useState<NoticiaJuridica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const { data, error } = await supabase
          .from('NOTICIAS JURIDICAS')
          .select('portal, link, logo')
          .order('portal');

        if (error) throw error;
        setNoticias(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar notícias');
        console.error('Erro ao buscar notícias jurídicas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  return { noticias, loading, error };
};
