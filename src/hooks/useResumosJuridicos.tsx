import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface ResumoJuridicoRaw {
  id: number;
  'Área': string;
  'Ordem Tema': string;
  'Tema': string;
  'Ordem Subtema': string;
  'Subtema': string;
  'Conteúdo': string;
  'Resumo detalhado': string;
  'Resumo Storytelling': string;
  'Resumo Compacto': string;
}

export interface ResumoJuridico {
  id: number;
  area: string;
  ordemTema: string;
  tema: string;
  ordemSubtema: string;
  subtema: string;
  resumoDetalhado: string;
  resumoStorytelling: string;
  resumoCompacto: string;
}

export interface TemaResumo {
  tema: string;
  ordemTema: string;
  subtemas: SubtemaResumo[];
}

export interface SubtemaResumo {
  id: number;
  subtema: string;
  ordemSubtema: string;
  resumoDetalhado: string;
  resumoStorytelling: string;
  resumoCompacto: string;
}

export const useResumosJuridicos = () => {
  return useOptimizedQuery({
    queryKey: ['resumos-juridicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('RESUMOS-NOVOS' as any)
        .select('*')
        .order('Área', { ascending: true })
        .order('Ordem Tema', { ascending: true })
        .order('Ordem Subtema', { ascending: true });

      if (error) {
        console.error('Erro ao buscar resumos jurídicos:', error);
        throw error;
      }

      // Transformar os dados para formato mais amigável
      const transformedData: ResumoJuridico[] = (data as any).map((item: any) => ({
        id: item.id,
        area: item['Área'] || '',
        ordemTema: item['Ordem Tema'] || '',
        tema: item['Tema'] || '',
        ordemSubtema: item['Ordem Subtema'] || '',
        subtema: item['Subtema'] || '',
        resumoDetalhado: item['Resumo detalhado'] || '',
        resumoStorytelling: item['Resumo Storytelling'] || '',
        resumoCompacto: item['Resumo Compacto'] || '',
      }));

      return transformedData;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    useExternalCache: true,
  });
};

// Hook para organizar por área e tema
export const useResumosPorArea = () => {
  const { data: resumos, isLoading, error } = useResumosJuridicos();

  const resumosPorArea = resumos?.reduce((acc, resumo) => {
    const area = resumo.area || 'Outras';
    if (!acc[area]) {
      acc[area] = {};
    }
    
    const tema = resumo.tema || 'Outros';
    if (!acc[area][tema]) {
      acc[area][tema] = {
        tema,
        ordemTema: resumo.ordemTema,
        subtemas: []
      };
    }
    
    acc[area][tema].subtemas.push({
      id: resumo.id,
      subtema: resumo.subtema,
      ordemSubtema: resumo.ordemSubtema,
      resumoDetalhado: resumo.resumoDetalhado,
      resumoStorytelling: resumo.resumoStorytelling,
      resumoCompacto: resumo.resumoCompacto,
    });
    
    return acc;
  }, {} as Record<string, Record<string, TemaResumo>>) || {};

  // Ordenar subtemas por ordem
  Object.values(resumosPorArea).forEach(temas => {
    Object.values(temas).forEach(tema => {
      tema.subtemas.sort((a, b) => (a.ordemSubtema || '').localeCompare(b.ordemSubtema || ''));
    });
  });

  const areas = Object.keys(resumosPorArea).sort();

  return {
    resumosPorArea,
    areas,
    resumos: resumos || [],
    isLoading,
    error
  };
};