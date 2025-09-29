import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, ArrowLeft, Scale, BookOpen, 
  ChevronRight, Copy, X, Home, FileText, Scroll,
  Volume2, Lightbulb, Bookmark, Brain, Plus, Minus, ArrowUp, Square, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfessoraIAFloatingButton } from '@/components/ProfessoraIAFloatingButton';
import { ProfessoraIA } from '@/components/ProfessoraIA';
import ReactMarkdown from 'react-markdown';
import { copyToClipboard } from '@/utils/clipboardUtils';
import { ProgressIndicator } from '@/components/ProgressIndicator';

interface VadeMecumLegalCode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
  textColor?: string;
}

interface VadeMecumArticle {
  id: string;
  numero: string;
  conteudo: string;
  codigo_id: string;
  "Número do Artigo"?: string;
  "Artigo"?: string;
}

// Cache em memória global para máxima performance
const articlesCache = new Map<string, VadeMecumArticle[]>();
let isPreloading = false;

const VadeMecumUltraFast: React.FC = () => {
  const [view, setView] = useState<'home' | 'codes' | 'articles'>('home');
  const [categoryType, setCategoryType] = useState<'articles' | 'statutes' | null>(null);
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedArticles, setDisplayedArticles] = useState<VadeMecumArticle[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const ARTICLES_PER_PAGE = 20;
  const [fontSize, setFontSize] = useState(16);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Estados para indicador de progresso
  const [loadingProgress, setLoadingProgress] = useState<{ [key: string]: number }>({});
  const [activeLoading, setActiveLoading] = useState<{ [key: string]: boolean }>({});
  
  // Estado para loading com blur overlay
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<'explicar' | 'exemplo' | null>(null);
  
  // Estados para narração
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrateLoading, setNarrateLoading] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  
  // Estado para Professora IA
  const [showProfessora, setShowProfessora] = useState(false);
  
  // Estado centralizado para modais de conteúdo gerado
  const [generatedModal, setGeneratedModal] = useState<{
    open: boolean;
    type: 'explicar' | 'exemplo';
    content: string;
    articleNumber: string;
    hasValidNumber: boolean;
  }>({
    open: false,
    type: 'explicar',
    content: '',
    articleNumber: '',
    hasValidNumber: false
  });
  
  const searchRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setCurrentFunction } = useNavigation();

  // Controle de scroll otimizado sem piscar
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sistema de preload agressivo para carregamento instantâneo
  useEffect(() => {
    if (!isPreloading) {
      isPreloading = true;
      const preloadPopular = async () => {
        // Códigos mais acessados primeiro
        const popularCodes = [
          { table: 'CC', id: 'cc' },
          { table: 'CF88', id: 'cf88' },
          { table: 'CP', id: 'cp' },
          { table: 'CPC', id: 'cpc' },
          { table: 'CPP', id: 'cpp' },
          { table: 'CLT', id: 'clt' },
          { table: 'CDC', id: 'cdc' }
        ];
        
        // Preload em batches para não sobrecarregar o servidor
        const batchSize = 3;
        for (let i = 0; i < popularCodes.length; i += batchSize) {
          const batch = popularCodes.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async ({ table, id }) => {
            const cacheKey = `articles-${id}`;
            
            if (!articlesCache.has(cacheKey)) {
              try {
                const { data } = await supabase
                  .from(table as any)
                  .select('id, "Número do Artigo", Artigo')
                  .order('id', { ascending: true });
                
                if (data) {
                  const transformed = data.map((item: any) => ({
                    id: String(item.id),
                    numero: item["Número do Artigo"] || String(item.id),
                    conteudo: item.Artigo || '',
                    codigo_id: id,
                    "Número do Artigo": item["Número do Artigo"],
                    "Artigo": item.Artigo
                  }));
                  articlesCache.set(cacheKey, transformed);
                }
              } catch (e) {
                // Silently fail preload para não interromper UX
              }
            }
          });
          
          // Processa batch e aguarda antes do próximo
          await Promise.allSettled(batchPromises);
          
          // Pequeno delay entre batches para otimizar performance
          if (i + batchSize < popularCodes.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };
      
      // Executa preload em background sem bloquear UI
      requestIdleCallback ? 
        requestIdleCallback(() => preloadPopular()) : 
        setTimeout(preloadPopular, 100);
    }
  }, []);

  // Códigos com layout minimalista 2x2 como na referência
  const articleCodes = useMemo<VadeMecumLegalCode[]>(() => [
    { 
      id: 'cc', name: 'CC', fullName: 'Código Civil', 
      description: 'Relações civis', 
      icon: '🤝', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'cf88', name: 'CF/88', fullName: 'Constituição Federal', 
      description: 'Carta Magna', 
      icon: '🏛️', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'cp', name: 'CP', fullName: 'Código Penal', 
      description: 'Crimes e penas', 
      icon: '⚖️', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'cpc', name: 'CPC', fullName: 'Código de Processo Civil', 
      description: 'Procedimentos cíveis', 
      icon: '📋', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'cpp', name: 'CPP', fullName: 'Código de Processo Penal', 
      description: 'Procedimentos penais', 
      icon: '🔍', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'clt', name: 'CLT', fullName: 'Consolidação Leis Trabalho', 
      description: 'Direito trabalhista', 
      icon: '👷', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'cdc', name: 'CDC', fullName: 'Código Defesa Consumidor', 
      description: 'Proteção consumidor', 
      icon: '🛡️', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'ctn', name: 'CTN', fullName: 'Código Tributário Nacional', 
      description: 'Direito tributário', 
      icon: '💰', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    }
  ], []);

  // Estatutos minimalistas
  const statuteCodes = useMemo<VadeMecumLegalCode[]>(() => [
    { 
      id: 'eca', name: 'ECA', fullName: 'Estatuto Criança Adolescente', 
      description: 'Proteção criança', 
      icon: '👶', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'estatuto-idoso', name: 'Estatuto Idoso', fullName: 'Estatuto da Pessoa Idosa', 
      description: 'Direitos idosos', 
      icon: '👴', 
      color: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
      textColor: 'text-white'
    }
  ], []);

  const currentCodes = useMemo(() => {
    return categoryType === 'statutes' ? statuteCodes : articleCodes;
  }, [categoryType, articleCodes, statuteCodes]);

  // Função para validar se tem número de artigo válido
  const isValidArticleNumber = useCallback((articleNumber: string, articleContent?: string) => {
    // Verifica se tem número e não é apenas texto de seção/capítulo
    if (!articleNumber) return false;
    
    // Remove caracteres não numéricos e verifica se sobrou algo
    const numbersOnly = articleNumber.replace(/[^\d]/g, '');
    
    // Se não tem números, não é um artigo numerado
    if (numbersOnly.length === 0) return false;
    
    // Verifica se é um texto de seção/capítulo comum
    const lowerText = articleNumber.toLowerCase();
    const sectionWords = ['capítulo', 'capitulo', 'seção', 'secao', 'título', 'titulo', 'livro', 'parte'];
    if (sectionWords.some(word => lowerText.includes(word))) return false;
    
    // Verifica se o conteúdo do artigo contém referência a "Art." em qualquer lugar
    if (articleContent) {
      const contentLower = articleContent.toLowerCase().trim();
      
      // Para o Código Penal e outros códigos, aceita se:
      // 1. Começa diretamente com "art." ou "artigo"
      // 2. Contém "art. X" onde X corresponde ao número do artigo
      const startsWithArticle = contentLower.startsWith('art.') || 
                               contentLower.startsWith('artigo');
                               
      // Ou se contém "Art. [número]" em qualquer lugar do texto
      const articlePattern = new RegExp(`art\\.?\\s*${articleNumber.replace(/[^\w]/g, '')}[^\\w]`, 'i');
      const containsArticleNumber = articlePattern.test(contentLower);
      
      // Aceita se começa com artigo OU se contém a referência ao artigo no meio do texto
      if (startsWithArticle || containsArticleNumber) {
        return true;
      }
      
      // Se não encontrou padrão de artigo, não deve mostrar número
      return false;
    }
    
    return true;
  }, []);

  // Função para simular progresso com porcentagem
  const simulateProgress = useCallback((key: string, duration: number = 3000) => {
    setActiveLoading(prev => ({ ...prev, [key]: true }));
    setLoadingProgress(prev => ({ ...prev, [key]: 0 }));
    
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 95);
      
      setLoadingProgress(prev => ({ ...prev, [key]: progress }));
      
      if (progress < 95) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }, []);

  const stopProgress = useCallback((key: string) => {
    setLoadingProgress(prev => ({ ...prev, [key]: 100 }));
    setTimeout(() => {
      setActiveLoading(prev => ({ ...prev, [key]: false }));
      setLoadingProgress(prev => ({ ...prev, [key]: 0 }));
    }, 500);
  }, []);

  // Sistema de busca otimizado com paginação
  const filteredArticles = useMemo(() => {
    const allValidArticles = articles.filter(article => {
      const articleContent = article["Artigo"] || article.conteudo || '';
      return articleContent.trim() !== '';
    });

    if (!searchTerm.trim()) return allValidArticles;

    const searchLower = searchTerm.toLowerCase().trim();
    const searchNumbers = searchTerm.replace(/[^\d]/g, '');

    const results: { article: VadeMecumArticle; score: number }[] = [];
    
    for (let i = 0; i < allValidArticles.length; i++) {
      const article = allValidArticles[i];
      const articleNumber = article["Número do Artigo"] || article.numero || '';
      const articleContent = article["Artigo"] || article.conteudo || '';
      
      let score = 0;
      
      // Match exato - prioridade máxima
      if (articleNumber.toLowerCase() === searchLower) {
        return [article];
      }
      // Número puro
      else if (searchNumbers && articleNumber.replace(/[^\d]/g, '') === searchNumbers) {
        score = 900;
      }
      // Número contém
      else if (articleNumber.toLowerCase().includes(searchLower)) {
        score = 800;
      }
      // Conteúdo contém
      else if (articleContent.toLowerCase().includes(searchLower)) {
        score = 100;
      }
      
      if (score > 0) {
        results.push({ article, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .map(item => item.article);
  }, [articles, searchTerm]);

  // Infinite scroll setup
  useEffect(() => {
    if (searchTerm.trim()) {
      // When searching, show all results
      setDisplayedArticles(filteredArticles);
      setHasMore(false);
    } else {
      // When not searching, show paginated results
      const startIndex = 0;
      const endIndex = page * ARTICLES_PER_PAGE;
      const newDisplayed = filteredArticles.slice(startIndex, endIndex);
      setDisplayedArticles(newDisplayed);
      setHasMore(endIndex < filteredArticles.length);
    }
  }, [filteredArticles, page, searchTerm]);

  // Reset pagination when articles change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [articles]);

  // Infinite scroll handler
  useEffect(() => {
    if (searchTerm.trim()) return; // Don't use infinite scroll during search

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        if (hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, searchTerm]);

  // Carregar artigos com cache instantâneo e otimização extrema
  const loadArticles = useCallback(async (code: VadeMecumLegalCode) => {
    const cacheKey = `articles-${code.id}`;
    
    // Verifica cache primeiro - carregamento instantâneo
    if (articlesCache.has(cacheKey)) {
      const cachedData = articlesCache.get(cacheKey)!;
      setArticles(cachedData);
      setSelectedCode(code);
      setView('articles');
      setSearchTerm('');
      return;
    }

    // Estado de carregamento mínimo para UX responsiva
    setIsLoading(true);
    setSelectedCode(code);
    setView('articles');
    setSearchTerm('');
    
    try {
      // Mapping otimizado de tabelas
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
        'eca': 'ECA',
        'estatuto_idoso': 'ESTATUTO - IDOSO'
      };
      
      const tableName = tableMap[code.id];
      if (!tableName) {
        setIsLoading(false);
        return;
      }

      // Query otimizada para máxima velocidade
      const { data, error } = await supabase
        .from(tableName as any)
        .select('id, "Número do Artigo", Artigo')
        .order('id', { ascending: true });

      if (error) throw error;

      // Transformação otimizada de dados
      const transformedArticles = (data || []).map((item: any) => ({
        id: String(item.id),
        numero: item["Número do Artigo"] || String(item.id),
        conteudo: item.Artigo || '',
        codigo_id: code.id,
        "Número do Artigo": item["Número do Artigo"],
        "Artigo": item.Artigo
      }));

      // Cache triplo para máxima performance
      articlesCache.set(cacheKey, transformedArticles);
      setArticles(transformedArticles);
      
    } catch (error: any) {
      toast({
        title: "❌ Erro ao carregar artigos",
        description: error.message || "Não foi possível carregar os artigos.",
        variant: "destructive"
      });
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Navegação otimizada
  const handleBack = useCallback(() => {
    if (view === 'articles') {
      setView('codes');
      setArticles([]);
      setSearchTerm('');
    } else if (view === 'codes') {
      setView('home');
      setCategoryType(null);
    } else {
      setCurrentFunction(null);
    }
  }, [view, setCurrentFunction]);

  const selectCategory = useCallback((type: 'articles' | 'statutes') => {
    setCategoryType(type);
    setView('codes');
  }, []);

  const copyArticle = useCallback(async (content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      toast({
        title: "✅ Artigo copiado!",
        description: "O conteúdo foi copiado para a área de transferência.",
      });
    } else {
      toast({
        title: "❌ Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const narrateArticle = useCallback(async (articleContent: string, articleNumber: string, codeName: string) => {
    if (isNarrating && audioInstance) {
      // Parar narração
      audioInstance.pause();
      setIsNarrating(false);
      setAudioInstance(null);
      return;
    }

    setNarrateLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-article-tts', {
        body: {
          text: `${codeName}, Artigo ${articleNumber}. ${articleContent}`,
          voice: 'Zephyr'
        }
      });

      if (error) throw error;

      if (data.success && data.audioData) {
        // Converter base64 para blob e reproduzir
        const binaryString = atob(data.audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsNarrating(false);
          setAudioInstance(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsNarrating(false);
          setAudioInstance(null);
          URL.revokeObjectURL(audioUrl);
          toast({
            title: "❌ Erro",
            description: "Erro ao reproduzir áudio.",
            variant: "destructive",
          });
        };

        setAudioInstance(audio);
        setIsNarrating(true);
        audio.play();
        
        toast({
          title: "🔊 Narração iniciada",
          description: "O artigo está sendo narrado.",
        });
      } else {
        throw new Error('Falha ao gerar áudio');
      }
    } catch (error: any) {
      console.error('Erro ao narrar artigo:', error);
      toast({
        title: "❌ Erro ao narrar",
        description: "Erro ao narrar artigo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setNarrateLoading(false);
    }
  }, [isNarrating, audioInstance, toast]);

  // Função para sintetizar voz (Web Speech API)
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      
      toast({
        title: "🔊 Reproduzindo áudio",
        description: "O texto está sendo reproduzido em voz alta.",
      });
    } else {
      toast({
        title: "❌ Recurso não disponível",
        description: "Seu navegador não suporta síntese de voz.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Função para formatar texto com estilos específicos
  const formatVademecumText = useCallback((text: string) => {
    if (!text) return text;
    
    // Aplica formatação para títulos do Código Penal e "Parágrafo único"
    let formattedText = text;
    
    // Identifica e formata títulos antes de "Art." - Código Penal com cor branca e negrito
    formattedText = formattedText.replace(
      /^([^A][^r][^t].*?)(?=\n\nArt\.)/gm, 
      '<strong style="font-weight: bold; color: #ffffff;">$1</strong>'
    );
    
    // Formata títulos que aparecem no início de linhas (sem Art.) com cor branca e negrito
    formattedText = formattedText.replace(
      /^([A-Z][a-záêôõçã\s]+)(?=\n\nArt\.)/gm,
      '<strong style="font-weight: bold; color: #ffffff;">$1</strong>'
    );
    
    // Formata "Parágrafo único" em todos os códigos com cor branca
    formattedText = formattedText.replace(
      /(Parágrafo único|PARÁGRAFO ÚNICO)/gi,
      '<strong style="font-weight: bold; color: #ffffff;">$1</strong>'
    );
    
    // Quebras de linha para HTML
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  }, []);

  // Componente de Card do Artigo
  const VadeMecumArticleCard = ({ article, index }: { article: VadeMecumArticle; index: number }) => {
    const [loadingState, setLoadingState] = useState<{
      explanation: boolean;
      practicalExample: boolean;
    }>({
      explanation: false,
      practicalExample: false
    });

    const articleNumber = article["Número do Artigo"] || article.numero || '';
    const articleContent = article["Artigo"] || article.conteudo || '';
    
    // Verifica se tem número válido (contém dígitos após remover caracteres não numéricos)
    const hasValidNumber = isValidArticleNumber(articleNumber, articleContent);

    // Layout compacto para cards sem número válido (seções, capítulos, etc.)
    if (!hasValidNumber) {
      return (
        <div
          className="mb-2"
        >
          <Card className="bg-muted/20 border-muted/40">
            <CardContent className="p-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-medium tracking-wide">
                  {articleContent}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Define keys for loading states
    const explainKey = `explain-${articleNumber}`;
    const exampleKey = `example-${articleNumber}`;

    const handleExplain = async () => {
      const key = explainKey;
      setIsGenerating(true);
      setGeneratingType('explicar');
      simulateProgress(key);
      
      try {
        console.log('Chamando Gemini API para: explicar');
        
        const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
          body: {
            action: 'explicar',
            articleNumber: articleNumber,
            codeName: selectedCode?.name || '',
            hasArticle: !!articleContent
          }
        });

        if (error) {
          console.error('Erro na API Gemini:', error);
          throw new Error('Erro ao gerar explicação');
        }

        if (data?.content) {
          console.log('Explicação gerada:', data.content);
          setGeneratedModal({
            open: true,
            type: 'explicar',
            content: data.content,
            articleNumber,
            hasValidNumber: isValidArticleNumber(articleNumber, articleContent)
          });
          toast({
            title: "✅ Explicação gerada!",
            description: "A explicação foi gerada com sucesso.",
          });
        }
      } catch (error: any) {
        toast({
          title: "❌ Erro ao gerar explicação",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
        setGeneratingType(null);
        stopProgress(key);
      }
    };

    const handleExample = async () => {
      const key = exampleKey;
      setIsGenerating(true);
      setGeneratingType('exemplo');
      simulateProgress(key);
      
      try {
        const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
          body: {
            action: 'exemplo',
            articleNumber: articleNumber,
            codeName: selectedCode?.name || '',
            hasArticle: !!articleContent
          }
        });

        if (error) {
          console.error('Erro na API Gemini:', error);
          throw new Error('Erro ao gerar exemplo');
        }

        if (data?.content) {
          console.log('Exemplo gerado:', data.content);
          setGeneratedModal({
            open: true,
            type: 'exemplo',
            content: data.content,
            articleNumber,
            hasValidNumber: isValidArticleNumber(articleNumber, articleContent)
          });
          toast({
            title: "✅ Exemplo gerado!",
            description: "O exemplo prático foi gerado com sucesso.",
          });
        }
      } catch (error: any) {
        toast({
          title: "❌ Erro ao gerar exemplo",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
        setGeneratingType(null);
        stopProgress(key);
      }
    };

    // Layout diferente para cards sem número válido
    if (!hasValidNumber) {
      return (
        <div
          className="mb-3"
        >
          <Card className="bg-card/50 border-muted">
            <CardContent className="p-3">{/* Removida animação motion */}
                <div className="text-center">
                  <div 
                    className="vademecum-text text-foreground/80 text-sm leading-relaxed"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ 
                      __html: formatVademecumText(articleContent)
                    }}
                  />
                
                {/* Apenas botões de IA para cards sem número */}
                <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-muted">
                  <Button
                    onClick={handleExplain}
                    disabled={loadingState.explanation}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {loadingState.explanation ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    ) : (
                      <Brain className="h-3 w-3" />
                    )}
                    <span className="ml-1">Explicar</span>
                  </Button>
                  <Button
                    onClick={handleExample}
                    disabled={loadingState.practicalExample}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {loadingState.practicalExample ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    ) : (
                      <Lightbulb className="h-3 w-3" />
                    )}
                    <span className="ml-1">Exemplo</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Layout para cards com número válido
    return (
      <div
        key={`${article.id}-${index}`}
        className="mb-4"
      >
        <Card className="bg-card border">
          <CardContent className="p-4">{/* Removidas animações de hover que causavam piscar */}
            <div className="space-y-3">
              {/* Cabeçalho do Artigo */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-yellow-400 mb-2">
                    Art. {articleNumber}
                  </h3>
                  <div 
                    className="vademecum-text text-foreground" 
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ 
                      __html: formatVademecumText(articleContent)
                    }}
                  />
                </div>
              </div>

              {/* Ações do Artigo */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-muted">
                <Button
                  onClick={() => copyArticle(articleContent)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>

                <Button
                  onClick={() => narrateArticle(articleContent, articleNumber, selectedCode?.name || '')}
                  disabled={narrateLoading}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {narrateLoading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : isNarrating ? (
                    <Square className="h-3 w-3 mr-1" />
                  ) : (
                    <Volume2 className="h-3 w-3 mr-1" />
                  )}
                  {narrateLoading ? 'Carregando...' : isNarrating ? 'Parar' : 'Narrar'}
                </Button>
                
                <Button
                  onClick={handleExplain}
                  disabled={activeLoading[explainKey] || isGenerating}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {activeLoading[explainKey] ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1" />
                      {loadingProgress[explainKey]?.toFixed(0)}%
                    </>
                  ) : (
                    <>
                      <Brain className="h-3 w-3 mr-1" />
                      Explicar
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExample}
                  disabled={activeLoading[exampleKey] || isGenerating}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {activeLoading[exampleKey] ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1" />
                      {loadingProgress[exampleKey]?.toFixed(0)}%
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Exemplo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Tela inicial
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setCurrentFunction(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Home className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-80px)]">
          <div className="text-center mb-8 max-w-lg">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent-legal rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Scale className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-primary">Vade Mecum Digital</h1>
            <p className="text-muted-foreground mb-8">
              Acesse os principais códigos jurídicos brasileiros de forma rápida e eficiente
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl w-full">
            <Card className="cursor-pointer group bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 hover:border-primary/50" 
                  onClick={() => selectCategory('articles')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Códigos & Leis</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Acesse os principais códigos do ordenamento jurídico brasileiro
                </p>
                <div className="flex items-center justify-center text-primary/70 group-hover:text-primary transition-colors">
                  <span className="text-sm">Explore agora</span>
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer group bg-gradient-to-br from-accent-legal/20 to-accent-legal/10 border-accent-legal/30 hover:border-accent-legal/50 hover:shadow-lg transition-all duration-300" 
                  onClick={() => selectCategory('statutes')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-accent-legal/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Scroll className="h-6 w-6 text-accent-legal" />
                </div>
                <h3 className="text-xl font-bold text-accent-legal mb-3">Estatutos</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Consulte estatutos e leis especiais importantes
                </p>
                <div className="flex items-center justify-center text-accent-legal/70 group-hover:text-accent-legal transition-colors">
                  <span className="text-sm">Explore agora</span>
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Lista de códigos
  if (view === 'codes') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-lg font-bold">
            {categoryType === 'articles' ? 'Códigos & Leis' : 'Estatutos'}
          </h2>
          <div className="w-16" />
        </div>

        <div className="p-4 bg-background min-h-screen">
          {/* Grid minimalista 2x2 como na referência */}
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {currentCodes.map((code) => (
                <div
                  key={code.id}
                  onClick={() => loadArticles(code)}
                  className="cursor-pointer group"
                >
                  <div className={`rounded-lg ${code.color} p-6 min-h-[120px] flex flex-col items-center justify-center text-center hover:scale-105 transition-all duration-200`}>
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                      {code.icon}
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${code.textColor}`}>
                      {code.name}
                    </h3>
                    <p className={`text-xs ${code.textColor} opacity-80`}>
                      {code.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lista de artigos
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-lg font-bold truncate">
            {selectedCode?.name} - {selectedCode?.fullName}
          </h2>
          <div className="w-16" />
        </div>
        
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Buscar por artigo ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando artigos...</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum artigo encontrado.' : 'Nenhum artigo disponível.'}
            </p>
          </div>
        ) : (
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayedArticles.map((article, index) => (
              <motion.div
                key={`${article.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                <VadeMecumArticleCard article={article} index={index} />
              </motion.div>
            ))}
            
            {hasMore && !searchTerm && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Carregando mais artigos...</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal Centralizado para Conteúdo Gerado */}
      <Dialog open={generatedModal.open} onOpenChange={(open) => setGeneratedModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {generatedModal.type === 'explicar' ? (
                <Brain className="h-6 w-6 text-primary" />
              ) : (
                <Lightbulb className="h-6 w-6 text-warning" />
              )}
              {generatedModal.type === 'explicar' ? 'Explicação' : 'Exemplo Prático'}
              {generatedModal.hasValidNumber && ` - Art. ${generatedModal.articleNumber}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-muted/30 rounded-lg border">
              {generatedModal.content ? (
                <div className="vademecum-text">
                  <ReactMarkdown 
                    components={{
                      h1: ({...props}) => <h1 className="text-2xl font-bold mb-4 text-primary" {...props} />,
                      h2: ({...props}) => <h2 className="text-xl font-semibold mb-3 text-primary" {...props} />,
                      h3: ({...props}) => <h3 className="text-lg font-medium mb-2 text-primary" {...props} />,
                      p: ({...props}) => <p className="mb-3 last:mb-0 text-base leading-relaxed" {...props} />,
                      ul: ({...props}) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                      ol: ({...props}) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
                      li: ({...props}) => <li className="text-base leading-relaxed" {...props} />,
                      blockquote: ({...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4" {...props} />,
                      code: ({...props}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props} />,
                      strong: ({...props}) => <strong className="font-semibold text-primary" {...props} />,
                      em: ({...props}) => <em className="italic text-accent-legal" {...props} />
                    }}
                  >
                    {generatedModal.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground">Carregando conteúdo...</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  copyToClipboard(generatedModal.content);
                  toast({
                    title: "✅ Conteúdo copiado!",
                    description: "O conteúdo foi copiado para a área de transferência.",
                  });
                }}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar {generatedModal.type === 'explicar' ? 'Explicação' : 'Exemplo'}
              </Button>
              <Button 
                onClick={() => setGeneratedModal(prev => ({ ...prev, open: false }))} 
                size="sm"
              >
                Fechar
              </Button>
            </div>
            
            {/* Professora IA */}
            <div className="pt-6 border-t border-muted bg-gradient-to-r from-primary/5 to-accent-legal/5 rounded-lg p-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-3 text-primary flex items-center justify-center gap-2">
                  <Brain className="h-5 w-5" />
                  Precisa de mais esclarecimentos?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  A Professora IA está disponível para tirar todas as suas dúvidas sobre este artigo
                </p>
                <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Clique para abrir uma conversa personalizada sobre este tema
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Professora IA Modal */}
      <ProfessoraIA 
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        video={{
          title: generatedModal.articleNumber ? `Art. ${generatedModal.articleNumber}` : "Consulta Jurídica",
          area: selectedCode?.fullName || "Vade Mecum",
          assunto: generatedModal.content ? 
            (generatedModal.type === 'explicar' ? 'Explicação do Artigo' : 'Exemplo Prático') : 
            'Consulta Geral',
          conteudo: generatedModal.content || 'Consulta sobre artigos do Vade Mecum'
        }} 
      />
      
      {/* Botões Flutuantes */}
      {view === 'articles' && (
        <>
          {/* Controles de Fonte - Canto Inferior Esquerdo */}
          <div className="fixed bottom-6 left-6 flex flex-col gap-2 z-50">
            <Button
              onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
              size="sm"
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <div className="text-xs text-center text-primary font-medium bg-background/90 rounded px-2 py-1 shadow">
              {fontSize}px
            </div>
            <Button
              onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
              size="sm"
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          {/* Botão Scroll to Top - Canto Inferior Direito */}
          {showScrollTop && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                onClick={scrollToTop}
                size="sm"
                className="w-12 h-12 rounded-full bg-accent hover:bg-accent/90 shadow-lg"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Overlay com blur quando está gerando conteúdo */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {generatingType === 'explicar' ? 'Gerando explicação...' : 'Gerando exemplo...'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                A IA está processando sua solicitação
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicadores de progresso globais */}
      <div className="fixed top-20 right-4 space-y-2 z-50">
        {Object.entries(activeLoading).map(([key, active]) => 
          active ? (
            <ProgressIndicator 
              key={key}
              progress={loadingProgress[key] || 0}
              label={key.includes('explain') ? 'Gerando explicação...' : 'Gerando exemplo...'}
            />
          ) : null
        )}
      </div>

      {/* Professora IA Button - aparece por cima de tudo */}
      <div className="fixed bottom-20 right-6 z-50">
        <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      </div>

      {/* Modal Professora IA */}
      <ProfessoraIA 
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        video={{
          title: generatedModal.articleNumber ? `Art. ${generatedModal.articleNumber}` : "Consulta Jurídica",
          area: selectedCode?.fullName || "Vade Mecum",
          assunto: generatedModal.content ? 
            (generatedModal.type === 'explicar' ? 'Explicação do Artigo' : 'Exemplo Prático') : 
            'Consulta Geral',
          conteudo: generatedModal.content || 'Consulta sobre artigos do Vade Mecum'
        }} 
      />
    </div>
  );
};

export default VadeMecumUltraFast;