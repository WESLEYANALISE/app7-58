import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, Share2, Bookmark, Volume2, QrCode, Scale, BookOpen, Presentation, FileText, Lightbulb, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VadeMecumSlideShow } from './VadeMecumSlideShow';
import QRCode from 'qrcode';
import { VadeMecumLegalCode } from './VadeMecum';
import { VadeMecumFlashcardsSession } from './VadeMecumFlashcardsSession';
import { useAuth } from '@/context/AuthContext';

interface VadeMecumArticleProps {
  article: any;
  codeInfo: VadeMecumLegalCode | null;
}

export const VadeMecumArticle = ({ article, codeInfo }: VadeMecumArticleProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [practicalExample, setPracticalExample] = useState('');
  const [slideShow, setSlideShow] = useState<any[]>([]);
  const [showSlideShow, setShowSlideShow] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);
  const [showFlashcardsSession, setShowFlashcardsSession] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const articleText = article.Artigo || '';
  const articleNumber = article["Número do Artigo"] || article.numero || '';

  const copyToClipboard = async () => {
    try {
      const textToCopy = `${codeInfo?.name} - Art. ${articleNumber}\n\n${articleText}`;
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copiado!",
        description: "Artigo copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o artigo",
        variant: "destructive"
      });
    }
  };

  const shareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${codeInfo?.name} - Art. ${articleNumber}`,
          text: articleText.substring(0, 200) + '...',
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };

  const callGeminiAPI = async (action: 'explicar' | 'exemplo' | 'apresentar') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
        body: {
          action,
          article: articleText,
          articleNumber,
          codeName: codeInfo?.name || 'Código Legal'
        }
      });

      if (error) throw error;

      if (action === 'explicar') {
        setExplanation(data.response);
        setShowExplanation(true);
      } else if (action === 'exemplo') {
        setPracticalExample(data.response);
        setShowExample(true);
      } else if (action === 'apresentar') {
        const slides = parseSlides(data.response);
        setSlideShow(slides);
        setShowSlideShow(true);
      }

      toast({
        title: "Sucesso!",
        description: `${action === 'explicar' ? 'Explicação' : action === 'exemplo' ? 'Exemplo prático' : 'Apresentação'} gerada com IA`,
      });
    } catch (error) {
      console.error('Erro ao chamar Gemini API:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o conteúdo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseSlides = (response: string) => {
    const slides = response.split('--- SLIDE').filter(slide => slide.trim());
    return slides.map((slide, index) => {
      const lines = slide.trim().split('\n');
      const title = lines[0]?.replace(/^\d+\s*---/, '').replace(/^-/, '').trim() || `Slide ${index + 1}`;
      const content = lines.slice(1).join('\n').trim();
      return { title, content };
    });
  };

  const generateQRCode = async () => {
    try {
      const url = window.location.href;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>QR Code - ${codeInfo?.name} Art. ${articleNumber}</title></head>
            <body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f0f0;">
              <div style="text-align: center; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2>${codeInfo?.name} - Art. ${articleNumber}</h2>
                <img src="${qrDataUrl}" alt="QR Code" />
                <p>Escaneie para acessar o artigo</p>
              </div>
            </body>
          </html>
        `);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `Art. ${articleNumber} ${isFavorited ? 'removido dos' : 'adicionado aos'} favoritos`,
    });
  };

  const generateFlashcards = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar flashcards.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-vade-mecum-content', {
        body: {
          articleContent: articleText,
          articleNumber,
          codeName: codeInfo?.name || 'Código Legal',
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
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Artigo ${articleNumber}. ${articleText}`);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Reproduzindo áudio",
        description: "Artigo sendo lido em voz alta",
      });
    } else {
      toast({
        title: "Recurso não disponível",
        description: "Seu navegador não suporta síntese de voz",
        variant: "destructive"
      });
    }
  };

  // Highlight search term in text
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">
          {part}
        </mark> : 
        part
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Search within article */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar no artigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border"
            />
          </div>
        </div>

        {/* Main Action Buttons */}
        <Card className="mb-4 bg-background/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Button
                onClick={() => callGeminiAPI('explicar')}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Explicar
              </Button>
              <Button
                onClick={() => callGeminiAPI('exemplo')}
                disabled={isLoading}
                variant="outline"
                className="border-muted"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Exemplo
              </Button>
              <Button
                onClick={() => callGeminiAPI('apresentar')}
                disabled={isLoading}
                variant="outline"
                className="border-muted"
              >
                <Presentation className="h-4 w-4 mr-2" />
                Apresentar
              </Button>
              <Button
                onClick={generateFlashcards}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                Flashcards
              </Button>
            </div>

            {/* Secondary Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={playAudio}
                className="text-muted-foreground hover:text-foreground"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Ouvir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={shareArticle}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            {/* Tertiary Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={generateQRCode}
                className="text-muted-foreground hover:text-foreground"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast({ title: "Em desenvolvimento", description: "Jurisprudência em breve" })}
                className="text-muted-foreground hover:text-foreground"
              >
                <Scale className="h-4 w-4 mr-2" />
                Jurisprudência
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card className="mb-4 bg-background/30 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="outline" className="mb-2 border-primary/30">
                  {codeInfo?.name}
                </Badge>
                <h1 className="text-2xl font-bold text-yellow-400">
                  Art. {articleNumber}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={`${isFavorited ? 'text-yellow-400' : 'text-muted-foreground'} hover:text-yellow-400`}
              >
                <Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {highlightText(articleText, searchTerm)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Explanation Content */}
        {showExplanation && explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Explicação</h3>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Example Content */}
        {showExample && practicalExample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Exemplo Prático</h3>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: practicalExample.replace(/\n/g, '<br />') }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-6 text-xs text-muted-foreground text-center">
          <p>{codeInfo?.description}</p>
        </div>
      </motion.div>

      {/* Slide Show Modal */}
      <VadeMecumSlideShow
        isOpen={showSlideShow}
        onClose={() => setShowSlideShow(false)}
        slides={slideShow}
        articleNumber={articleNumber}
        codeName={codeInfo?.name || 'Código Legal'}
      />

      {/* Flashcards Session */}
      {showFlashcardsSession && generatedFlashcards.length > 0 && (
        <VadeMecumFlashcardsSession
          flashcards={generatedFlashcards}
          articleNumber={articleNumber}
          codeName={codeInfo?.name || 'Código Legal'}
          onClose={() => {
            setShowFlashcardsSession(false);
            setGeneratedFlashcards([]);
          }}
        />
      )}
    </>
  );
};