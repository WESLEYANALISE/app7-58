import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface LivroForaDaToga {
  id: number;
  imagem: string; // Para compatibilidade com componentes existentes
  livro?: string;
  autor?: string;
  area?: string;
  sobre?: string;
  link?: string;
  download?: string;
  'capa-livro'?: string; // Campo real da tabela
  'capa-area'?: string;
}

export const useForaDaToga = () => {
  return useOptimizedQuery({
    queryKey: ['fora-da-toga'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BILBIOTECA-FORA DA TOGA' as any)
        .select('*');

      if (error) {
        console.error('Erro ao buscar livros Fora da Toga:', error);
        throw error;
      }

      // Transformar os dados para compatibilidade com componentes existentes
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        imagem: item['capa-livro'] || '', // Mapear capa-livro para imagem
      }));
      
      return transformedData as LivroForaDaToga[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for books
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};