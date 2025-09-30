import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, Volume2, Share2, Heart, 
  Lightbulb, BookOpen, Presentation,
  Play, Pause, Loader2, X, Square, Brain
} from 'lucide-react';
import { VadeMecumSlideShow } from './VadeMecumSlideShow';
import { VadeMecumFlashcardsSession } from './VadeMecumFlashcardsSession';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useDebounce } from 'use-debounce';
import { ErrorBoundary } from 'react-error-boundary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface VadeMecumArticleProps {
  article: {
    id: string;
    numero: string;
    conteudo: string;
    codigo_id: string;
    naracao_url?: string | null;
  };
  codeInfo: {
    name: string;
    fullName: string;
    color: string;
  };
}

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="p-6">
      <div className="flex items-center gap-2 text-destructive">
        <X className="h-4 w-4" />
        <span className="font-medium">Erro ao carregar o artigo</span>
      </div>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm" className="mt-2">
        Tentar novamente
      </Button>
    </CardContent>
  </Card>
);

export const VadeMecumArticleOptimized: React.FC<VadeMecumArticleProps> = ({ article, codeInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching] = useDebounce(searchTerm, 200);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrateLoading, setNarrateLoading] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);
  const [showFlashcardsSession, setShowFlashcardsSession] = useState(false);
  
  const { loading, responses, callGeminiAPI, clearResponse } = useGeminiAI();
  const { toast } = useToast();
  const { user } = useAuth();

  // Animation springs
  const fadeSpring = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 300, friction: 30 }
  });

  const buttonSpring = useSpring({
    scale: 1,
    from: { scale: 0.95 },
    config: { tension: 400, friction: 25 }
  });

  // Memoized highlighted content
  const highlightedContent = useMemo(() => {
    if (!searchTerm.trim()) return article.conteudo;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return article.conteudo.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
  }, [article.conteudo, searchTerm]);

  const handleAIAction = useCallback(async (action: 'explicar' | 'exemplo' | 'apresentar') => {
    const response = await callGeminiAPI(action, article.conteudo, article.numero, codeInfo.name);
    
    if (action === 'apresentar' && response?.slides?.length) {
      setShowSlideshow(true);
    }
  }, [callGeminiAPI, article, codeInfo.name]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${codeInfo.fullName} - Art. ${article.numero}`,
      text: article.conteudo.substring(0, 200) + '...',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n${shareData.url}`);
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n${shareData.url}`);
    }
  }, [article, codeInfo]);

  const handleAudio = useCallback(() => {
    if (isAudioPlaying) {
      speechSynthesis.cancel();
      setIsAudioPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.conteudo);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.onend = () => setIsAudioPlaying(false);
      speechSynthesis.speak(utterance);
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying, article.conteudo]);

  const narrateArticle = useCallback(async () => {
    // Check if audio URL is not available
    if (!article.naracao_url) {
      toast({
        title: "Em breve",
        description: "A narração deste artigo estará disponível em breve.",
      });
      return;
    }

    if (isNarrating && audioInstance) {
      // Parar narração
      audioInstance.pause();
      setIsNarrating(false);
      setAudioInstance(null);
      return;
    }

    setNarrateLoading(true);
    
    try {
      // Use the audio URL directly from the database
      const audio = new Audio(article.naracao_url);
      
      audio.onended = () => {
        setIsNarrating(false);
        setAudioInstance(null);
      };
      
      audio.onerror = () => {
        setIsNarrating(false);
        setAudioInstance(null);
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
    } catch (error: any) {
      console.error('Erro ao narrar artigo:', error);
      toast({
        title: "Erro",
        description: "Erro ao reproduzir áudio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setNarrateLoading(false);
    }
  }, [isNarrating, audioInstance, article, toast]);

  const generateFlashcards = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar flashcards.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-vade-mecum-content', {
        body: {
          articleContent: article.conteudo,
          articleNumber: article.numero,
          codeName: codeInfo.name,
          userId: user.id,
          type: 'flashcard'
        }
      });

      if (error) throw error;
      
      if (data?.flashcards) {
        setGeneratedFlashcards(data.flashcards);
        setShowFlashcardsSession(true);
        toast({
          title: "Sucesso!",
          description: `${data.flashcards.length} flashcards gerados com IA`,
        });
      }
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar os flashcards. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [user, article, codeInfo.name, toast]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <animated.div style={fadeSpring} className="space-y-6">
        {/* Search Section */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar no artigo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/80 backdrop-blur-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-background to-background/95">
            <div className={`h-2 bg-gradient-to-r ${codeInfo.color}`} />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    {codeInfo.fullName}
                  </Badge>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    Artigo {article.numero}
                  </CardTitle>
                </div>
                
                {/* Basic Actions */}
                <animated.div style={buttonSpring} className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAudio}
                    className="h-9 w-9"
                  >
                    {isAudioPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-9 w-9"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className={`h-9 w-9 ${isFavorite ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </animated.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div 
                className="text-base leading-relaxed text-foreground whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-6" />

        {/* AI Tools Section - Moved to Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Ferramentas de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main AI Functions - First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Button
                  onClick={() => handleAIAction('explicar')}
                  disabled={loading[`explicar-${article.numero}`]}
                  className="h-12 justify-start gap-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold"
                >
                  {loading[`explicar-${article.numero}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                  Explicar
                </Button>

                <Button
                  onClick={() => handleAIAction('exemplo')}
                  disabled={loading[`exemplo-${article.numero}`]}
                  className="h-12 justify-start gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
                >
                  {loading[`exemplo-${article.numero}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lightbulb className="h-4 w-4" />
                  )}
                  Exemplo
                </Button>

                <Button
                  onClick={generateFlashcards}
                  disabled={loading[`flashcards-${article.numero}`]}
                  className="h-12 justify-start gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                >
                  {loading[`flashcards-${article.numero}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                  Flashcards
                </Button>
              </div>

              {/* Presentation Function - Second Row */}
              <div className="flex justify-center mb-4">
                <Button
                  onClick={() => handleAIAction('apresentar')}
                  disabled={loading[`apresentar-${article.numero}`]}
                  className="h-12 w-full max-w-md justify-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
                >
                  {loading[`apresentar-${article.numero}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Presentation className="h-4 w-4" />
                  )}
                  Apresentar
                </Button>
              </div>

              {/* Basic Functions - Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={handleAudio}
                  className="h-10 justify-center gap-3 bg-background/50 hover:bg-background/80 border-border/50"
                >
                  {isAudioPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  Ouvir
                </Button>

                <Button
                  variant="outline"
                  onClick={narrateArticle}
                  disabled={narrateLoading || !article.naracao_url}
                  className={`h-10 justify-center gap-3 ${
                    !article.naracao_url 
                      ? 'bg-muted/30 cursor-not-allowed opacity-50' 
                      : 'bg-background/50 hover:bg-background/80'
                  } border-border/50`}
                >
                  {narrateLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isNarrating ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {narrateLoading ? 'Carregando...' : isNarrating ? 'Parar' : 'Narrar'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-10 justify-center gap-3 bg-background/50 hover:bg-background/80 border-border/50"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </div>

              {/* AI Responses */}
              <AnimatePresence>
                {responses.explicar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base text-blue-700 dark:text-blue-300">
                            💡 Explicação
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearResponse('explicar')}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {responses.explicar.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {responses.exemplo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base text-green-700 dark:text-green-300">
                            🎯 Exemplo Prático
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearResponse('exemplo')}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {responses.exemplo.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Slideshow Modal */}
        <AnimatePresence>
          {showSlideshow && responses.apresentar?.slides && (
                  <VadeMecumSlideShow
                    slides={responses.apresentar.slides}
                    articleTitle={`${codeInfo.name} - Art. ${article.numero}`}
                    onClose={() => setShowSlideshow(false)}
                  />
          )}
        </AnimatePresence>

        {/* Flashcards Session */}
        {showFlashcardsSession && generatedFlashcards.length > 0 && (
          <VadeMecumFlashcardsSession
            flashcards={generatedFlashcards}
            articleNumber={article.numero}
            codeName={codeInfo.name}
            onClose={() => {
              setShowFlashcardsSession(false);
              setGeneratedFlashcards([]);
            }}
          />
        )}
      </animated.div>
    </ErrorBoundary>
  );
};