import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Fuse from 'fuse.js';

interface Article {
  id: number;
  "Número do Artigo": string;
  Artigo: string;
}

export const useVadeMecumData = (codeId: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Fuse instance for search
  const fuse = useMemo(() => {
    if (articles.length === 0) return null;
    
    return new Fuse(articles, {
      keys: [
        { name: 'Artigo', weight: 0.8 },
        { name: 'Número do Artigo', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2
    });
  }, [articles]);

  useEffect(() => {
    if (!codeId) {
      setArticles([]);
      return;
    }

    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Map code IDs to table names
        const tableMap: Record<string, string> = {
          'CC': 'CC',
          'CF88': 'CF88',
          'CP': 'CP',
          'CPC': 'CPC',
          'ESTATUTO - OAB': 'ESTATUTO - OAB'
        };

        const tableName = tableMap[codeId];
        if (!tableName) {
          throw new Error(`Código não encontrado: ${codeId}`);
        }

        let data, supabaseError;
        
        // Handle each table with its specific structure
        switch (codeId) {
          case 'CC':
            ({ data, error: supabaseError } = await (supabase as any)
              .from('CC')
              .select('id, "Número do Artigo", Artigo')
              .order('id'));
            break;
          case 'CF88':
            ({ data, error: supabaseError } = await (supabase as any)
              .from('CF88')
              .select('id, "Número do Artigo", Artigo')
              .order('id'));
            break;
          case 'CP':
            ({ data, error: supabaseError } = await (supabase as any)
              .from('CP')
              .select('id, "Número do Artigo", Artigo')
              .order('id'));
            break;
          case 'CPC':
            ({ data, error: supabaseError } = await (supabase as any)
              .from('CPC')
              .select('id, "Número do Artigo", Artigo')
              .order('id'));
            break;
          case 'ESTATUTO - OAB':
            ({ data, error: supabaseError } = await (supabase as any)
              .from('ESTATUTO - OAB')
              .select('id, "Número do Artigo", Artigo')
              .order('id'));
            break;
          default:
            throw new Error(`Código não encontrado: ${codeId}`);
        }

        if (supabaseError) {
          throw supabaseError;
        }

        setArticles(data || []);
      } catch (err) {
        console.error('Erro ao buscar artigos:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [codeId]);

  const searchArticles = (query: string): Article[] => {
    if (!query.trim() || !fuse) {
      return articles;
    }

    const results = fuse.search(query);
    return results.map(result => result.item);
  };

  return {
    articles,
    isLoading,
    error,
    searchArticles
  };
};