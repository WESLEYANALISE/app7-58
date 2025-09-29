import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Bot, BookOpen, MessageCircle, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LegalNewsChat } from './LegalNewsChat';
import ReactMarkdown from 'react-markdown';

interface NewsArticleSummaryProps {
  newsTitle: string;
  newsUrl: string;
  newsContent?: string;
}

export const NewsArticleSummary = ({ newsTitle, newsUrl, newsContent }: NewsArticleSummaryProps) => {
  const [summary, setSummary] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [fullContent, setFullContent] = useState(newsContent || '');
  const { toast } = useToast();

  const summarizeNews = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Primeiro, obter o conteúdo da notícia se não tiver
      let contentToSummarize = fullContent;
      
      if (!contentToSummarize) {
        // Usar proxy para obter conteúdo da notícia
        const { data: contentData, error: contentError } = await supabase.functions.invoke('news-content-proxy', {
          body: { url: newsUrl }
        });

        if (contentError) throw contentError;
        
        if (contentData.success) {
          contentToSummarize = contentData.content;
          setFullContent(contentToSummarize);
        } else {
          throw new Error('Não foi possível obter o conteúdo da notícia');
        }
      }

      // Agora resumir usando IA
      const prompt = `Você é uma Professora de Direito especializada, experiente e muito didática. Analise a seguinte notícia jurídica e forneça um resumo COMPLETO e PROFUNDO:

**TÍTULO:** ${newsTitle}

**CONTEÚDO COMPLETO:** ${contentToSummarize}

---

**INSTRUÇÕES PARA SUA ANÁLISE:**

## 📋 **RESUMO EXECUTIVO COMPLETO**
- Faça um resumo de 3-4 parágrafos explicando TUDO que aconteceu
- Inclua contexto histórico se relevante
- Explique as partes envolvidas e suas posições
- Detalhe a decisão tomada e seus fundamentos

## ⚖️ **ANÁLISE JURÍDICA PROFUNDA**
- **Legislação aplicada:** Cite todos os artigos, leis, códigos mencionados
- **Jurisprudência:** Mencione precedentes, súmulas, decisões anteriores
- **Princípios jurídicos:** Quais princípios constitucionais estão em jogo
- **Institutos jurídicos:** Explique os conceitos jurídicos envolvidos
- **Competência:** Qual órgão decidiu e por que tinha competência

## 🎯 **IMPACTOS PRÁTICOS DETALHADOS**
- **Para advogados:** Como isso muda a prática advocatícia
- **Para empresas:** Quais setores são afetados e como
- **Para cidadãos:** Como isso impacta o dia a dia das pessoas
- **Para o judiciário:** Mudanças na interpretação ou aplicação da lei

## 🔍 **ANÁLISE CRÍTICA**
- **Argumentos da decisão:** Por que o tribunal decidiu assim
- **Possíveis controvérsias:** Pontos que podem gerar debate
- **Consequências futuras:** O que esperar a partir desta decisão

## ⚠️ **ALERTAS PARA PROFISSIONAIS**
- **Prazos importantes:** Se há prazos para adaptação
- **Mudanças de procedimento:** O que muda na prática
- **Orientações:** Como os profissionais devem se adaptar

## 📚 **PARA ESTUDANTES**
- **Conceitos importantes:** Defina termos técnicos mencionados
- **Conexões:** Como isso se relaciona com outras áreas do direito
- **Dicas de estudo:** Pontos importantes para concursos/OAB

**ESTILO:** Seja didática, use exemplos práticos, explique termos técnicos, e torne o conteúdo acessível mas completo. Use emojis para organizar e facilitar a leitura.`;

      const { data, error } = await supabase.functions.invoke('openai-legal-chat', {
        body: { 
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) throw error;

      if (data.success) {
        setSummary(data.response);
        setShowChat(true);
        
        toast({
          title: "✅ Resumo Completo Criado!",
          description: "Análise jurídica detalhada pronta. Role para baixo para fazer perguntas!",
        });
      } else {
        throw new Error(data.error || 'Erro na IA');
      }
    } catch (error) {
      console.error('Error summarizing news:', error);
      toast({
        title: "Erro ao resumir notícia",
        description: "Não foi possível criar o resumo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const explainNews = async () => {
    if (loadingExplanation) return;
    
    setLoadingExplanation(true);
    try {
      // Primeiro, obter o conteúdo da notícia se não tiver
      let contentToExplain = fullContent;
      
      if (!contentToExplain) {
        const { data: contentData, error: contentError } = await supabase.functions.invoke('news-content-proxy', {
          body: { url: newsUrl }
        });

        if (contentError) throw contentError;
        
        if (contentData.success) {
          contentToExplain = contentData.content;
          setFullContent(contentToExplain);
        } else {
          throw new Error('Não foi possível obter o conteúdo da notícia');
        }
      }

      const prompt = `Você é uma Professora de Direito muito didática. EXPLIQUE de forma SIMPLES e DETALHADA esta notícia:

**TÍTULO:** ${newsTitle}

**CONTEÚDO:** ${contentToExplain}

---

**SUA MISSÃO:** Explicar como se fosse para um estudante de direito que está aprendendo.

## 🎓 **EXPLICAÇÃO DIDÁTICA**

### **O que aconteceu?**
- Conte a história de forma simples e cronológica
- Use linguagem acessível, evitando "juridiquês"
- Explique o contexto por trás da situação

### **Quem são os envolvidos?**
- Apresente cada parte e seus interesses
- Explique por que cada um agiu como agiu
- Deixe claro quem ganhou e quem perdeu

### **Conceitos Jurídicos Explicados**
- Defina TODOS os termos técnicos mencionados
- Use analogias e exemplos do dia a dia
- Explique como cada conceito funciona na prática

### **Por que isso é importante?**
- Explique a relevância desta decisão
- Use exemplos concretos de como isso afeta as pessoas
- Conecte com outros casos ou situações similares

### **Exemplos Práticos**
- Crie situações hipotéticas para ilustrar os conceitos
- Mostre como isso funcionaria em casos reais
- Dê dicas de como aplicar esse conhecimento

**ESTILO:** Seja como uma professora querida - paciente, clara, didática. Use exemplos, analogias e deixe tudo muito fácil de entender! 🎓✨`;

      const { data, error } = await supabase.functions.invoke('openai-legal-chat', {
        body: { 
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) throw error;

      if (data.success) {
        setExplanation(data.response);
        setShowChat(true);
        
        toast({
          title: "✅ Explicação Didática Pronta!",
          description: "Conteúdo explicado de forma simples. Chat disponível abaixo!",
        });
      } else {
        throw new Error(data.error || 'Erro na IA');
      }
    } catch (error) {
      console.error('Error explaining news:', error);
      toast({
        title: "Erro ao explicar notícia",
        description: "Não foi possível criar a explicação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da notícia */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg md:text-xl mb-2">
                {newsTitle}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Notícia jurídica</span>
                <Badge variant="secondary" className="ml-2">
                  <Bot className="h-3 w-3 mr-1" />
                  Análise com IA
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={summarizeNews}
                disabled={loading || loadingExplanation}
                className="flex-shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resumindo...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Resumir
                  </>
                )}
              </Button>
              
              <Button
                onClick={explainNews}
                disabled={loading || loadingExplanation}
                variant="outline"
                className="flex-shrink-0"
              >
                {loadingExplanation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Explicando...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Explicar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo gerado */}
      {summary && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Bot className="h-5 w-5" />
              📋 Análise Jurídica Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explicação didática */}
      {explanation && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Lightbulb className="h-5 w-5" />
              🎓 Explicação Didática
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat para dúvidas - SEMPRE APARECE APÓS RESUMO OU EXPLICAÇÃO */}
      {(summary || explanation) && (
        <div className="space-y-4 mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <MessageCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">💬 Chat com a Professora IA</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Agora você pode fazer perguntas específicas sobre esta notícia. 
              <br />
              <strong>A professora está pronta para esclarecer suas dúvidas!</strong>
            </p>
          </div>
          
          <LegalNewsChat 
            newsContent={fullContent} 
            newsTitle={newsTitle} 
          />
        </div>
      )}

      {/* Indicador visual se ainda não há resumo/explicação */}
      {!summary && !explanation && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              👆 Clique em <strong>"Resumir"</strong> ou <strong>"Explicar"</strong> acima para começar a análise.
              <br />
              Após a análise, o chat aparecerá aqui para suas dúvidas!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};