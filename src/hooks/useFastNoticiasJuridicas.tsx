import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNativeSpeed } from './useNativeSpeed';

export interface NoticiaJuridica {
  portal: string;
  link: string;
  logo: string;
}

export const useFastNoticiasJuridicas = () => {
  const [noticias, setNoticias] = useState<NoticiaJuridica[]>([]);
  const { getInstantData, setInstantData, hasInstantData } = useNativeSpeed();
  
  const cacheKey = 'noticias-juridicas';

  useEffect(() => {
    // Verificar cache primeiro
    const cached = getInstantData(cacheKey);
    if (cached) {
      setNoticias(cached);
      return;
    }

    // Se não tem cache, buscar dados em background
    const fetchNoticias = async () => {
      try {
        const { data, error } = await supabase
          .from('NOTICIAS JURIDICAS')
          .select('portal, link, logo')
          .order('portal');

        if (error) throw error;
        
        const result = data || [];
        setNoticias(result);
        setInstantData(cacheKey, result);
      } catch (err) {
        console.error('Erro ao buscar notícias jurídicas:', err);
        // Fallback silencioso
        setNoticias([]);
      }
    };

    fetchNoticias();
  }, [getInstantData, setInstantData]);

  return { 
    noticias, 
    loading: false, // Nunca mostra loading
    error: null // Nunca mostra erro visível
  };
};