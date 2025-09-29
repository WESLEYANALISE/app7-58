import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface CapaFuncao {
  id: number;
  'Função': string;
  capa: string;
}

export const useCapasFuncao = () => {
  return useOptimizedQuery({
    queryKey: ['capas-funcao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('CAPAS-FUNÇÃO')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Erro ao buscar capas das funções:', error);
        throw error;
      }

      return data as CapaFuncao[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    useExternalCache: true,
  });
};

// Hook para mapear capas por função
export const useCapasFuncaoMap = () => {
  const { data: capas, isLoading, error } = useCapasFuncao();

  const capasMap = capas?.reduce((acc, capa) => {
    const funcaoNome = capa['Função'];
    if (funcaoNome) {
      acc[funcaoNome] = capa.capa;
    }
    return acc;
  }, {} as Record<string, string>) || {};

  return {
    capasMap,
    capas: capas || [],
    isLoading,
    error
  };
};