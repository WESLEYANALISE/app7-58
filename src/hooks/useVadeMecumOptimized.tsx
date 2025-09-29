import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { useInstantCache } from '@/hooks/useInstantCache';

export interface VadeMecumLegalCode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
}

export interface VadeMecumArticle {
  id: string;
  numero: string;
  conteudo: string;
  codigo_id: string;
  naracao_url?: string | null;
  "Número do Artigo"?: string;
  "Artigo"?: string;
  "Narração"?: string | null;
}

export const useVadeMecumOptimized = () => {
  const [viewMode, setViewMode] = useState<'categories' | 'articles' | 'reader'>('categories');
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<VadeMecumArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search for better performance
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  
  const { getData, setData, hasData, preloadData } = useInstantCache();

  const legalCodes: VadeMecumLegalCode[] = useMemo(() => [
    {
      id: 'cc',
      name: 'CC',
      fullName: 'Código Civil',
      description: 'Lei nº 10.406/2002 - Regula as relações civis',
      icon: '⚖️',
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 'cf',
      name: 'CF',
      fullName: 'Constituição Federal',
      description: 'Carta Magna do Brasil de 1988',
      icon: '🏛️',
      color: 'from-green-600 to-green-800'
    },
    {
      id: 'cp',
      name: 'CP',
      fullName: 'Código Penal',
      description: 'Decreto-Lei nº 2.848/1940 - Define crimes e penas',
      icon: '⚔️',
      color: 'from-red-600 to-red-800'
    },
    {
      id: 'cpc',
      name: 'CPC',
      fullName: 'Código de Processo Civil',
      description: 'Lei nº 13.105/2015 - Regula o processo civil',
      icon: '📋',
      color: 'from-purple-600 to-purple-800'
    },
    {
      id: 'cpp',
      name: 'CPP',
      fullName: 'Código de Processo Penal',
      description: 'Decreto-Lei nº 3.689/1941 - Regula o processo penal',
      icon: '🔍',
      color: 'from-orange-600 to-orange-800'
    },
    {
      id: 'clt',
      name: 'CLT',
      fullName: 'Consolidação das Leis do Trabalho',
      description: 'Decreto-Lei nº 5.452/1943 - Direito do trabalho',
      icon: '👷',
      color: 'from-indigo-600 to-indigo-800'
    }
  ], []);

  const filteredArticles = useMemo(() => {
    if (!debouncedSearchTerm) return articles;
    return articles.filter(article => 
      article.numero.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      article.conteudo.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [articles, debouncedSearchTerm]);

  const fetchArticles = useCallback(async (codeId: string) => {
    const cacheKey = `articles-${codeId}`;
    
    // Check instant cache first
    const cached = getData(cacheKey);
    if (cached) {
      setArticles(cached);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const tableMap: Record<string, string> = {
        'cf': 'CF88',
        'cc': 'CC', 
        'cp': 'CP',
        'cpc': 'CPC',
        'cpp': 'CPP',
        'clt': 'CLT',
        'cdc': 'CDC'
      };

      const tableName = tableMap[codeId] || 'CF88';
      
      const { data, error: fetchError } = await supabase
        .from(tableName as any)
        .select('id, "Número do Artigo", Artigo, Narração')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      
      // Transform data to match expected format
      const transformedArticles = (data || []).map((item: any) => ({
        id: item.id.toString(),
        numero: item["Número do Artigo"] || item.id.toString(),
        conteudo: item.Artigo || '',
        codigo_id: codeId,
        naracao_url: item["Narração"] || null,
        "Número do Artigo": item["Número do Artigo"],
        "Artigo": item.Artigo,
        "Narração": item["Narração"]
      }));
      
      setArticles(transformedArticles);
      
      // Cache with instant cache
      setData(cacheKey, transformedArticles, 3);
      
    } catch (err: any) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [getData, setData]);

  const handleCategoryClick = useCallback((code: VadeMecumLegalCode) => {
    setSelectedCode(code);
    setViewMode('articles');
    setSearchTerm(''); // Reset search when changing codes
    fetchArticles(code.id);
  }, [fetchArticles]);

  // Check for navigation context
  useEffect(() => {
    const contextStr = sessionStorage.getItem('navigationContext');
    if (contextStr) {
      try {
        const context = JSON.parse(contextStr);
        if (context.autoOpen && context.itemData?.selectedCodeId) {
          const codeId = context.itemData.selectedCodeId;
          const code = legalCodes.find(c => c.id === codeId);
          if (code) {
            handleCategoryClick(code);
            if (context.itemData.articleNumber) {
              setTimeout(() => setSearchTerm(context.itemData.articleNumber), 100);
            }
          }
        }
        sessionStorage.removeItem('navigationContext');
      } catch (e) {
        console.warn('Invalid navigation context:', e);
      }
    }
  }, [legalCodes, handleCategoryClick]);

  const handleBack = useCallback(() => {
    if (viewMode === 'reader') {
      setViewMode('articles');
      setSelectedArticle(null);
    } else if (viewMode === 'articles') {
      setViewMode('categories');
      setSelectedCode(null);
      setArticles([]);
      setSearchTerm('');
    }
  }, [viewMode]);

  const handleArticleClick = useCallback((article: VadeMecumArticle) => {
    setSelectedArticle(article);
    setViewMode('reader');
  }, []);

  const getPageTitle = useCallback(() => {
    if (viewMode === 'reader' && selectedArticle) {
      return `Art. ${selectedArticle.numero}`;
    } else if (viewMode === 'articles' && selectedCode) {
      return selectedCode.name;
    }
    return 'Vade Mecum';
  }, [viewMode, selectedArticle, selectedCode]);

  return {
    viewMode,
    selectedCode,
    selectedArticle,
    searchTerm,
    setSearchTerm,
    articles: filteredArticles,
    loading,
    error,
    legalCodes,
    handleBack,
    handleCategoryClick,
    handleArticleClick,
    getPageTitle
  };
};