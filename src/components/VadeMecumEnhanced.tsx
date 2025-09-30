import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowLeft, Scale, BookOpen, 
  ChevronRight, Lightbulb, Loader2, Copy, X, Home,
  FileText, Scroll, Plus, Minus, ArrowUp,
  Brain, HelpCircle, Zap, Sparkles, Eye, Play, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { useVadeMecumInstant } from '@/hooks/useVadeMecumInstant';
import { useArtigoPDFExport } from '@/hooks/useArtigoPDFExport';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { ProfessoraIAEnhanced } from './ProfessoraIAEnhanced';

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
  "Número do Artigo"?: string;
  "Artigo"?: string;
}

interface GeneratedFlashcard {
  id: string;
  pergunta: string;
  resposta: string;
  dica: string;
}

interface GeneratedQuestao {
  id: string;
  questao: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  resposta_correta: string;
  explicacao: string;
}

export const VadeMecumEnhanced: React.FC = () => {
  const [fontSize, setFontSize] = useState(16);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiContent, setAIContent] = useState('');
  const [aiType, setAIType] = useState<'explicar' | 'exemplo' | 'apresentar'>('explicar');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<VadeMecumArticle | null>(null);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showQuestaoModal, setShowQuestaoModal] = useState(false);
  const [generatedFlashcard, setGeneratedFlashcard] = useState<GeneratedFlashcard | null>(null);
  const [generatedQuestao, setGeneratedQuestao] = useState<GeneratedQuestao | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showProfessora, setShowProfessora] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setCurrentFunction } = useNavigation();
  const { user } = useAuth();
  const { exporting, exportarArtigo } = useArtigoPDFExport();
  
  // Use hook otimizado para performance instantânea
  const {
    mainView,
    categoryType,
    selectedCode,
    searchTerm,
    setSearchTerm,
    articles,
    loading,
    loadingCodeId,
    currentCodes,
    handleBack,
    handleCategorySelection,
    handleCodeClick
  } = useVadeMecumInstant();


  // Artigos já filtrados pelo hook otimizado
  const filteredArticles = articles;

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Handle navigation
  const handleBackToApp = useCallback(() => {
    setCurrentFunction(null);
  }, [setCurrentFunction]);

  // Handle AI actions
  const handleAIAction = useCallback(async (action: 'explicar' | 'exemplo' | 'apresentar', article: VadeMecumArticle) => {
    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
        body: {
          action,
          article: article.Artigo || article.conteudo,
          articleNumber: article["Número do Artigo"] || article.numero,
          codeName: selectedCode?.name || 'Código Legal'
        }
      });

      if (error) throw error;
      
      if (data?.content) {
        setAIContent(data.content);
        setAIType(action);
        setCurrentArticle(article);
        setShowAIResponse(true);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo com IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(false);
    }
  }, [selectedCode, toast]);

  // Generate flashcard
  const generateFlashcard = useCallback(async (article: VadeMecumArticle) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar flashcards.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-vade-mecum-content', {
        body: {
          articleContent: article.Artigo || article.conteudo,
          articleNumber: article["Número do Artigo"] || article.numero,
          codeName: selectedCode?.name || 'Código Legal',
          userId: user.id,
          type: 'flashcard'
        }
      });

      if (error) throw error;
      
      if (data?.flashcard) {
        setGeneratedFlashcard(data.flashcard);
        setShowFlashcardModal(true);
        setIsFlipped(false);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar flashcard. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(false);
    }
  }, [selectedCode, user, toast]);

  // Generate questão
  const generateQuestao = useCallback(async (article: VadeMecumArticle) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar questões.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-vade-mecum-content', {
        body: {
          articleContent: article.Artigo || article.conteudo,
          articleNumber: article["Número do Artigo"] || article.numero,
          codeName: selectedCode?.name || 'Código Legal',
          userId: user.id,
          type: 'questao'
        }
      });

      if (error) throw error;
      
      if (data?.questao) {
        setGeneratedQuestao(data.questao);
        setShowQuestaoModal(true);
        setSelectedAnswer('');
        setShowExplanation(false);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar questão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(false);
    }
  }, [selectedCode, user, toast]);

  // Utility functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive"
      });
    }
  };

  // Format article text
  const formatArticleText = (text: string) => {
    if (!text) return '';
    
    let formattedText = text
      .replace(/\n\s*\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/Parágrafo único\./gi, '<strong>Parágrafo único.</strong>')
      .replace(/§ (\d+)/g, '<strong>§ $1</strong>')
      .replace(/(\w+)\:/g, '<strong>$1:</strong>')
      .replace(/I -/g, '<strong>I -</strong>')
      .replace(/II -/g, '<strong>II -</strong>')
      .replace(/III -/g, '<strong>III -</strong>')
      .replace(/IV -/g, '<strong>IV -</strong>')
      .replace(/V -/g, '<strong>V -</strong>');

    return `<p class="mb-4">${formattedText}</p>`;
  };

  // Article Card Component
  const ArticleCard = ({ article, index }: { article: VadeMecumArticle; index: number }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAIActionWrapper = async (action: 'explicar' | 'exemplo' | 'apresentar') => {
      setIsLoading(true);
      await handleAIAction(action, article);
      setIsLoading(false);
    };

    if (!(article?.Artigo || article?.conteudo) || !article["Número do Artigo"]) {
      return null;
    }

    return (
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="glass-effect-modern shadow-lg border border-border/50">{/* Removida animação que causava piscar */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 text-sm font-medium">
                {selectedCode?.name} - Art. {article["Número do Artigo"]}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => adjustFontSize(-2)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground px-1 py-1 min-w-[35px] text-center">{fontSize}px</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => adjustFontSize(2)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="bg-card/80 rounded-lg p-4 border border-border/30">
              <div 
                className="leading-relaxed text-foreground/90"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ 
                  __html: formatArticleText(article.Artigo || article.conteudo)
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAIActionWrapper('explicar')}
                disabled={isLoading || generatingAI}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 h-8 text-xs"
              >
                {(isLoading || generatingAI) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Explicar
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => handleAIActionWrapper('exemplo')}
                disabled={isLoading || generatingAI}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 h-8 text-xs"
              >
                {(isLoading || generatingAI) ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                    Exemplo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Tela inicial melhorada com design do app
  if (mainView === 'selection') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="glass-effect-modern border-b border-border/30">
          <div className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToApp}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="text-muted-foreground">
              <Home className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-60px)]">
          {/* Hero Section compacto */}
          <motion.div 
            className="text-center mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto gradient-legal rounded-2xl flex items-center justify-center shadow-lg">
                <Scale className="h-8 w-8 text-background" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Vade Mecum Digital
            </h1>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              Acesse os principais códigos jurídicos brasileiros com recursos avançados de IA para
              <span className="text-primary font-semibold"> explicações, flashcards e questões</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Explicações da Professora IA
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-500" />
                Flashcards Inteligentes
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                Questões Geradas por IA
              </div>
            </div>
          </motion.div>

          {/* Category Cards compactos */}
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer gradient-elegant-red hover:shadow-lg transition-all duration-300 h-full"
                onClick={() => handleCategorySelection('articles')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Códigos & Leis</h3>
                  <p className="text-white/80 mb-4 text-sm leading-relaxed">
                    Acesse os principais códigos do ordenamento jurídico brasileiro
                  </p>
                  <div className="flex items-center justify-center text-white/70">
                    <span className="text-sm">Explore agora</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-400/50 hover:from-orange-500/30 hover:to-orange-600/40 transition-all duration-300 h-full backdrop-blur-sm"
                onClick={() => handleCategorySelection('statutes')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-orange-500/30 rounded-xl flex items-center justify-center mb-4">
                    <Scroll className="h-6 w-6 text-orange-200" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-100 mb-3">Estatutos</h3>
                  <p className="text-orange-200/80 mb-4 text-sm leading-relaxed">
                    Consulte estatutos e leis especiais importantes
                  </p>
                  <div className="flex items-center justify-center text-orange-200/60">
                    <span className="text-sm">Explore agora</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de categorias compacta
  if (mainView === 'categories') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="glass-effect-modern border-b border-border/30">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h2 className="text-lg font-bold text-foreground">
              {categoryType === 'articles' ? 'Códigos & Leis' : 'Estatutos'}
            </h2>
            <div className="w-16" />
          </div>
        </div>

        <div className="p-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {currentCodes.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCodeClick(code)}
                className="cursor-pointer group"
              >
                <div className={`relative overflow-hidden rounded-xl ${code.color} shadow-md p-4 h-18`}>{/* Removida animação hover */}
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-40" />
                  
                  <div className="relative z-10 h-full flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{code.icon}</div>
                      <div>
                        <h3 className={`font-bold text-lg ${code.textColor || 'text-white'}`}>
                          {code.name}
                        </h3>
                        <p className={`text-sm ${code.textColor || 'text-white/80'}`}>
                          {code.fullName}
                        </p>
                        <p className={`text-xs hidden sm:block ${code.textColor || 'text-white/60'}`}>
                          {code.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {loadingCodeId === code.id ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className={`h-4 w-4 animate-spin ${code.textColor || 'text-white'}`} />
                          <span className={`text-sm font-medium ${code.textColor || 'text-white'}`}>
                            Carregando...
                          </span>
                        </div>
                      ) : (
                        <ChevronRight className={`h-5 w-5 ${code.textColor || 'text-white'}`} />
                      )}
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  {/* Shimmer effect removido para evitar piscar */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tela de artigos compacta
  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <div className="sticky top-0 z-40 glass-effect-modern border-b border-border/30">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h2 className="text-base font-bold text-foreground">{selectedCode?.fullName}</h2>
              <p className="text-xs text-muted-foreground">{selectedCode?.description}</p>
            </div>
          </div>
        </div>

        {/* Barra de pesquisa */}
        <div className="px-3 pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Digite o número exato do artigo (ex: 5, 121, 1º)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary h-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
        <div className="p-3">
        <div className="max-w-4xl mx-auto">
           {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground text-sm">Carregando artigos...</span>
            </div>
          ) : filteredArticles.length > 0 ? (
            <>
              <div className="mb-4 text-center">
                <p className="text-muted-foreground text-sm">
                  {filteredArticles.length} artigo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="space-y-4">
                {filteredArticles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm ? 'Tente alterar os termos de busca' : 'Nenhum artigo disponível'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botões flutuantes - Scroll to top e Professora IA */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-24 z-40"
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-14 h-14 p-0 shadow-lg"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professora IA Floating Button - alinhado com scroll top */}
      <div className="fixed bottom-6 right-6 z-40">
        <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      </div>
      
      {/* Professora IA Chat */}
      <ProfessoraIAEnhanced
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        area={selectedCode?.fullName}
        initialMessage={aiContent ? `Olá! Vi que você gerou uma ${aiType === 'explicar' ? 'explicação' : 'exemplo prático'} sobre este artigo:\n\n${aiContent}\n\nEm qual ponto você ficou com dúvida?` : undefined}
      />

      {/* Modal de explicação IA */}
      <Dialog open={showAIResponse} onOpenChange={setShowAIResponse}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Professora IA - {aiType === 'explicar' ? 'Explicação' : 'Exemplo Prático'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIResponse(false)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>
                  {aiContent}
                </ReactMarkdown>
              </div>
            </div>
            
            {/* Card da Professora IA */}
            <div className="mt-6 bg-gradient-to-br from-red-900/90 to-red-800/90 rounded-xl p-6 border border-red-700/50">
              <div className="flex items-start gap-4">
                <div className="bg-red-800/50 rounded-full p-3">
                  <Lightbulb className="h-6 w-6 text-red-100" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-50 mb-2">
                    Precisa de mais esclarecimentos?
                  </h3>
                  <p className="text-red-100/90 text-sm mb-4">
                    A Professora IA está disponível para tirar todas as suas dúvidas sobre este artigo
                  </p>
                  <Button
                    onClick={() => {
                      setShowProfessora(true);
                      setShowAIResponse(false);
                    }}
                    className="bg-red-800 hover:bg-red-700 text-white border-0 w-full"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Clique para abrir uma conversa personalizada sobre este tema
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Flashcard */}
      <Dialog open={showFlashcardModal} onOpenChange={setShowFlashcardModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-400" />
              Flashcard Gerado
            </DialogTitle>
          </DialogHeader>
          
          {generatedFlashcard && (
            <div className="space-y-4">
              {/* Flashcard com flip animation */}
              <div className="relative w-full h-64" style={{ perspective: "1000px" }}>
                <motion.div
                  className="relative w-full h-full cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Frente */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/30 border border-green-400/50 rounded-xl p-6 flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="text-lg font-semibold text-green-100 mb-4">Pergunta:</h3>
                    <p className="text-white leading-relaxed">{generatedFlashcard.pergunta}</p>
                    <div className="mt-4 text-sm text-green-200/80">
                      Clique para ver a resposta
                    </div>
                  </div>
                  
                  {/* Verso */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-400/50 rounded-xl p-6 flex flex-col justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="text-lg font-semibold text-blue-100 mb-4">Resposta:</h3>
                    <p className="text-white leading-relaxed mb-4">{generatedFlashcard.resposta}</p>
                    {generatedFlashcard.dica && (
                      <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg">
                        <p className="text-yellow-200 text-sm">
                          💡 <strong>Dica:</strong> {generatedFlashcard.dica}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => setIsFlipped(!isFlipped)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Virar Card
                </Button>
                <Button 
                  onClick={() => copyToClipboard(`Pergunta: ${generatedFlashcard.pergunta}\n\nResposta: ${generatedFlashcard.resposta}${generatedFlashcard.dica ? `\n\nDica: ${generatedFlashcard.dica}` : ''}`)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Questão */}
      <Dialog open={showQuestaoModal} onOpenChange={setShowQuestaoModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-400" />
              Questão Gerada
            </DialogTitle>
          </DialogHeader>
          
          {generatedQuestao && (
            <div className="space-y-6">
              {/* Questão */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-white font-medium leading-relaxed">{generatedQuestao.questao}</p>
              </div>

              {/* Alternativas */}
              <div className="space-y-3">
                {[
                  { key: 'A', text: generatedQuestao.alternativa_a },
                  { key: 'B', text: generatedQuestao.alternativa_b },
                  { key: 'C', text: generatedQuestao.alternativa_c },
                  { key: 'D', text: generatedQuestao.alternativa_d }
                ].map((alt) => (
                  <button
                    key={alt.key}
                    onClick={() => {
                      setSelectedAnswer(alt.key);
                      setShowExplanation(true);
                    }}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      showExplanation
                        ? alt.key === generatedQuestao.resposta_correta
                          ? 'bg-green-500/20 border-green-400/50 text-green-100'
                          : alt.key === selectedAnswer
                          ? 'bg-red-500/20 border-red-400/50 text-red-100'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300'
                        : selectedAnswer === alt.key
                        ? 'bg-blue-500/20 border-blue-400/50 text-blue-100'
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="font-bold mr-3">{alt.key})</span>
                    {alt.text}
                  </button>
                ))}
              </div>

              {/* Explicação */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    {selectedAnswer === generatedQuestao.resposta_correta ? (
                      <div className="text-green-400 font-semibold">✅ Correto!</div>
                    ) : (
                      <div className="text-red-400 font-semibold">❌ Incorreto! A resposta correta é: {generatedQuestao.resposta_correta}</div>
                    )}
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-100 mb-2">Explicação:</h4>
                    <p className="text-blue-200 leading-relaxed">{generatedQuestao.explicacao}</p>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between">
                <Button 
                  onClick={() => {
                    setSelectedAnswer('');
                    setShowExplanation(false);
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={() => copyToClipboard(`${generatedQuestao.questao}\n\nA) ${generatedQuestao.alternativa_a}\nB) ${generatedQuestao.alternativa_b}\nC) ${generatedQuestao.alternativa_c}\nD) ${generatedQuestao.alternativa_d}\n\nResposta: ${generatedQuestao.resposta_correta}\n\nExplicação: ${generatedQuestao.explicacao}`)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Professora IA Floating Button */}
      <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      
      {/* Professora IA Chat */}
      <ProfessoraIAEnhanced
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        area={selectedCode?.fullName}
      />
    </div>
  );
};