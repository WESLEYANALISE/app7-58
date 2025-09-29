import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Brain, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
interface WebViewProps {
  url: string;
  title: string;
  onClose: () => void;
  showAIOptions?: boolean;
}
export const WebView = ({
  url,
  title,
  onClose,
  showAIOptions = true
}: WebViewProps) => {
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [contentText, setContentText] = useState('');
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Carregar o conteúdo da página para análise da IA
    const loadContent = async () => {
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('news-content-proxy', {
          body: {
            url
          }
        });
        if (error) throw error;
        if (data.success && data.content_text) {
          setContentText(data.content_text);
        }
      } catch (error) {
        console.error('Error loading content for AI analysis:', error);
      }
    };
    if (showAIOptions) {
      loadContent();
    }
  }, [url, showAIOptions]);
  const handleAiAction = async (action: 'resumir' | 'explicar') => {
    setLoadingAi(true);
    setAiResponse('');
    try {
      // Primeiro, garantir que temos o conteúdo completo da notícia
      let fullContent = contentText;
      if (!fullContent) {
        // Carregar o conteúdo se ainda não temos
        const {
          data,
          error
        } = await supabase.functions.invoke('news-content-proxy', {
          body: {
            url
          }
        });
        if (error) throw error;
        if (data.success && data.content_text) {
          fullContent = data.content_text;
          setContentText(data.content_text);
        } else {
          throw new Error('Não foi possível carregar o conteúdo da notícia');
        }
      }
      if (!fullContent) {
        throw new Error('Conteúdo da notícia não está disponível');
      }
      const prompt = action === 'resumir' ? `Você é um assistente especializado em direito. Analise COMPLETAMENTE o artigo jurídico a seguir e crie um RESUMO ESTRUTURADO em markdown. 

Siga exatamente esta estrutura:

# 📋 Resumo Executivo

## 🎯 Ponto Principal
[Uma frase clara do ponto principal da notícia]

## ⚖️ Decisão/Entendimento
[O que foi decidido ou qual o entendimento apresentado]

## 📚 Fundamentos Legais
- [Liste as leis, artigos ou jurisprudências mencionadas]

## 🔍 Detalhes Importantes
- [3-5 pontos-chave em bullet points]

## 💡 Implicações Práticas
[Como isso afeta advogados, empresas ou cidadãos]

---

ARTIGO COMPLETO A ANALISAR:
${fullContent}` : `Você é um professor de direito experiente. Leia COMPLETAMENTE o artigo jurídico a seguir e crie uma EXPLICAÇÃO DIDÁTICA em markdown.

Siga exatamente esta estrutura:

# 🎓 Explicação Didática

## 📖 Contexto e Situação
[Explique o cenário de forma simples]

## ⚖️ Questão Jurídica Principal
[Qual o problema jurídico sendo discutido]

## 🔍 Análise Passo a Passo

### 1️⃣ Primeiro Aspecto
[Explicação clara]

### 2️⃣ Segundo Aspecto  
[Explicação clara]

### 3️⃣ Terceiro Aspecto
[Se aplicável]

## 📚 Base Legal
- **Lei/Artigo:** [Fundamento específico]
- **Jurisprudência:** [Se houver precedentes]

## 💼 Exemplos Práticos
[2-3 situações onde isso se aplicaria]

## ✅ Conclusão Simplificada
[Resumo em linguagem acessível]

---

ARTIGO COMPLETO A ANALISAR:
${fullContent}`;
      const {
        data,
        error
      } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          conversationHistory: []
        }
      });
      if (error) throw error;
      if (data.success) {
        setAiResponse(data.response);
      } else {
        throw new Error(data.error || 'Erro na IA');
      }
    } catch (error) {
      console.error('Error with AI:', error);
      toast({
        title: `Erro ao ${action}`,
        description: error.message || "Não foi possível processar com a IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoadingAi(false);
    }
  };
  return <div className="fixed inset-0 z-50 bg-background">
      {/* Header com botão voltar */}
      <div className="fixed top-0 left-0 right-0 z-60 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="ml-4 text-sm font-medium truncate flex-1">{title}</h1>
        </div>
      </div>

      {/* WebView iframe - tela completa */}
      <div className="pt-14 h-full">
        <iframe src={url} className="w-full h-full border-0" title={title} loading="lazy" sandbox="allow-same-origin allow-scripts allow-forms allow-links" />
      </div>

      {/* Botões flutuantes de IA */}
      {showAIOptions && <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-60">
          
          
          <Button onClick={() => handleAiAction('explicar')} disabled={loadingAi} className="gap-2 shadow-lg bg-secondary hover:bg-secondary/90" variant="secondary" size="default">
            <FileText className="h-4 w-4" />
            {loadingAi ? 'Lendo...' : 'Explicar'}
          </Button>
        </div>}

      {/* Loading indicator para IA */}
      {loadingAi && <div className="fixed bottom-6 left-6 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-60 border">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <span className="text-sm font-medium">Analisando notícia...</span>
              <p className="text-xs text-muted-foreground">Lendo todo o conteúdo</p>
            </div>
          </div>
        </div>}

      {/* Modal para resposta da IA */}
      {aiResponse && <Dialog open={true} onOpenChange={() => setAiResponse('')}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análise da IA
              </DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown components={{
            h1: ({
              node,
              ...props
            }) => <h1 className="text-2xl font-bold mb-4 text-primary" {...props} />,
            h2: ({
              node,
              ...props
            }) => <h2 className="text-xl font-semibold mb-3 text-foreground" {...props} />,
            h3: ({
              node,
              ...props
            }) => <h3 className="text-lg font-medium mb-2 text-foreground" {...props} />,
            p: ({
              node,
              ...props
            }) => <p className="mb-3 text-foreground leading-relaxed" {...props} />,
            ul: ({
              node,
              ...props
            }) => <ul className="mb-3 space-y-1" {...props} />,
            li: ({
              node,
              ...props
            }) => <li className="text-foreground" {...props} />,
            strong: ({
              node,
              ...props
            }) => <strong className="font-semibold text-primary" {...props} />,
            code: ({
              node,
              ...props
            }) => <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props} />,
            hr: ({
              node,
              ...props
            }) => <hr className="my-6 border-border" {...props} />
          }}>
                {aiResponse}
              </ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>}
    </div>;
};