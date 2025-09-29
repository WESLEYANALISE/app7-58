import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/utils/clipboardUtils';

interface AIAnalysisState {
  analysisType: string;
  analysisLabel: string;
  analysisContent: string;
  newsTitle: string;
  newsUrl: string;
  analysisColor: string;
}

export const AIAnalysisDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState(false);
  
  const state = location.state as AIAnalysisState;

  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const cleanedContent = (state.analysisContent || "").replace(/ANALYSIS_COMPLETE:SHOW_OPTIONS/g, '').trim();

  const handleCopy = async () => {
    const success = await copyToClipboard(cleanedContent);
    if (success) {
      setCopySuccess(true);
      toast({
        title: "Copiado!",
        description: "Análise copiada para a área de transferência",
      });
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } else {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${state.analysisLabel} - ${state.newsTitle}`,
          text: cleanedContent,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  const openOriginal = () => {
    window.open(state.newsUrl, '_blank');
  };

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
              <Badge className={state.analysisColor + " mb-2"}>
                {state.analysisLabel}
              </Badge>
              <h1 className="font-semibold text-sm leading-tight line-clamp-2">
                {state.newsTitle}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground"
            >
              {copySuccess ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={openOriginal}
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
            <ReactMarkdown>{cleanedContent}</ReactMarkdown>
          </div>
        </ScrollArea>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleCopy}
          size="lg"
          className="rounded-full shadow-lg bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 backdrop-blur-sm"
        >
          {copySuccess ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <Copy className="h-5 w-5 mr-2" />
          )}
          {copySuccess ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
    </div>
  );
};