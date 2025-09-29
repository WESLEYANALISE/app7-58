import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface PeticaoModel {
  id: number;
  'Petições': string;
  'Link': string;
}

export const usePeticoes = () => {
  const [data, setData] = useState<PeticaoModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeticoes = async () => {
      try {
        setIsLoading(true);
        const { data: peticoes, error } = await supabase
          .from('PETIÇÕES' as any)
          .select('*')
          .order('Petições', { ascending: true });

        if (error) throw error;
        setData((peticoes as any) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar petições');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeticoes();
  }, []);

  return { data, isLoading, error };
};

// Hook para organizar petições por categorias (agrupamento inteligente)
export const usePeticoesPorCategoria = () => {
  const { data: peticoes, isLoading, error } = usePeticoes();

  const categorias = useMemo(() => {
    if (!peticoes) return {};

    // Agrupar petições por categoria
    const grupos = peticoes.reduce((acc, peticao) => {
      const categoria = peticao['Petições'];
      const firstLetter = categoria.charAt(0).toUpperCase();
      
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(peticao);
      return acc;
    }, {} as Record<string, PeticaoModel[]>);

    // Ordenar cada grupo alfabeticamente
    Object.keys(grupos).forEach(key => {
      grupos[key].sort((a, b) => a['Petições'].localeCompare(b['Petições']));
    });

    return grupos;
  }, [peticoes]);

  const totalModelos = peticoes?.length || 0;

  return {
    categorias,
    peticoes: peticoes || [],
    totalModelos,
    isLoading,
    error
  };
};