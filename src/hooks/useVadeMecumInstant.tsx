import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInstantCache } from '@/hooks/useInstantCache';

export interface VadeMecumLegalCode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
  textColor?: string;
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

// Cache ultra-rápido em memória
const articlesCache = new Map<string, VadeMecumArticle[]>();
const popularCodes = ['CC', 'CF88', 'CP', 'CPC'];

export const useVadeMecumInstant = () => {
  const [mainView, setMainView] = useState<'selection' | 'categories' | 'articles'>('selection');
  const [categoryType, setCategoryType] = useState<'articles' | 'statutes' | null>(null);
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCodeId, setLoadingCodeId] = useState<string | null>(null);
  
  const { getData, setData, hasData, preloadData } = useInstantCache();

  // Check for navigation context on mount
  useEffect(() => {
    const contextStr = sessionStorage.getItem('navigationContext');
    if (contextStr) {
      try {
        const context = JSON.parse(contextStr);
        if (context.autoOpen && context.itemData?.selectedCodeId) {
          const codeId = context.itemData.selectedCodeId;
          const code = [...articleCodes, ...statuteCodes].find(c => c.id === codeId);
          if (code) {
            handleCodeClick(code);
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
  }, []);

  // Preload ultra-agressivo dos códigos mais usados
  useEffect(() => {
    const preloadPopularCodes = async () => {
      const tableMap: Record<string, string> = {
        'CC': 'cc',
        'CF88': 'cf88', 
        'CP': 'cp',
        'CPC': 'cpc'
      };

      // Preload em paralelo para máxima velocidade
      const preloadPromises = popularCodes.map(async (table) => {
        const cacheKey = `articles-${table.toLowerCase()}`;
        
        if (!hasData(cacheKey) && !articlesCache.has(cacheKey)) {
          return preloadData(cacheKey, async () => {
            const { data } = await supabase
              .from(table as any)
              .select('id, "Número do Artigo", Artigo')
              .order('id', { ascending: true });

            const transformedArticles = (data || []).map((item: any) => ({
              id: item.id.toString(),
              numero: item["Número do Artigo"] || item.id.toString(),
              conteudo: item.Artigo || '',
              codigo_id: table.toLowerCase(),
              "Número do Artigo": item["Número do Artigo"],
              "Artigo": item.Artigo
            }));
            
            articlesCache.set(cacheKey, transformedArticles);
            return transformedArticles;
          }, 5); // Alta prioridade
        }
      });

      await Promise.allSettled(preloadPromises);
    };

    // Execute preload em background
    requestIdleCallback ? 
      requestIdleCallback(() => preloadPopularCodes()) : 
      setTimeout(preloadPopularCodes, 50);
  }, [hasData, preloadData]);

  // Códigos jurídicos com design consistente
  const articleCodes: VadeMecumLegalCode[] = useMemo(() => [
    { 
      id: 'cf88', name: 'CF88', fullName: 'Constituição Federal de 1988', 
      description: 'Lei fundamental do Brasil', 
      icon: '🏛️', 
      color: 'gradient-legal border border-yellow-500/30',
      textColor: 'text-background'
    },
    { 
      id: 'cc', name: 'CC', fullName: 'Código Civil', 
      description: 'Relações civis entre particulares', 
      icon: '🤝', 
      color: 'bg-gradient-to-br from-blue-600/90 to-blue-700/80 border border-blue-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cdc', name: 'CDC', fullName: 'Código de Defesa do Consumidor', 
      description: 'Proteção dos direitos do consumidor', 
      icon: '🛡️', 
      color: 'bg-gradient-to-br from-green-600/90 to-green-700/80 border border-green-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'clt', name: 'CLT', fullName: 'Consolidação das Leis do Trabalho', 
      description: 'Direitos e deveres trabalhistas', 
      icon: '👷', 
      color: 'bg-gradient-to-br from-purple-600/90 to-purple-700/80 border border-purple-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cp', name: 'CP', fullName: 'Código Penal', 
      description: 'Crimes e suas punições', 
      icon: '⚖️', 
      color: 'gradient-elegant-red border border-red-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cpc', name: 'CPC', fullName: 'Código de Processo Civil', 
      description: 'Procedimentos processuais cíveis', 
      icon: '📋', 
      color: 'bg-gradient-to-br from-indigo-600/90 to-indigo-700/80 border border-indigo-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cpp', name: 'CPP', fullName: 'Código de Processo Penal', 
      description: 'Procedimentos penais', 
      icon: '🔍', 
      color: 'bg-gradient-to-br from-orange-600/90 to-orange-700/80 border border-orange-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ctn', name: 'CTN', fullName: 'Código Tributário Nacional', 
      description: 'Normas gerais de direito tributário', 
      icon: '💰', 
      color: 'bg-gradient-to-br from-teal-600/90 to-teal-700/80 border border-teal-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ctb', name: 'CTB', fullName: 'Código de Trânsito Brasileiro', 
      description: 'Normas de trânsito', 
      icon: '🚗', 
      color: 'bg-gradient-to-br from-cyan-600/90 to-cyan-700/80 border border-cyan-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ce', name: 'CE', fullName: 'Código Eleitoral', 
      description: 'Normas eleitorais', 
      icon: '🗳️', 
      color: 'bg-gradient-to-br from-pink-600/90 to-pink-700/80 border border-pink-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ca', name: 'CA', fullName: 'Código de Águas', 
      description: 'Legislação sobre recursos hídricos', 
      icon: '💧', 
      color: 'bg-gradient-to-br from-blue-500/90 to-blue-600/80 border border-blue-400/30',
      textColor: 'text-white'
    },
    { 
      id: 'cba', name: 'CBA', fullName: 'Código Brasileiro de Aeronáutica', 
      description: 'Legislação aeronáutica', 
      icon: '✈️', 
      color: 'bg-gradient-to-br from-sky-600/90 to-sky-700/80 border border-sky-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cbt', name: 'CBT', fullName: 'Código Brasileiro de Telecomunicações', 
      description: 'Legislação de telecomunicações', 
      icon: '📡', 
      color: 'bg-gradient-to-br from-violet-600/90 to-violet-700/80 border border-violet-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ccom', name: 'CCOM', fullName: 'Código Comercial', 
      description: 'Direito comercial', 
      icon: '💼', 
      color: 'bg-gradient-to-br from-green-600/90 to-green-700/80 border border-green-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cdm', name: 'CDM', fullName: 'Código de Minas', 
      description: 'Legislação minerária', 
      icon: '⛏️', 
      color: 'bg-gradient-to-br from-stone-600/90 to-stone-700/80 border border-stone-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ced', name: 'CED', fullName: 'Código de Ética - OAB', 
      description: 'Ética profissional da advocacia', 
      icon: '⚖️', 
      color: 'bg-gradient-to-br from-amber-600/90 to-amber-700/80 border border-amber-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cppm', name: 'CPPM', fullName: 'Código de Processo Penal Militar', 
      description: 'Procedimentos penais militares', 
      icon: '🪖', 
      color: 'bg-gradient-to-br from-red-700/90 to-red-800/80 border border-red-600/30',
      textColor: 'text-white'
    },
  ], []);

  // Estatutos
  const statuteCodes: VadeMecumLegalCode[] = useMemo(() => [
    { 
      id: 'estatuto-oab', name: 'Estatuto da OAB', fullName: 'Estatuto da Advocacia e da OAB', 
      description: 'Lei nº 8.906/1994', 
      icon: '🎓', 
      color: 'gradient-tools border border-yellow-500/30',
      textColor: 'text-background'
    },
    { 
      id: 'estatuto-eca', name: 'Estatuto da Criança e Adolescente', fullName: 'Estatuto da Criança e do Adolescente', 
      description: 'Lei nº 8.069/1990', 
      icon: '👶', 
      color: 'bg-gradient-to-br from-blue-600/90 to-blue-700/80 border border-blue-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'estatuto-idoso', name: 'Estatuto do Idoso', fullName: 'Estatuto do Idoso', 
      description: 'Lei nº 10.741/2003', 
      icon: '👴', 
      color: 'bg-gradient-to-br from-emerald-600/90 to-emerald-700/80 border border-emerald-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'estatuto-pcd', name: 'Estatuto da Pessoa com Deficiência', fullName: 'Estatuto da Pessoa com Deficiência', 
      description: 'Lei nº 13.146/2015', 
      icon: '♿', 
      color: 'bg-gradient-to-br from-indigo-600/90 to-indigo-700/80 border border-indigo-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'estatuto-igualdade-racial', name: 'Estatuto da Igualdade Racial', fullName: 'Estatuto da Igualdade Racial', 
      description: 'Lei nº 12.288/2010', 
      icon: '🤝', 
      color: 'bg-gradient-to-br from-amber-600/90 to-amber-700/80 border border-amber-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'estatuto-cidade', name: 'Estatuto da Cidade', fullName: 'Estatuto da Cidade', 
      description: 'Lei nº 10.257/2001', 
      icon: '🏙️', 
      color: 'bg-gradient-to-br from-slate-600/90 to-slate-700/80 border border-slate-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'estatuto-desarmamento', name: 'Estatuto do Desarmamento', fullName: 'Estatuto do Desarmamento', 
      description: 'Lei nº 10.826/2003', 
      icon: '🔫', 
      color: 'bg-gradient-to-br from-red-600/90 to-red-700/80 border border-red-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'estatuto-torcedor', name: 'Estatuto do Torcedor', fullName: 'Estatuto de Defesa do Torcedor', 
      description: 'Lei nº 10.671/2003', 
      icon: '⚽', 
      color: 'bg-gradient-to-br from-green-600/90 to-green-700/80 border border-green-500/30',
      textColor: 'text-white'
    }
  ], []);

  const currentCodes = categoryType === 'articles' ? articleCodes : statuteCodes;

  // Busca otimizada e instantânea
  const filteredArticles = useMemo(() => {
    const articlesWithNumber = articles.filter(article => 
      article["Número do Artigo"] && article["Número do Artigo"].trim() !== ''
    );
    
    if (!searchTerm.trim()) return articlesWithNumber;
    
    const searchTerm_clean = searchTerm.trim();
    
    // 1. Busca EXATA por número - prioridade máxima
    const exactMatch = articlesWithNumber.find(article => {
      const articleNumber = article["Número do Artigo"]?.trim();
      return articleNumber === searchTerm_clean || 
             articleNumber === `${searchTerm_clean}º` ||
             articleNumber === `Art. ${searchTerm_clean}` ||
             articleNumber === `Artigo ${searchTerm_clean}`;
    });
    
    if (exactMatch) {
      return [exactMatch];
    }
    
    // 2. Busca por número numérico apenas
    const searchNumbers = searchTerm_clean.match(/\d+/g);
    if (searchNumbers && searchNumbers.length > 0) {
      const searchNumber = searchNumbers[0];
      const numberMatch = articlesWithNumber.find(article => {
        const articleNumbers = article["Número do Artigo"]?.match(/\d+/g);
        return articleNumbers && articleNumbers[0] === searchNumber;
      });
      if (numberMatch) {
        return [numberMatch];
      }
    }
    
    // 3. Busca parcial como fallback
    const searchLower = searchTerm_clean.toLowerCase();
    return articlesWithNumber.filter(article => {
      const articleNumber = article["Número do Artigo"]?.toLowerCase() || '';
      const articleContent = article.Artigo?.toLowerCase() || '';
      
      return articleNumber.includes(searchLower) || articleContent.includes(searchLower);
    }); // Sem limite - permitir busca em todos os artigos
  }, [articles, searchTerm]);

  // Buscar artigos com cache instantâneo e carregamento otimizado
  const fetchArticles = useCallback(async (codeId: string) => {
    const cacheKey = `articles-${codeId}`;
    
    // Triple cache check: memory -> hook -> network
    let cachedData = articlesCache.get(cacheKey);
    if (!cachedData) {
      cachedData = getData(cacheKey);
      if (cachedData) {
        articlesCache.set(cacheKey, cachedData);
      }
    }
    
    if (cachedData) {
      setArticles(cachedData);
      return;
    }

    setLoading(true);
    setLoadingCodeId(codeId);
    
    try {
      const tableMap: Record<string, string> = {
        'cc': 'CC',
        'cdc': 'CDC', 
        'cf88': 'CF88',
        'clt': 'CLT',
        'cp': 'CP',
        'cpc': 'CPC',
        'cpp': 'CPP',
        'ctn': 'CTN',
        'ctb': 'CTB',
        'ce': 'CE',
        'ca': 'CA- Código de aguas',
        'cba': 'CBA - Código Brasileiro de Aeronáutica',
        'cbt': 'CBT - Código Brasileiro de Telecomunicações.',
        'ccom': 'CCOM',
        'cdm': 'CDM - Código de Minas',
        'ced': 'CED CÓDIGO DE ETICA - OAB',
        'cppm': 'CPPM - PROCESSO MILITAR',
        'estatuto-oab': 'ESTATUTO - OAB',
        'estatuto-eca': 'ESTATUTO - ECA',
        'estatuto-idoso': 'ESTATUTO - IDOSO',
        'estatuto-pcd': 'ESTATUTO - PESSOA COM DEFICIENCIA',
        'estatuto-igualdade-racial': 'ESTATUTO - IGUALDADE RACIAL',
        'estatuto-cidade': 'ESTATUTO - CIDADE',
        'estatuto-desarmamento': 'ESTATUTO - DESARMAMENTO',
        'estatuto-torcedor': 'ESTATUTO - TORCEDOR'
      };

      const tableName = tableMap[codeId];
      if (!tableName) {
        setArticles([]);
        return;
      }

      const { data } = await supabase
        .from(tableName as any)
        .select('id, "Número do Artigo", Artigo, Narração')
        .order('id', { ascending: true });

      const transformedArticles = (data || []).map((item: any) => ({
        id: item.id.toString(),
        numero: item["Número do Artigo"] || item.id.toString(),
        conteudo: item.Artigo || '',
        codigo_id: codeId,
        naracao_url: item["Narração"] || null,
        "Número do Artigo": item["Número do Artigo"],
        "Narração": item["Narração"],
        "Artigo": item.Artigo
      }));
      
      setArticles(transformedArticles);
      
      // Triple cache store for instant future access
      setData(cacheKey, transformedArticles, 4);
      articlesCache.set(cacheKey, transformedArticles);
      
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
      setArticles([]);
    } finally {
      setLoading(false);
      setLoadingCodeId(null);
    }
  }, [getData, setData]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (mainView === 'articles') {
      setMainView('categories');
      setSelectedCode(null);
      setSearchTerm('');
    } else if (mainView === 'categories') {
      setMainView('selection');
      setCategoryType(null);
    }
  }, [mainView]);

  const handleCategorySelection = useCallback((type: 'articles' | 'statutes') => {
    setCategoryType(type);
    setMainView('categories');
  }, []);

  const handleCodeClick = useCallback((code: VadeMecumLegalCode) => {
    setSelectedCode(code);
    setMainView('articles');
    setSearchTerm(''); // Reset search when switching codes
    fetchArticles(code.id);
  }, [fetchArticles]);

  return {
    mainView,
    categoryType,
    selectedCode,
    searchTerm,
    setSearchTerm,
    articles: filteredArticles,
    loading,
    loadingCodeId,
    currentCodes,
    handleBack,
    handleCategorySelection,
    handleCodeClick
  };
};