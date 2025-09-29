import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, ExternalLink, BookOpen, Share2, X, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { ProfessoraIAEnhanced } from './ProfessoraIAEnhanced';

interface BookData {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  beneficios?: string;
  profissao?: string;
  logo?: string;
}

export const BookDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showProfessora, setShowProfessora] = useState(false);
  
  const book = location.state?.book as BookData;

  if (!book) {
    navigate('/');
    return null;
  }

  const handleDownloadClick = () => {
    if (book.download) {
      window.open(book.download, '_blank');
      toast({
        title: "Download iniciado",
        description: "O download do livro foi iniciado",
      });
    }
  };

  const handleLinkClick = () => {
    if (book.link) {
      // Navigate to reading page instead of modal
      navigate('/book/read', { 
        state: { 
          book: book,
          url: book.link 
        } 
      });
    }
  };

  const handleExplainClick = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-book', {
        body: {
          bookTitle: book.livro,
          author: book.autor,
          area: book.area,
          description: book.sobre,
          benefits: book.beneficios
        }
      });

      if (error) throw error;

      setAnalysisResult(data.analysis);
      toast({
        title: "Análise concluída!",
        description: "A inteligência artificial analisou o livro detalhadamente.",
      });
    } catch (error) {
      console.error('Error analyzing book:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o livro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.livro,
          text: book.sobre || `Confira este livro: ${book.livro}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "Link do livro copiado para a área de transferência",
      });
    }
  };

  const isClassic = book.area?.includes('Civil') || book.area?.includes('Constitucional') || book.area?.includes('Penal') || true;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm leading-tight line-clamp-1">
                {book.livro}
              </h1>
              {book.autor && (
                <p className="text-xs text-muted-foreground">
                  por {book.autor}
                </p>
              )}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            {/* Book Cover */}
            <div className="w-64 h-80 mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl border border-border/50">
              {book.imagem ? (
                <img 
                  src={book.imagem} 
                  alt={book.livro} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/60" />
                </div>
              )}
            </div>

            {/* Book Title and Author */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {book.livro}
              </h1>
              {book.autor && (
                <p className="text-xl text-muted-foreground font-medium">
                  por {book.autor}
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {isClassic && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  📚 Clássico
                </Badge>
              )}
              <Badge variant="outline" className="border-primary/30 text-primary">
                {book.area}
              </Badge>
            </div>

          </div>

          {/* Action Buttons - Moved before content sections */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mb-12">
            {book.link && (
              <Button
                onClick={handleLinkClick}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Ler agora
              </Button>
            )}
            {book.download && (
              <Button
                onClick={handleDownloadClick}
                variant="outline"
                size="lg"
                className="border-2 border-border hover:bg-muted/50 py-3 px-6 rounded-full font-semibold transition-all duration-300"
              >
                <Download className="h-5 w-5 mr-2" />
                Download
              </Button>
            )}
            <Button
              onClick={handleExplainClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isAnalyzing}
            >
              <Bot className="h-5 w-5 mr-2" />
              {isAnalyzing ? "Analisando..." : "Explicar"}
            </Button>
            {!book.link && !book.download && (
              <Button 
                variant="outline" 
                size="lg" 
                disabled 
                className="opacity-50 py-3 px-6 rounded-full"
              >
                Em breve
              </Button>
            )}
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* AI Analysis Result */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border-t border-border/30 pt-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  🤖 Análise Detalhada pela IA
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground bg-muted/30 p-6 rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: analysisResult }} />
                </div>
              </motion.div>
            )}

            {/* About the Book */}
            {book.sobre && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-t border-border/30 pt-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  📖 Sobre o livro
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  <p className="text-lg leading-relaxed">{book.sobre}</p>
                </div>
              </motion.div>
            )}

            {/* Benefits */}
            {book.beneficios && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border-t border-border/30 pt-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  ✨ Benefícios
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  <p className="text-lg leading-relaxed">{book.beneficios}</p>
                </div>
              </motion.div>
            )}

            {/* Recommended Professions */}
            {book.profissao && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-t border-border/30 pt-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  👥 Profissões recomendadas
                </h2>
                <div className="flex flex-wrap gap-3">
                  {book.profissao.split(',').map((profession, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-4 py-2 text-sm border-primary/30 text-primary"
                    >
                      {profession.trim()}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Floating Professor Button */}
      <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      
      {/* Professor AI Chat */}
      <ProfessoraIAEnhanced
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        bookContext={{
          titulo: book.livro,
          autor: book.autor,
          area: book.area,
          sobre: book.sobre
        }}
      />
    </div>
  );
};