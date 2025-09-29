import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
}

export const useBibliotecaJuridica = () => {
  return useOptimizedQuery({
    queryKey: ['biblioteca-juridica'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BIBLIOTECA-JURIDICA')
        .select('*')
        .order('area', { ascending: true });

      if (error) {
        console.error('Erro ao buscar biblioteca jurídica:', error);
        throw error;
      }

      return data as LivroJuridico[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for biblioteca juridica
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    useExternalCache: true,
  });
};

// Hook para organizar livros por área
export const useLivrosPorArea = () => {
  const { data: livros, isLoading, error } = useBibliotecaJuridica();

  const livrosPorArea = livros?.reduce((acc, livro) => {
    const area = livro.area || 'Outras';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(livro);
    return acc;
  }, {} as Record<string, LivroJuridico[]>) || {};

  const areas = Object.keys(livrosPorArea).sort();

  return {
    livrosPorArea,
    areas,
    livros: livros || [],
    isLoading,
    error
  };
};