import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

export interface Sumula {
  id: number;
  titulo: string;
  texto: string;
  data_aprovacao?: string;
  naracao?: string | null;
  tipo: 'STF' | 'STJ' | 'STF_VINCULANTE';
  tribunal: string;
}

export const useSumulas = () => {
  return useOptimizedQuery({
    queryKey: ['sumulas-all'],
    queryFn: async () => {
      // Buscar súmulas do STF/STJ
      const { data: sumulas, error: sumError } = await supabase
        .from('SUMULAS')
        .select('id, "Título da Súmula", "Texto da Súmula", "Data de Aprovação", Narração')
        .order('id', { ascending: true });

      if (sumError) {
        console.error('Erro ao buscar súmulas:', sumError);
      }

      // Buscar súmulas vinculantes
      const { data: vinculantes, error: vinError } = await supabase
        .from('SUMULAS VINCULANTES')
        .select('id, "Título da Súmula", "Texto da Súmula", "Data de Aprovação", Narração')
        .order('id', { ascending: true });

      if (vinError) {
        console.error('Erro ao buscar súmulas vinculantes:', vinError);
      }

      // Transformar e combinar dados
      const sumulasTransformadas: Sumula[] = [
        ...(sumulas || []).map((s: any) => ({
          id: s.id,
          titulo: s["Título da Súmula"] || '',
          texto: s["Texto da Súmula"] || '',
          data_aprovacao: s["Data de Aprovação"] || '',
          naracao: s.Narração || null,
          tipo: s["Título da Súmula"]?.includes('STF') ? 'STF' as const : 'STJ' as const,
          tribunal: s["Título da Súmula"]?.includes('STF') ? 'STF' : 'STJ'
        })),
        ...(vinculantes || []).map((s: any) => ({
          id: s.id + 10000, // offset para evitar conflito de IDs
          titulo: s["Título da Súmula"] || '',
          texto: s["Texto da Súmula"] || '',
          data_aprovacao: s["Data de Aprovação"] || '',
          naracao: s.Narração || null,
          tipo: 'STF_VINCULANTE' as const,
          tribunal: 'STF'
        }))
      ];

      return sumulasTransformadas;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache
    useExternalCache: true,
  });
};

// Hook para organizar súmulas por tribunal
export const useSumulasPorTribunal = () => {
  const { data: sumulas, isLoading, error } = useSumulas();

  const sumulasPorTribunal = {
    STF: sumulas?.filter(s => s.tribunal === 'STF' && s.tipo !== 'STF_VINCULANTE') || [],
    STJ: sumulas?.filter(s => s.tribunal === 'STJ') || [],
    STF_VINCULANTE: sumulas?.filter(s => s.tipo === 'STF_VINCULANTE') || []
  };

  return {
    sumulasPorTribunal,
    sumulas: sumulas || [],
    isLoading,
    error
  };
};
