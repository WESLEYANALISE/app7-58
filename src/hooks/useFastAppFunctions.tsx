import { supabase } from '@/integrations/supabase/client';
import { useMemo, useState, useEffect } from 'react';

export interface AppFunction {
  id: number;
  funcao: string;
  descricao: string;
  link: string;
}

// Hook ultra-otimizado - SEM LOADING STATES para entrada instantânea
export const useFastAppFunctions = () => {
  const [functions, setFunctions] = useState<AppFunction[]>([]);

  useEffect(() => {
    // Carregar dados imediatamente ao montar, mas não bloquear a UI
    const loadFunctions = async () => {
      try {
        // Primeiro, tentar cache local
        const cachedData = localStorage.getItem('app-functions-cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheTime = localStorage.getItem('app-functions-cache-time');
          const isRecent = cacheTime && (Date.now() - parseInt(cacheTime) < 30 * 60 * 1000); // 30 min
          
          if (isRecent) {
            setFunctions(parsed);
            return; // Usar cache e não fazer request
          }
        }

        // Se não tem cache ou está expirado, buscar dados
        const { data, error } = await supabase
          .from('APP')
          .select('id, funcao, descricao, link')
          .order('id');

        if (error && !cachedData) {
          console.error('Erro ao carregar funções:', error);
          return;
        }

        const finalData = data || (cachedData ? JSON.parse(cachedData) : []);
        setFunctions(finalData);

        // Atualizar cache apenas se sucesso
        if (data) {
          localStorage.setItem('app-functions-cache', JSON.stringify(data));
          localStorage.setItem('app-functions-cache-time', Date.now().toString());
        }
      } catch (error) {
        console.error('Erro no useFastAppFunctions:', error);
        // Fallar silenciosamente - não bloquear a UI
      }
    };

    loadFunctions();
  }, []);

  // Memoizar funções frequentemente acessadas
  const functionMap = useMemo(() => {
    return functions.reduce((acc, func) => {
      const key = func.funcao?.toLowerCase().trim();
      if (key) acc[key] = func;
      return acc;
    }, {} as Record<string, AppFunction>);
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
    loading: false, // SEMPRE false para entrada instantânea
    error: null,    // Não expor erros que possam bloquear UI
    findFunction
  };
};