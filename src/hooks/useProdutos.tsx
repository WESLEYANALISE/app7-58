
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface Produto {
  id: number;
  imagem: string; // URL da imagem
  livro?: string;
  autor?: string;
  area?: string;
  sobre?: string;
  link?: string;
  download?: string;
  beneficios?: string; // Benefícios para o estudante
}

export const useProdutos = () => {
  return useOptimizedQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BIBLIOTECA-CLASSICOS')
        .select('*');

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }

      return data as Produto[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for products
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};
