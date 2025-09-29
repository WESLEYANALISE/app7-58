import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNativeSpeed } from './useNativeSpeed';

export interface AppFunction {
  id: number;
  funcao: string;
  descricao: string;
  link: string;
}

export const useSuperFastAppFunctions = () => {
  const [functions, setFunctions] = useState<AppFunction[]>([]);
  const { getInstantData, setInstantData } = useNativeSpeed();
  
  const cacheKey = 'super-fast-app-functions';

  useEffect(() => {
    // Verificar cache primeiro
    const cached = getInstantData(cacheKey);
    if (cached) {
      setFunctions(cached);
      return;
    }

    // Se não tem cache, buscar dados em background
    const fetchFunctions = async () => {
      try {
        const { data, error } = await supabase
          .from('APP')
          .select('id, funcao, descricao, link')
          .order('id');

        if (error) throw error;
        
        const result = data || [];
        setFunctions(result);
        setInstantData(cacheKey, result);
      } catch (err) {
        console.error('Erro ao buscar funções do app:', err);
        // Fallback silencioso - mantém array vazio
        setFunctions([]);
      }
    };

    fetchFunctions();
  }, [getInstantData, setInstantData]);

  // Memoized function map for fast lookups
  const functionMap = useMemo(() => {
    return functions.reduce((map, func) => {
      const key = func.funcao.toLowerCase().trim();
      map[key] = func;
      return map;
    }, {} as Record<string, AppFunction>);
  }, [functions]);

  // Fast function finder
  const findFunction = useMemo(() => {
    return (name: string): AppFunction | undefined => {
      const normalizedName = name.toLowerCase().trim();
      
      // Exact match first
      if (functionMap[normalizedName]) {
        return functionMap[normalizedName];
      }
      
      // Fallback to partial match
      return functions.find(func => 
        func.funcao.toLowerCase().includes(normalizedName) ||
        func.descricao.toLowerCase().includes(normalizedName)
      );
    };
  }, [functionMap, functions]);

  return { 
    functions, 
    loading: false, // Nunca mostra loading
    error: null,    // Nunca mostra erro visível
    findFunction 
  };
};