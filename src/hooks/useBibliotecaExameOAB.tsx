import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface LivroOAB {
  id: number;
  'Área': string;
  'Tema': string;
  'Download': string;
  'Link': string;
  'Capa-area': string;
  'Capa-livro': string;
  'Sobre': string;
  'Ordem': string;
  'capa-exame': string;
  'profissões-area': string;
}

export const useBibliotecaExameOAB = () => {
  return useOptimizedQuery({
    queryKey: ['biblioteca-exame-oab'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BIBILIOTECA-OAB' as any)
        .select('*')
        .order('Ordem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar biblioteca exame OAB:', error);
        throw error;
      }

      return (data as any[])?.map((item: any) => ({
        id: item.id,
        'Área': item['Área'] || item.area || '',
        'Tema': item['Tema'] || item.tema || '',
        'Download': item['Download'] || item.download || '',
        'Link': item['Link'] || item.link || '',
        'Capa-area': item['Capa-area'] || item['capa-area'] || '',
        'Capa-livro': item['Capa-livro'] || item['capa-livro'] || '',
        'Sobre': item['Sobre'] || item.sobre || '',
        'Ordem': item['Ordem'] || item.ordem || '',
        'capa-exame': item['capa-exame'] || '',
        'profissões-area': item['profissões-area'] || ''
      })) as LivroOAB[] || [];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    useExternalCache: true,
  });
};

// Hook para organizar livros por áreas OAB
export const useLivrosPorAreaOAB = () => {
  const { data: livros, isLoading, error } = useBibliotecaExameOAB();

  // Criar mapa de capas por área
  const capasAreaMap = livros?.reduce((acc, livro) => {
    if (livro['Área'] && livro['Capa-area']) {
      acc[livro['Área']] = livro['Capa-area'];
    }
    return acc;
  }, {} as Record<string, string>) || {};

  // Organizar livros por área
  const livrosPorArea = livros?.reduce((acc, livro) => {
    const area = livro['Área'];
    if (area) {
      if (!acc[area]) {
        acc[area] = {
          livros: [],
          capa: capasAreaMap[area] || null
        };
      }
      acc[area].livros.push(livro);
    }
    return acc;
  }, {} as Record<string, { livros: LivroOAB[], capa: string | null }>) || {};

  const areas = Object.keys(livrosPorArea).sort();

  return {
    livrosPorArea,
    areas,
    livros: livros || [],
    isLoading,
    error
  };
};