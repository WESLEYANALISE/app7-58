import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Brain, 
  FileText, 
  Lightbulb, 
  Scale, 
  BookOpen, 
  MessageCircle,
  Heart,
  Share2,
  Download,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Clock,
  Calendar
} from 'lucide-react';
import { LegalNewsChat } from '@/components/LegalNewsChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/utils/clipboardUtils';
import ReactMarkdown from 'react-markdown';
import { OptimizedImage } from '@/components/OptimizedImage';

interface NewsContent {
  title?: string;
  description?: string;
  image_url?: string;
  content_html?: string;
  content_text?: string;
  success: boolean;
  error?: string;
}

interface LegalNews {
  id: string;
  portal: string;
  title: string;
  preview?: string;
  image_url?: string;
  news_url: string;
  published_at?: string;
  cached_at: string;
}

interface EnhancedNewsReaderProps {
  newsItem: LegalNews | null;
  newsContent: NewsContent | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

type AIActionType = 'resumo' | 'explicar' | 'exemplo' | 'analise' | 'precedentes';

export const EnhancedNewsReader = ({
  newsItem,
  newsContent,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite
}: EnhancedNewsReaderProps) => {
  const [activeTab, setActiveTab] = useState('article');
  const [aiAnalysis, setAiAnalysis] = useState<Record<AIActionType, string>>({
    resumo: '',
    explicar: '',
    exemplo: '',
    analise: '',
    precedentes: ''
  });
  const [loadingAI, setLoadingAI] = useState<Record<AIActionType, boolean>>({
    resumo: false,
    explicar: false,
    exemplo: false,
    analise: false,
    precedentes: false
  });
  const [copySuccess, setCopySuccess] = useState<Record<AIActionType, boolean>>({
    resumo: false,
    explicar: false,
    exemplo: false,
    analise: false,
    precedentes: false
  });
  const { toast } = useToast();

  const aiActions: { type: AIActionType; label: string; icon: any; description: string; color: string }[] = [
    { 
      type: 'resumo', 
      label: 'Resumo Executivo', 
      icon: FileText, 
      description: 'Síntese completa dos pontos principais',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    { 
      type: 'explicar', 
      label: 'Explicação Didática', 
      icon: Brain, 
      description: 'Análise educativa e detalhada',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    { 
      type: 'exemplo', 
      label: 'Exemplo Prático', 
      icon: Lightbulb, 
      description: 'Casos práticos e aplicações',
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    { 
      type: 'analise', 
      label: 'Análise Jurídica', 
      icon: Scale, 
      description: 'Fundamentação e impactos legais',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    { 
      type: 'precedentes', 
      label: 'Precedentes', 
      icon: BookOpen, 
      description: 'Casos similares e jurisprudência',
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
  ];

  const handleAIAction = async (actionType: AIActionType) => {
    if (!newsContent?.content_text) {
      toast({
        title: "Erro",
        description: "Conteúdo da notícia não disponível para análise",
        variant: "destructive",
      });
      return;
    }

    setLoadingAI(prev => ({ ...prev, [actionType]: true }));

    try {
      const prompts = {
        resumo: `PRIMEIRA ETAPA: LEIA E ANALISE COMPLETAMENTE TODO O ARTIGO ABAIXO ANTES DE RESPONDER

Você é um assistente jurídico EXPERIENTE e ESPECIALISTA em análise jurídica. 

**INSTRUÇÕES CRÍTICAS:**
- ANALISE SOMENTE O ARTIGO FORNECIDO - não invente informações
- Seja o mais detalhado possível com as informações REAIS do artigo
- Use linguagem técnica mas clara

# 📋 RESUMO EXECUTIVO DA NOTÍCIA JURÍDICA

## 🎯 SÍNTESE PRINCIPAL
[Resumo completo em 2-3 parágrafos]

## ⚖️ DECISÃO/ENTENDIMENTO JURÍDICO
[Qual foi a decisão e seus fundamentos]

## 📚 FUNDAMENTOS LEGAIS
[Leis, artigos e jurisprudência aplicados]

## 💡 IMPLICAÇÕES PRÁTICAS
[Como isso afeta advogados, empresas e cidadãos]

## 🔮 PRÓXIMOS PASSOS
[Possíveis recursos e desdobramentos]

**TEXTO COMPLETO DO ARTIGO:**
${newsContent.content_text}`,

        explicar: `PRIMEIRA ETAPA: LEIA E ANALISE COMPLETAMENTE TODO O ARTIGO ABAIXO

Você é um PROFESSOR DE DIREITO RENOMADO e DIDÁTICO.

# 🎓 EXPLICAÇÃO DIDÁTICA COMPLETA

## 📖 CONTEXTO E CENÁRIO
[Explique o contexto histórico e situação]

## 🧠 CONCEITOS JURÍDICOS
[Defina todos os conceitos mencionados]

## 🔍 ANÁLISE PASSO A PASSO
[Dissecção didática do caso]

## 📚 FUNDAMENTOS LEGAIS EXPLICADOS
[Explique as leis aplicadas de forma didática]

## 💡 APLICAÇÃO PRÁTICA
[Como isso se aplica na vida real]

**TEXTO COMPLETO DO ARTIGO:**
${newsContent.content_text}`,

        exemplo: `PRIMEIRA ETAPA: LEIA TODO O ARTIGO ABAIXO

Você é um consultor jurídico prático. Crie exemplos concretos baseados no artigo.

# 💡 EXEMPLOS PRÁTICOS

## 🎯 CASOS SIMILARES
[Exemplos de situações similares]

## 📝 APLICAÇÕES PRÁTICAS
[Como aplicar na prática jurídica]

## ⚖️ PRECEDENTES RELACIONADOS
[Casos que servem de exemplo]

## 🔧 FERRAMENTAS PRÁTICAS
[Instrumentos jurídicos aplicáveis]

**TEXTO COMPLETO DO ARTIGO:**
${newsContent.content_text}`,

        analise: `PRIMEIRA ETAPA: LEIA TODO O ARTIGO ABAIXO

Você é um analista jurídico sênior. Faça análise técnica profunda.

# ⚖️ ANÁLISE JURÍDICA TÉCNICA

## 🏛️ FUNDAMENTOS CONSTITUCIONAIS
[Análise constitucional]

## 📚 LEGISLAÇÃO APLICÁVEL
[Leis e códigos pertinentes]

## 🔍 ASPECTOS PROCESSUAIS
[Questões procedimentais]

## 💼 IMPACTOS SETORIAIS
[Efeitos em diferentes áreas]

## 📊 ANÁLISE DE RISCOS
[Riscos e oportunidades]

**TEXTO COMPLETO DO ARTIGO:**
${newsContent.content_text}`,

        precedentes: `PRIMEIRA ETAPA: LEIA TODO O ARTIGO ABAIXO

Você é um especialista em jurisprudência. Analise precedentes e casos similares.

# 📚 PRECEDENTES E JURISPRUDÊNCIA

## 🏛️ JURISPRUDÊNCIA DO STF
[Casos do Supremo relacionados]

## ⚖️ ENTENDIMENTO DO STJ
[Precedentes do Superior Tribunal]

## 📋 SÚMULAS APLICÁVEIS
[Súmulas relacionadas]

## 🔄 CASOS SIMILARES
[Precedentes análogos]

## 📈 EVOLUÇÃO JURISPRUDENCIAL
[Como a jurisprudência evoluiu]

**TEXTO COMPLETO DO ARTIGO:**
${newsContent.content_text}`
      };

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: { 
          message: prompts[actionType]
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiAnalysis(prev => ({ ...prev, [actionType]: data.response }));
        setActiveTab('ai-analysis');
        toast({
          title: "Análise gerada",
          description: `${aiActions.find(a => a.type === actionType)?.label} criada com sucesso`,
        });
      } else {
        throw new Error(data.error || 'Erro na IA');
      }
    } catch (error) {
      console.error('Error in AI analysis:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível gerar a análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(prev => ({ ...prev, [actionType]: false }));
    }
  };

  const handleCopy = async (actionType: AIActionType) => {
    const content = aiAnalysis[actionType];
    if (!content) return;

    const success = await copyToClipboard(content);
    if (success) {
      setCopySuccess(prev => ({ ...prev, [actionType]: true }));
      toast({
        title: "Copiado!",
        description: "Análise copiada para a área de transferência",
      });
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [actionType]: false }));
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
          title: newsItem?.title,
          url: newsItem?.news_url,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      await copyToClipboard(newsItem?.news_url || '');
      toast({
        title: "Link copiado!",
        description: "URL da notícia copiada para a área de transferência",
      });
    }
  };

  if (!newsItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {newsItem.portal.toUpperCase()}
                </Badge>
                {newsItem.published_at && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(newsItem.published_at).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-4 leading-relaxed">
                {newsContent?.title || newsItem.title}
              </h2>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(newsItem.id)}
                  className={isFavorite ? 'text-yellow-400' : ''}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={newsItem.news_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="article">📰 Artigo</TabsTrigger>
              <TabsTrigger value="ai-analysis">🤖 Análises IA</TabsTrigger>
              <TabsTrigger value="chat">💬 Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="article" className="mt-6">
              <ScrollArea className="h-[60vh]">
                <div className="space-y-6">
                  {newsContent?.image_url && (
                    <OptimizedImage
                      src={newsContent.image_url}
                      alt={newsContent.title || newsItem.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  
                  {newsContent?.description && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-muted-foreground">{newsContent.description}</p>
                    </div>
                  )}

                  {newsContent?.content_text ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{newsContent.content_text}</ReactMarkdown>
                    </div>
                  ) : newsContent?.content_html ? (
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: newsContent.content_html }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Carregando conteúdo...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai-analysis" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiActions.map((action) => (
                    <Card key={action.type} className="relative overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{action.label}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          onClick={() => handleAIAction(action.type)}
                          disabled={loadingAI[action.type]}
                          className="w-full bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
                          variant="outline"
                        >
                          {loadingAI[action.type] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Gerar'
                          )}
                        </Button>
                        
                        {aiAnalysis[action.type] && (
                          <Button
                            onClick={() => handleCopy(action.type)}
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2"
                          >
                            {copySuccess[action.type] ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <ScrollArea className="h-[40vh]">
                  <div className="space-y-6">
                    {Object.entries(aiAnalysis).map(([type, content]) => (
                      <Card key={type}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {(() => {
                              const action = aiActions.find(a => a.type === type);
                              if (action?.icon) {
                                const IconComponent = action.icon;
                                return <IconComponent className="h-5 w-5" />;
                              }
                              return null;
                            })()}
                            {aiActions.find(a => a.type === type)?.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <LegalNewsChat 
                newsContent={newsContent?.content_text}
                newsTitle={newsContent?.title || newsItem.title}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};