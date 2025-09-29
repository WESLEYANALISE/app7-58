
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useMemo } from 'react';

export interface AppFunction {
  id: number;
  funcao: string;
  descricao: string;
  link: string;
}

// Hook otimizado com cache mais agressivo
export const useAppFunctions = () => {
  const { data: functions = [], isLoading: loading, error } = useOptimizedQuery({
    queryKey: ['app-functions-optimized'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('APP')
        .select('id, funcao, descricao, link')
        .order('id');

      if (error) throw error;
      return data as AppFunction[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - cache mais longo
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
    refetchOnWindowFocus: false, // Não refetch ao focar janela
    useExternalCache: true, // Usar cache externo para melhor performance
  });

  // Memoizar funções frequentemente acessadas
  const functionMap = useMemo(() => {
    const map = functions.reduce((acc, func) => {
      const key = func.funcao?.toLowerCase().trim();
      if (key) acc[key] = func;
      return acc;
    }, {} as Record<string, AppFunction>);
    
    // Adicionar função nativa de resumos jurídicos se não existir
    if (!map['resumos jurídicos']) {
      map['resumos jurídicos'] = {
        id: 9999,
        funcao: 'Resumos Jurídicos',
        descricao: 'Resumos organizados por área, tema e subtema com diferentes tipos de apresentação',
        link: 'native://resumos-juridicos'
      };
    }
    
    // Adicionar função nativa de petições se não existir
    if (!map['petições']) {
      map['petições'] = {
        id: 9998,
        funcao: 'Petições',
        descricao: 'Mais de 35 mil modelos de petições organizados por área jurídica',
        link: 'native://peticoes'
      };
    }
    
    return map;
  }, [functions]);

  const findFunction = useMemo(() => {
    return (name: string) => {
      if (!name) return null;
      const normalizedName = name.toLowerCase().trim();
      return functionMap[normalizedName] || functions.find(func => 
        func.funcao?.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(func.funcao?.toLowerCase())
      ) || null;
    };
  }, [functionMap, functions]);

  return { 
    functions, 
    loading, 
    error: error?.message || null,
    functionMap,
    findFunction
  };
};
