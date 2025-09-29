
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Download {
  area: string;
  livro: string;
  imagem: string;
  sobre: string;
  download: string;
  profissao: string;
  logo: string;
  'proficao do logo': string;
}

export const useDownloads = () => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const { data, error } = await supabase
          .from('DOWNLOADS')
          .select('*')
          .order('area');

        if (error) throw error;
        setDownloads(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar downloads');
        console.error('Erro ao buscar downloads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  return { downloads, loading, error };
};
