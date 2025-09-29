import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Brain, FileText, Lightbulb, Scale, BookOpen, Copy, Check, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/utils/clipboardUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';

interface EnhancedWebViewProps {
  url: string;
  title: string;
  onClose: () => void;
}

type AIActionType = 'resumo' | 'explicar' | 'exemplo' | 'analise' | 'precedentes';

export const EnhancedWebView = ({ url, title, onClose }: EnhancedWebViewProps) => {
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);
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
  const [newsContent, setNewsContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
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

  useEffect(() => {
    if (showAiModal && !newsContent) {
      fetchNewsContent();
    }
  }, [showAiModal, url]);

  const fetchNewsContent = async () => {
    setLoadingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke('news-content-proxy', {
        body: { url }
      });

      if (error) throw error;

      if (data.success) {
        setNewsContent(data.content_text || data.content || '');
      } else {
        throw new Error(data.error || 'Erro ao carregar conteúdo');
      }
    } catch (error) {
      console.error('Error loading news content:', error);
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Não foi possível carregar o artigo para análise",
        variant: "destructive",
      });
    } finally {
      setLoadingContent(false);
    }
  };

  const handleAIAction = async (actionType: AIActionType) => {
    if (!newsContent) {
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
        resumo: `Analise COMPLETAMENTE o artigo jurídico abaixo e crie um RESUMO EXECUTIVO DETALHADO.

INSTRUÇÕES:
- Leia TODO o conteúdo do artigo
- Faça uma análise completa e profunda
- Formate sua resposta em MARKDOWN
- Seja específico e detalhado
- NÃO seja genérico, analise o caso específico

# 📋 RESUMO EXECUTIVO DA NOTÍCIA JURÍDICA

## 🎯 SÍNTESE DO CASO
[Descreva detalhadamente o caso específico apresentado no artigo]

## ⚖️ DECISÃO JUDICIAL
[Explique qual foi a decisão específica do tribunal/juiz e seus fundamentos]

## 📚 FUNDAMENTOS LEGAIS APLICADOS
[Liste as leis, artigos e jurisprudência específicas citadas]

## 🏛️ TRIBUNAL E INSTÂNCIA
[Identifique o tribunal, câmara/turma e magistrado responsável]

## 💡 IMPACTOS PRÁTICOS
[Analise como essa decisão afeta advogados, empresas e cidadãos]

## 🔍 PONTOS IMPORTANTES
[Destaque os aspectos mais relevantes para a prática jurídica]

**ARTIGO COMPLETO A SER ANALISADO:**
${newsContent}

IMPORTANTE: Analise especificamente este artigo, não dê respostas genéricas!`,

        explicar: `Analise COMPLETAMENTE o artigo jurídico abaixo como um PROFESSOR DE DIREITO experiente.

INSTRUÇÕES:
- Leia TODO o conteúdo do artigo
- Explique de forma didática e detalhada
- Formate sua resposta em MARKDOWN
- Seja específico sobre este caso
- NÃO seja genérico

# 🎓 EXPLICAÇÃO DIDÁTICA JURÍDICA

## 📖 CONTEXTO DO CASO
[Explique detalhadamente a situação fática apresentada]

## 🧠 CONCEITOS JURÍDICOS ENVOLVIDOS
[Defina e explique todos os institutos jurídicos mencionados no artigo]

## 🔍 ANÁLISE PASSO A PASSO
[Dissecção didática do raciocínio jurídico aplicado]

## 📚 BASE LEGAL
[Explique as normas legais aplicadas ao caso]

## 🎯 RATIO DECIDENDI
[Explique a razão de decidir do magistrado]

## 💭 CONSIDERAÇÕES PEDAGÓGICAS
[Lições importantes que este caso ensina]

**ARTIGO COMPLETO A SER ANALISADO:**
${newsContent}

IMPORTANTE: Explique especificamente este caso, não teoria geral!`,

        exemplo: `Analise COMPLETAMENTE o artigo jurídico abaixo e crie EXEMPLOS PRÁTICOS baseados no caso.

INSTRUÇÕES:
- Leia TODO o conteúdo do artigo
- Crie exemplos concretos baseados no caso específico
- Formate sua resposta em MARKDOWN
- Seja prático e específico

# 💡 EXEMPLOS PRÁTICOS JURÍDICOS

## 🎯 CASOS SIMILARES
[Apresente situações práticas similares ao caso do artigo]

## 📝 APLICAÇÕES NA ADVOCACIA
[Como advogados podem usar esta decisão em seus casos]

## 🏢 IMPACTO EMPRESARIAL
[Como empresas devem se adequar a esta decisão]

## 👥 REFLEXOS PARA CIDADÃOS
[Como esta decisão afeta o cidadão comum]

## 📋 MODELO DE PETIÇÃO
[Sugira como elaborar peças processuais baseadas nesta decisão]

## 🔧 FERRAMENTAS PRÁTICAS
[Estratégias processuais e argumentos que podem ser utilizados]

**ARTIGO COMPLETO A SER ANALISADO:**
${newsContent}

IMPORTANTE: Base seus exemplos especificamente neste caso!`,

        analise: `Analise COMPLETAMENTE o artigo jurídico abaixo com RIGOR TÉCNICO MÁXIMO.

INSTRUÇÕES:
- Leia TODO o conteúdo do artigo
- Faça análise técnica profunda e especializada
- Formate sua resposta em MARKDOWN
- Seja técnico e preciso

# ⚖️ ANÁLISE JURÍDICA TÉCNICA ESPECIALIZADA

## 🏛️ ASPECTOS CONSTITUCIONAIS
[Análise constitucional específica do caso]

## 📚 LEGISLAÇÃO APLICÁVEL
[Leis, códigos e normas específicas do caso]

## 📖 HERMENÊUTICA JURÍDICA
[Interpretação das normas aplicadas]

## 🔍 TÉCNICA DECISÓRIA
[Análise da fundamentação e metodologia decisória]

## ⚖️ PRECEDENTES RELACIONADOS
[Jurisprudência específica sobre o tema]

## 🎯 RATIO DECIDENDI TÉCNICA
[Análise técnica da razão de decidir]

## 📊 IMPACTOS SISTÊMICOS
[Como esta decisão afeta o sistema jurídico]

## 🔧 ASPECTOS PROCESSUAIS
[Análise dos aspectos procedimentais envolvidos]

**ARTIGO COMPLETO A SER ANALISADO:**
${newsContent}

IMPORTANTE: Analise tecnicamente este caso específico!`,

        precedentes: `Analise COMPLETAMENTE o artigo jurídico abaixo focando em PRECEDENTES E JURISPRUDÊNCIA.

INSTRUÇÕES:
- Leia TODO o conteúdo do artigo
- Pesquise e relacione precedentes específicos
- Formate sua resposta em MARKDOWN
- Seja específico sobre jurisprudência

# 📚 PRECEDENTES E JURISPRUDÊNCIA RELACIONADA

## 🏛️ JURISPRUDÊNCIA DO STF
[Decisões específicas do Supremo relacionadas ao tema do artigo]

## ⚖️ ENTENDIMENTO DO STJ
[Precedentes específicos do Superior Tribunal sobre o tema]

## 🏛️ TRIBUNAIS REGIONAIS
[Decisões de TRFs e TJs sobre casos similares]

## 📊 SÚMULAS APLICÁVEIS
[Súmulas vinculantes e ordinárias relacionadas]

## 🔍 TESES FIXADAS
[Teses jurídicas fixadas em recursos repetitivos]

## 📈 EVOLUÇÃO JURISPRUDENCIAL
[Como o entendimento dos tribunais evoluiu sobre o tema]

## 🎯 BINDING PRECEDENTS
[Precedentes obrigatórios relacionados ao caso]

## 📋 ORIENTAÇÕES PARA ADVOGADOS
[Como usar estes precedentes na prática]

**ARTIGO COMPLETO A SER ANALISADO:**
${newsContent}

IMPORTANTE: Foque nos precedentes específicos relacionados a este caso!`
      };

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: { 
          message: prompts[actionType]
        }
      });

      if (error) throw error;

      if (data.success) {
        const action = aiActions.find(a => a.type === actionType);
        if (action) {
          // Navigate to detailed analysis page (without passing icon)
          navigate('/ai-analysis', {
            state: {
              analysisType: actionType,
              analysisLabel: action.label,
              analysisContent: data.response,
              newsTitle: title,
              newsUrl: url,
              analysisColor: action.color
            }
          });
        }
        setShowAiModal(false);
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

  const openOriginal = () => {
    window.open(url, '_blank');
  };

  return (
    <>
      {/* WebView Principal */}
      <div className="fixed inset-0 z-50 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="max-w-md">
              <h1 className="font-semibold text-sm truncate">{title}</h1>
              <p className="text-xs text-muted-foreground truncate">{url}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={openOriginal}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* iframe */}
        <iframe
          src={url}
          className="w-full h-[calc(100vh-140px)]"
          title={title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />

        {/* Botões Flutuantes */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-3 bg-background/90 backdrop-blur-md border border-border/50 rounded-full px-4 py-2 shadow-lg">
            <Button
              onClick={openOriginal}
              size="sm"
              variant="outline"
              className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10 rounded-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Original
            </Button>
            
            <Button
              onClick={() => setShowAiModal(true)}
              size="sm"
              className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 rounded-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              Análise IA
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Análise IA */}
      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-yellow-400" />
                Análise Inteligente - {title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAiModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {loadingContent ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando conteúdo para análise...</p>
              </div>
            ) : (
              <>
                {/* Botões de Ação IA */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiActions.map((action) => (
                    <div key={action.type} className="relative">
                      <Button
                        onClick={() => handleAIAction(action.type)}
                        disabled={loadingAI[action.type]}
                        className="w-full h-auto p-4 bg-card hover:bg-card/80 border border-border text-left flex-col items-start gap-2"
                        variant="outline"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className={`p-1.5 rounded ${action.color}`}>
                            <action.icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">{action.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          {action.description}
                        </p>
                        {loadingAI[action.type] && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </Button>
                      
                      {aiAnalysis[action.type] && (
                        <Button
                          onClick={() => handleCopy(action.type)}
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          {copySuccess[action.type] ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Análises Geradas */}
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-4">
                    {Object.entries(aiAnalysis).map(([type, content]) => {
                      if (!content) return null;
                      
                      const action = aiActions.find(a => a.type === type);
                      if (!action) return null;

                      return (
                        <div key={type} className="border border-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={action.color}>
                              <action.icon className="h-3 w-3 mr-1" />
                              {action.label}
                            </Badge>
                          </div>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};