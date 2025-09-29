import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Search, ArrowLeft, Scale, BookOpen, 
  ChevronRight, Copy, X, Home, FileText, Scroll,
  Volume2, Lightbulb, Bookmark, Brain, Plus, Minus, ArrowUp, Square, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

// Cache em memória para performance
const articlesCache = new Map<string, VadeMecumArticle[]>();
let isPreloading = false;

const VadeMecumOptimized: React.FC = () => {
  const [view, setView] = useState<'home' | 'codes' | 'articles'>('home');
  const [categoryType, setCategoryType] = useState<'articles' | 'statutes' | null>(null);
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showProfessora, setShowProfessora] = useState(false);
  
  // Estados para narração
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrateLoading, setNarrateLoading] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  
  // Estados para indicador de progresso
  const [loadingProgress, setLoadingProgress] = useState<{ [key: string]: number }>({});
  const [activeLoading, setActiveLoading] = useState<{ [key: string]: boolean }>({});
  
  // Estado para modal de conteúdo gerado
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

  // Controle de scroll otimizado
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

  // Preload otimizado sem animations
  useEffect(() => {
    if (!isPreloading) {
      isPreloading = true;
      const preloadPopular = async () => {
        const popularCodes = [
          { table: 'CC', id: 'cc' },
          { table: 'CF88', id: 'cf88' },
          { table: 'CP', id: 'cp' },
          { table: 'CPC', id: 'cpc' }
        ];
        
        for (const { table, id } of popularCodes) {
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
              // Silent fail
            }
          }
        }
      };
      
      setTimeout(preloadPopular, 100);
    }
  }, []);

  // Códigos com layout minimalista 2x2
  const articleCodes = useMemo<VadeMecumLegalCode[]>(() => [
    { 
      id: 'cc', name: 'CC', fullName: 'Código Civil', 
      description: 'Relações civis', 
      icon: '🤝', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'cf88', name: 'CF/88', fullName: 'Constituição Federal', 
      description: 'Carta Magna', 
      icon: '🏛️', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'cp', name: 'CP', fullName: 'Código Penal', 
      description: 'Crimes e penas', 
      icon: '⚖️', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'cpc', name: 'CPC', fullName: 'Código Processo Civil', 
      description: 'Procedimentos cíveis', 
      icon: '📋', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'cpp', name: 'CPP', fullName: 'Código Processo Penal', 
      description: 'Procedimentos penais', 
      icon: '🔍', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'clt', name: 'CLT', fullName: 'Consolidação Leis Trabalho', 
      description: 'Direito trabalhista', 
      icon: '👷', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'cdc', name: 'CDC', fullName: 'Código Defesa Consumidor', 
      description: 'Proteção consumidor', 
      icon: '🛡️', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'ctn', name: 'CTN', fullName: 'Código Tributário Nacional', 
      description: 'Direito tributário', 
      icon: '💰', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    }
  ], []);

  const statuteCodes = useMemo<VadeMecumLegalCode[]>(() => [
    { 
      id: 'eca', name: 'ECA', fullName: 'Estatuto Criança Adolescente', 
      description: 'Proteção criança', 
      icon: '👶', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    },
    { 
      id: 'estatuto-idoso', name: 'Estatuto Idoso', fullName: 'Estatuto da Pessoa Idosa', 
      description: 'Direitos idosos', 
      icon: '👴', 
      color: 'bg-gradient-to-br from-card to-muted border border-border',
      textColor: 'text-foreground'
    }
  ], []);

  const currentCodes = useMemo(() => {
    return categoryType === 'statutes' ? statuteCodes : articleCodes;
  }, [categoryType, articleCodes, statuteCodes]);

  // Busca otimizada sem delays
  const filteredArticles = useMemo(() => {
    const allValidArticles = articles.filter(article => {
      const articleContent = article["Artigo"] || article.conteudo || '';
      return articleContent.trim() !== '';
    });

    if (!searchTerm.trim()) return allValidArticles;

    const searchLower = searchTerm.toLowerCase().trim();
    const searchNumbers = searchTerm.replace(/[^\d]/g, '');

    const results: { article: VadeMecumArticle; score: number }[] = [];
    
    for (const article of allValidArticles) {
      const articleNumber = article["Número do Artigo"] || article.numero || '';
      const articleContent = article["Artigo"] || article.conteudo || '';
      
      let score = 0;
      
      if (articleNumber.toLowerCase() === searchLower) {
        return [article];
      }
      else if (searchNumbers && articleNumber.replace(/[^\d]/g, '') === searchNumbers) {
        score = 900;
      }
      else if (articleNumber.toLowerCase().includes(searchLower)) {
        score = 800;
      }
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

  // Carregar artigos com cache
  const loadArticles = useCallback(async (code: VadeMecumLegalCode) => {
    const cacheKey = `articles-${code.id}`;
    
    if (articlesCache.has(cacheKey)) {
      const cachedData = articlesCache.get(cacheKey)!;
      setArticles(cachedData);
      setSelectedCode(code);
      setView('articles');
      setSearchTerm('');
      return;
    }

    setIsLoading(true);
    setSelectedCode(code);
    setView('articles');
    setSearchTerm('');
    
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
        'eca': 'ECA',
        'estatuto-idoso': 'ESTATUTO - IDOSO'
      };
      
      const tableName = tableMap[code.id];
      if (!tableName) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .select('id, "Número do Artigo", Artigo')
        .order('id', { ascending: true });

      if (error) throw error;

      const transformedArticles = (data || []).map((item: any) => ({
        id: String(item.id),
        numero: item["Número do Artigo"] || String(item.id),
        conteudo: item.Artigo || '',
        codigo_id: code.id,
        "Número do Artigo": item["Número do Artigo"],
        "Artigo": item.Artigo
      }));

      articlesCache.set(cacheKey, transformedArticles);
      setArticles(transformedArticles);
      
    } catch (error: any) {
      toast({
        title: "Erro ao carregar artigos",
        description: error.message || "Não foi possível carregar os artigos.",
        variant: "destructive"
      });
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Navegação
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

  // Função melhorada de copiar
  const copyArticle = useCallback(async (content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      toast({
        title: "Artigo copiado!",
        description: "O conteúdo foi copiado para a área de transferência.",
      });
    } else {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Funções AI com indicador de progresso
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

  const handleExplain = useCallback(async (articleNumber: string) => {
    const key = `explain-${articleNumber}`;
    simulateProgress(key);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
        body: {
          action: 'explicar',
          articleNumber: articleNumber,
          codeName: selectedCode?.name || '',
          hasArticle: true
        }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedModal({
          open: true,
          type: 'explicar',
          content: data.content,
          articleNumber,
          hasValidNumber: true
        });
        toast({
          title: "Explicação gerada!",
          description: "A explicação foi gerada com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao gerar explicação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopProgress(key);
    }
  }, [selectedCode?.name, simulateProgress, stopProgress, toast]);

  const handleExample = useCallback(async (articleNumber: string) => {
    const key = `example-${articleNumber}`;
    simulateProgress(key);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
        body: {
          action: 'exemplo',
          articleNumber: articleNumber,
          codeName: selectedCode?.name || '',
          hasArticle: true
        }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedModal({
          open: true,
          type: 'exemplo',
          content: data.content,
          articleNumber,
          hasValidNumber: true
        });
        toast({
          title: "Exemplo gerado!",
          description: "O exemplo prático foi gerado com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao gerar exemplo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopProgress(key);
    }
  }, [selectedCode?.name, simulateProgress, stopProgress, toast]);

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
            title: "Erro",
            description: "Erro ao reproduzir áudio.",
            variant: "destructive",
          });
        };

        setAudioInstance(audio);
        setIsNarrating(true);
        audio.play();
        
        toast({
          title: "Narração iniciada",
          description: "O artigo está sendo narrado.",
        });
      } else {
        throw new Error('Falha ao gerar áudio');
      }
    } catch (error: any) {
      console.error('Erro ao narrar artigo:', error);
      toast({
        title: "Erro",
        description: "Erro ao narrar artigo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setNarrateLoading(false);
    }
  }, [isNarrating, audioInstance, toast]);

  // Componente de Artigo sem animações pesadas
  const ArticleCard = ({ article, index }: { article: VadeMecumArticle; index: number }) => {
    const articleNumber = article["Número do Artigo"] || article.numero || '';
    const articleContent = article["Artigo"] || article.conteudo || '';
    
    const hasValidNumber = articleNumber && /\d/.test(articleNumber);

    if (!hasValidNumber) {
      return (
        <Card className="mb-2 bg-muted/20 border-muted/40">
          <CardContent className="p-3">
            <div className="text-center text-xs text-muted-foreground">
              {articleContent}
            </div>
          </CardContent>
        </Card>
      );
    }

    const explainKey = `explain-${articleNumber}`;
    const exampleKey = `example-${articleNumber}`;

    return (
      <Card className="mb-4">{/* Removida animação hover que causava piscar */}
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">
                Art. {articleNumber}
              </h3>
              <div 
                className="text-foreground" 
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: articleContent.replace(/\n/g, '<br>') }}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-muted">
              <Button
                onClick={() => copyArticle(articleContent)}
                variant="outline"
                size="sm"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>

              <Button
                onClick={() => narrateArticle(articleContent, articleNumber, selectedCode?.name || '')}
                disabled={narrateLoading}
                variant="outline"
                size="sm"
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
                onClick={() => handleExplain(articleNumber)}
                disabled={activeLoading[explainKey]}
                variant="outline"
                size="sm"
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
                onClick={() => handleExample(articleNumber)}
                disabled={activeLoading[exampleKey]}
                variant="outline"
                size="sm"
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
    );
  };

  // Tela inicial com layout minimalista 2x2
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
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Scale className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-primary">Vade Mecum Digital</h1>
            <p className="text-muted-foreground mb-8">
              Acesse os principais códigos jurídicos brasileiros
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-md w-full">
            <Card className="cursor-pointer group" 
                  onClick={() => selectCategory('articles')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Códigos</h3>
                <p className="text-muted-foreground text-sm">
                  Principais códigos jurídicos
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer group" 
                  onClick={() => selectCategory('statutes')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <Scroll className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Estatutos</h3>
                <p className="text-muted-foreground text-sm">
                  Leis especiais
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Tela de códigos com layout minimalista 2x2
  if (view === 'codes') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center p-4 border-b">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">
            {categoryType === 'statutes' ? 'Estatutos' : 'Códigos'}
          </h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {currentCodes.map((code) => (
              <Card 
                key={code.id}
                className={`cursor-pointer ${code.color}`}
                onClick={() => loadArticles(code)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{code.icon}</div>
                  <h3 className={`text-lg font-bold mb-1 ${code.textColor}`}>
                    {code.name}
                  </h3>
                  <p className={`text-xs ${code.textColor} opacity-80`}>
                    {code.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tela de artigos otimizada
  if (view === 'articles' && selectedCode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center p-4 border-b">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold truncate">
            {selectedCode.name} - {selectedCode.fullName}
          </h1>
        </div>

        <div className="p-4">
          <div className="mb-4 flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Buscar por artigo ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Botão scroll to top */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 rounded-full w-12 h-12 p-0"
            size="icon"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}

        {/* Professora IA Button */}
        <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
        
        {/* Modal Professora IA */}
        <ProfessoraIA 
          isOpen={showProfessora} 
          onClose={() => setShowProfessora(false)} 
        />

        {/* Modal de conteúdo gerado */}
        <Dialog open={generatedModal.open} onOpenChange={(open) => setGeneratedModal(prev => ({ ...prev, open }))}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {generatedModal.type === 'explicar' ? 'Explicação' : 'Exemplo Prático'} - Art. {generatedModal.articleNumber}
              </DialogTitle>
              <DialogDescription>
                {generatedModal.type === 'explicar' 
                  ? 'Explicação detalhada do artigo' 
                  : 'Exemplo prático de aplicação'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{generatedModal.content}</ReactMarkdown>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => copyToClipboard(generatedModal.content)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Conteúdo
                </Button>
                <Button 
                  onClick={() => setGeneratedModal(prev => ({ ...prev, open: false }))}
                  variant="default"
                  size="sm"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Indicadores de progresso fixos */}
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
      </div>
    );
  }

  return null;
};

export default VadeMecumOptimized;