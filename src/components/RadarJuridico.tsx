import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Clock, Newspaper, ExternalLink, Brain, FileText, Loader2, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WebView } from '@/components/WebView';
import ReactMarkdown from 'react-markdown';
import { useLegalNewsRead } from '@/hooks/useLegalNewsRead';
import { LegalNewsChat } from '@/components/LegalNewsChat';
import { OptimizedImage } from '@/components/OptimizedImage';

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

interface NewsContent {
  title?: string;
  description?: string;
  image_url?: string;
  content_html?: string;
  content_text?: string;
  success: boolean;
  error?: string;
}

const PORTAL_COLORS = {
  migalhas: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conjur: 'bg-green-500/20 text-green-300 border-green-500/30',
  amodireito: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  jota: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  jusbrasil: 'bg-red-500/20 text-red-300 border-red-500/30',
  dizerodireito: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  espacovital: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
};

const PORTAL_NAMES = {
  migalhas: 'Migalhas',
  conjur: 'ConJur',
  amodireito: 'A&M Direito',
  jota: 'Jota',
  jusbrasil: 'JusBrasil',
  dizerodireito: 'Dizer o Direito',
  espacovital: 'Espaço Vital'
};

export const RadarJuridico = () => {
  const { setCurrentFunction } = useNavigation();
  const [news, setNews] = useState<LegalNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<LegalNews | null>(null);
  const [newsContent, setNewsContent] = useState<NewsContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewTitle, setWebViewTitle] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();
  const { markAsRead, isRead } = useLegalNewsRead();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        toast({
          title: "Buscando notícias...",
          description: "Processando as últimas notícias jurídicas",
        });
      }

      const { data, error } = await supabase.functions.invoke('legal-news-radar');

      if (error) throw error;

      if (data.success) {
        // Filtrar apenas notícias do Conjur
        const conjurNews = data.data.filter((item: LegalNews) => item.portal === 'conjur');
        setNews(conjurNews);
        setLastUpdate(new Date());
        if (!silent) {
          toast({
            title: "Notícias atualizadas",
            description: `${conjurNews.length} notícias do Conjur carregadas`,
          });
        }
      } else {
        throw new Error(data.error || 'Erro ao carregar notícias');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      if (!silent) {
        toast({
          title: "Erro ao carregar notícias",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNews();

    // Set up auto-refresh every 30 minutes
    intervalRef.current = setInterval(() => {
      fetchNews(true); // Silent update
    }, 30 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const openNewsReader = async (newsItem: LegalNews) => {
    // Mark as read when opening
    markAsRead(newsItem.id);
    
    setSelectedNews(newsItem);
    setLoadingContent(true);
    setNewsContent(null);
    setAiResponse('');
    setShowAiAnalysis(false);

    try {
      const { data, error } = await supabase.functions.invoke('news-content-proxy', {
        body: { url: newsItem.news_url }
      });

      if (error) throw error;

      if (data.success) {
        setNewsContent(data);
      } else {
        throw new Error(data.error || 'Erro ao carregar conteúdo');
      }
    } catch (error) {
      console.error('Error loading news content:', error);
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Não foi possível carregar o artigo. Tente novamente.",
        variant: "destructive",
      });
      setNewsContent({ success: false, error: 'Erro ao carregar conteúdo' });
    } finally {
      setLoadingContent(false);
    }
  };

  const handleAiAction = async (action: 'resumir' | 'explicar') => {
    setLoadingAi(true);
    setAiResponse('');

    try {
      // Garantir que temos o conteúdo completo da notícia
      let fullContent = newsContent?.content_text;
      
      if (!fullContent || fullContent.trim().length < 100) {
        throw new Error('Conteúdo da notícia não está disponível ou é muito curto para análise. Tente carregar a notícia novamente.');
      }

      const prompt = action === 'resumir' 
        ? `PRIMEIRA ETAPA: LEIA E ANALISE COMPLETAMENTE TODO O ARTIGO ABAIXO ANTES DE RESPONDER

SEGUNDA ETAPA: APÓS LER TODO O CONTEÚDO, CRIE UM RESUMO BASEADO EXCLUSIVAMENTE NO QUE VOCÊ LEU

Você é um assistente jurídico EXPERIENTE e ESPECIALISTA em análise jurídica. 

**PROCESSO OBRIGATÓRIO:**
1. PRIMEIRO: Leia COMPLETAMENTE todo o artigo fornecido abaixo
2. SEGUNDO: Analise MINUCIOSAMENTE cada parágrafo, informação, data, nome mencionado
3. TERCEIRO: SOMENTE DEPOIS DE LER TUDO, crie o resumo usando EXCLUSIVAMENTE as informações do artigo

**INSTRUÇÕES CRÍTICAS:**
- ANALISE SOMENTE O ARTIGO FORNECIDO - não invente informações
- Se o artigo não tiver informações suficientes sobre alguma seção, indique "Não especificado no artigo"
- Seja o mais detalhado possível com as informações REAIS do artigo
- Extraia TODOS os dados, números, datas, nomes e detalhes MENCIONADOS no texto
- Seja preciso e completo baseado no que está REALMENTE escrito
- Use linguagem técnica mas clara

# 📋 RESUMO ULTRA DETALHADO DA NOTÍCIA JURÍDICA

## 🎯 PONTO PRINCIPAL E CONTEXTO COMPLETO
**Resumo do caso em uma frase:**
[Síntese em uma frase clara e completa]

**Contexto amplo:**
[Explique em detalhes o cenário, as circunstâncias históricas, políticas e jurídicas que levaram a esta situação]

**Relevância nacional/internacional:**
[Por que este caso é importante no cenário atual]

**Precedentes relacionados:**
[Casos similares ou relacionados que já ocorreram]

## ⚖️ DECISÃO/ENTENDIMENTO JURÍDICO DETALHADO
**Decisão principal:**
[Qual foi exatamente a decisão tomada - seja específico]

**Fundamentação da decisão:**
[Quais foram os argumentos e fundamentos utilizados]

**Votos e divergências:**
[Se houver, detalhe votos majoritários, minoritários e divergências]

**Efeitos da decisão:**
[Quais são os efeitos práticos imediatos desta decisão]

## 🏛️ ÓRGÃO/INSTÂNCIA E AUTORIDADES
**Tribunal/Órgão:**
[Qual tribunal, vara, turma, câmara específica]

**Relator(es):**
[Nome do(s) relator(es) e informações relevantes]

**Outros julgadores:**
[Outros ministros, desembargadores ou juízes envolvidos]

**Representantes das partes:**
[Advogados, procuradores, defensores públicos mencionados]

## 📚 FUNDAMENTOS LEGAIS ULTRA DETALHADOS
**Constituição Federal:**
- Art. [X]: [Transcreva o artigo específico e explique sua aplicação]
- Art. [Y]: [Continue para todos os artigos constitucionais]

**Legislação Infraconstitucional:**
- Lei [número], Art. [X]: [Texto da lei e como se aplica]
- Decreto [número]: [Detalhes específicos]
- [Continue para todas as normas citadas]

**Códigos Aplicáveis:**
- Código [nome], Art. [X]: [Texto e aplicação]
- [Continue para todos os códigos mencionados]

**Jurisprudência Citada:**
- STF: [Casos específicos com números de processo]
- STJ: [Precedentes mencionados]
- Tribunais: [Outras decisões relevantes]

**Súmulas:**
- Súmula [número] do [tribunal]: [Texto completo e aplicação]

## 🔍 ANÁLISE COMPLETA DE TODOS OS ARGUMENTOS
**Argumentos da parte requerente:**
- [Primeiro argumento detalhado]
- [Segundo argumento detalhado]
- [Continue para todos os argumentos]

**Argumentos da parte requerida:**
- [Primeiro argumento detalhado]
- [Segundo argumento detalhado]
- [Continue para todos os argumentos]

**Posição do Ministério Público:**
[Se houver manifestação do MP]

**Amicus Curiae:**
[Se houver participação de terceiros]

**Argumentos do tribunal:**
- [Primeiro fundamento da decisão]
- [Segundo fundamento da decisão]
- [Continue para todos os fundamentos]

## 👥 PARTES ENVOLVIDAS - ANÁLISE COMPLETA
**Requerente(s):**
- Nome: [Nome completo]
- Qualificação: [Pessoa física/jurídica, cargo, etc.]
- Interesse: [Qual o interesse na causa]
- Representação: [Advogados, procuradores]

**Requerido(s):**
- [Mesma estrutura detalhada]

**Terceiros interessados:**
- [Se houver outras partes envolvidas]

## ⏰ CRONOLOGIA DETALHADA DOS FATOS
**[Data 1]:** [O que aconteceu nesta data]
**[Data 2]:** [Próximo evento importante]
**[Data 3]:** [Continue cronologicamente]
[Continue com TODAS as datas mencionadas]

## 💡 IMPLICAÇÕES PRÁTICAS ULTRA DETALHADAS

### 👨‍⚖️ Para Advogados:
**Mudanças na prática:**
- [Primeira mudança específica]
- [Segunda mudança específica]

**Novas estratégias:**
- [Estratégias que surgem desta decisão]

**Petições e procedimentos:**
- [Como isso afeta a redação de petições]

### 🏢 Para Empresas:
**Compliance:**
- [Mudanças necessárias na conformidade]

**Contratos:**
- [Como isso afeta contratos futuros]

**Processos internos:**
- [Mudanças operacionais necessárias]

### 👤 Para Cidadãos:
**Direitos:**
- [Novos direitos ou mudanças em direitos existentes]

**Deveres:**
- [Novas obrigações ou mudanças]

**Procedimentos:**
- [Como isso afeta procedimentos do dia a dia]

### ⚖️ Para o Sistema Jurídico:
**Procedimentos:**
- [Mudanças procedimentais]

**Interpretação:**
- [Novas formas de interpretar a lei]

**Precedentes:**
- [Como isso afeta futuros julgamentos]

## 🔮 CONSEQUÊNCIAS E DESDOBRAMENTOS FUTUROS
**Recursos possíveis:**
- [Quais recursos podem ser interpostos]

**Efeitos em casos similares:**
- [Como isso afeta casos em andamento]

**Mudanças legislativas:**
- [Se pode gerar mudanças na lei]

**Impacto em outras áreas do direito:**
- [Conexões com outras áreas jurídicas]

## 📊 RELEVÂNCIA E IMPACTO NO CENÁRIO ATUAL
**Importância histórica:**
- [Contexto histórico da decisão]

**Impacto social:**
- [Como a sociedade é afetada]

**Repercussão na mídia:**
- [Se houve cobertura midiática]

**Opinião de especialistas:**
- [Se há opiniões de juristas mencionadas]

## 🎯 PONTOS DE ATENÇÃO CRÍTICOS
- [Primeiro ponto crítico para atenção]
- [Segundo ponto crítico para atenção]
- [Continue com todos os pontos importantes]

## 📈 ESTATÍSTICAS E NÚMEROS
[Se houver dados quantitativos no artigo, liste todos]
- [Percentual/número 1 e sua explicação]
- [Percentual/número 2 e sua explicação]

---

**TEXTO COMPLETO DO ARTIGO ANALISADO:**
${fullContent}`
        : `PRIMEIRA ETAPA: LEIA E ANALISE COMPLETAMENTE TODO O ARTIGO ABAIXO ANTES DE RESPONDER

SEGUNDA ETAPA: APÓS LER TODO O CONTEÚDO, CRIE UMA EXPLICAÇÃO BASEADA EXCLUSIVAMENTE NO QUE VOCÊ LEU

Você é um PROFESSOR DE DIREITO RENOMADO e DIDÁTICO com décadas de experiência acadêmica e prática.

**PROCESSO OBRIGATÓRIO:**
1. PRIMEIRO: Leia COMPLETAMENTE todo o artigo fornecido abaixo
2. SEGUNDO: Analise EXAUSTIVAMENTE cada conceito, termo jurídico, situação mencionada
3. TERCEIRO: SOMENTE DEPOIS DE LER TUDO, crie a explicação usando EXCLUSIVAMENTE as informações do artigo

**INSTRUÇÕES PEDAGÓGICAS CRÍTICAS:**
- ANALISE SOMENTE O ARTIGO FORNECIDO - não invente informações
- Se o artigo não tiver informações sobre alguma seção, indique "Não especificado no artigo"
- Seja extremamente didático baseado no conteúdo REAL
- Explique cada conceito mencionado no artigo como se fosse para um estudante
- Use analogias e exemplos baseados nas informações do texto
- Não deixe nenhum conceito MENCIONADO NO ARTIGO sem explicação
- Estruture o conhecimento baseado no que está REALMENTE escrito

# 🎓 EXPLICAÇÃO DIDÁTICA ULTRA COMPLETA DO ARTIGO

## 📖 CENÁRIO E SITUAÇÃO - ENTENDENDO O CONTEXTO

### 🌍 **Contexto Histórico e Social**
[Explique detalhadamente o momento histórico, social e político em que esta questão se desenvolve]

### 🏛️ **Cenário Jurídico**
[Descreva o ambiente jurídico, as normas vigentes e como chegamos a esta situação]

### 📰 **Por que isso virou notícia?**
[Explique por que este caso chamou atenção e por que é importante]

### 🎯 **Qual o problema central?**
[Identifique e explique de forma simples qual é o problema jurídico principal]

## 🧠 CONCEITOS JURÍDICOS - DICIONÁRIO COMPLETO

### 📚 **Definições Essenciais**
[Para CADA conceito jurídico mencionado no artigo, crie uma explicação completa]

**Conceito 1: [Nome do conceito]**
- **Definição simples:** [Explique em linguagem cotidiana]
- **Definição técnica:** [Versão mais precisa]
- **Exemplo prático:** [Situação real onde isso se aplica]
- **Por que existe:** [Razão histórica/social do conceito]

**Conceito 2: [Nome do conceito]**
[Repita a estrutura para TODOS os conceitos]

### ⚖️ **Princípios Jurídicos Envolvidos**
[Explique quais princípios do direito estão sendo aplicados e por quê]

## 🔍 ANÁLISE PASSO A PASSO - DISSECANDO O CASO

### 📋 **Resumo para Iniciantes**
[Conte a história de forma simples, como se fosse um caso de uma novela]

### 🎭 **Os Protagonistas da História**
**Quem são as partes envolvidas:**
- **[Nome/Tipo da Parte 1]:** [Quem é, o que faz, por que está no caso]
- **[Nome/Tipo da Parte 2]:** [Mesma explicação detalhada]
- **[Outras partes]:** [Continue para todos os envolvidos]

### 🎯 **O que cada um queria?**
**Objetivos de cada parte:**
- **[Parte 1] queria:** [Explique o objetivo de forma clara]
- **[Parte 2] queria:** [Explique o objetivo de forma clara]

### ⚖️ **Os Argumentos - Como cada um tentou convencer**

#### 🗣️ **Argumentos da [Parte 1]:**
1. **Primeiro argumento:** [Explique de forma didática]
   - **Por que usaram este argumento:** [Contexto]
   - **Base legal:** [Em que lei se basearam]
   - **Exemplo prático:** [Como isso funciona na vida real]

2. **Segundo argumento:** [Continue a estrutura]

#### 🗣️ **Argumentos da [Parte 2]:**
[Mesma estrutura detalhada]

### 🏛️ **A Decisão do Tribunal - Como os juízes pensaram**
**Processo de decisão:**
1. **O que os juízes analisaram primeiro:** [Primeiro ponto]
2. **Como chegaram à conclusão:** [Raciocínio jurídico]
3. **Por que decidiram desta forma:** [Fundamentação]

## 📚 FUNDAMENTOS LEGAIS - ENTENDENDO AS LEIS

### 📜 **Constituição Federal**
[Para cada artigo constitucional citado]
**Artigo [X] da Constituição:**
- **O que diz:** [Transcreva ou parafrasee]
- **O que significa na prática:** [Tradução para linguagem comum]
- **Por que foi criado:** [Contexto histórico]
- **Como se aplica neste caso:** [Conexão específica]

### 📖 **Leis e Códigos**
[Para cada lei mencionada]
**Lei [número/nome]:**
- **Objetivo da lei:** [Para que foi criada]
- **Artigo específico:** [Qual artigo se aplica]
- **Tradução didática:** [O que significa em palavras simples]
- **Aplicação no caso:** [Como se conecta com a situação]

### 📋 **Jurisprudência - Casos Anteriores**
[Para cada precedente citado]
**Caso [nome/número]:**
- **O que aconteceu naquele caso:** [História do precedente]
- **Como foi decidido:** [Qual foi a decisão]
- **Por que é importante:** [Por que serve de modelo]
- **Conexão com o caso atual:** [Semelhanças e diferenças]

## 🌟 EXEMPLOS PRÁTICOS - SITUAÇÕES REAIS

### 💼 **Para Profissionais do Direito**
**Situação 1: [Cenário específico]**
- **Descrição:** [Situação detalhada]
- **Como aplicar:** [Passo a passo da solução]
- **Cuidados necessários:** [O que observar]
- **Documentos necessários:** [O que preparar]

**Situação 2:** [Continue com mais exemplos]

### 🏢 **Para Empresas**
**Exemplo empresarial 1:**
- **Tipo de empresa:** [Setor/tamanho]
- **Situação problema:** [Cenário específico]
- **Solução prática:** [Como proceder]
- **Documentação:** [O que fazer/preparar]

### 👤 **Para Cidadãos Comuns**
**Exemplo cidadão 1:**
- **Perfil da pessoa:** [Situação social/profissional]
- **Problema enfrentado:** [Questão específica]
- **Como resolver:** [Passos práticos]
- **Onde buscar ajuda:** [Órgãos, advogados, etc.]

## 🎯 DICAS DE OURO PARA PROFISSIONAIS

### 💡 **Estratégias Advocatícias**
- **Dica 1:** [Estratégia específica baseada na decisão]
  - **Como aplicar:** [Passo a passo]
  - **Quando usar:** [Situações ideais]
  - **Cuidados:** [O que evitar]

### 📝 **Redação de Petições**
- **Novos argumentos:** [Argumentos que podem ser usados]
- **Modelo de fundamentação:** [Como estruturar]
- **Precedentes para citar:** [Jurisprudência relevante]

### ⚠️ **Armadilhas para Evitar**
- **Erro comum 1:** [Equívoco frequente]
  - **Por que acontece:** [Razão do erro]
  - **Como evitar:** [Prevenção]
  - **Se cometer o erro:** [Como corrigir]

## 🔗 CONEXÕES JURÍDICAS - MATÉRIAS RELACIONADAS

### 📚 **Outras áreas do direito afetadas:**
- **[Área jurídica 1]:** [Como se conecta]
- **[Área jurídica 2]:** [Relação específica]

### 🎓 **Para estudantes - O que estudar mais:**
- **Disciplinas relacionadas:** [Matérias para aprofundar]
- **Livros recomendados:** [Bibliografia específica]
- **Casos para estudar:** [Precedentes importantes]

## ✅ RESUMO FINAL PARA MEMORIZAÇÃO

### 🎯 **Os 5 pontos-chave que você DEVE lembrar:**
1. **[Ponto 1]:** [Explicação concisa]
2. **[Ponto 2]:** [Explicação concisa]
3. **[Ponto 3]:** [Explicação concisa]
4. **[Ponto 4]:** [Explicação concisa]
5. **[Ponto 5]:** [Explicação concisa]

### 📱 **Resumo para celular** (versão ultra concisa):
[Um parágrafo que resume tudo para consulta rápida]

### 🔮 **O que esperar no futuro:**
[Possíveis desdobramentos e mudanças]

---

**ARTIGO ORIGINAL COMPLETO PARA ANÁLISE:**
${fullContent}`;

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: { 
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiResponse(data.response);
        setShowAiAnalysis(true);
      } else {
        throw new Error(data.error || 'Erro na IA');
      }
    } catch (error) {
      console.error('Error with AI:', error);
      toast({
        title: `Erro ao ${action}`,
        description: error.message || "Não foi possível processar com a IA. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Agora';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d atrás`;
    if (diffHours > 0) return `${diffHours}h atrás`;
    return 'Agora';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentFunction(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Radar Jurídico - ConJur</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* WebView Modal */}
      {webViewUrl && (
        <WebView
          url={webViewUrl}
          title={webViewTitle}
          onClose={() => {
            setWebViewUrl(null);
            setWebViewTitle('');
          }}
          showAIOptions={true}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentFunction(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Radar Jurídico - ConJur</h2>
          </div>
          {lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Atualizado: {formatDate(lastUpdate.toISOString())}
            </div>
          )}
        </div>

        {news.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
              <p className="text-muted-foreground">
                Tente atualizar ou verifique sua conexão com a internet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <Card key={item.id} className={`border-border/50 hover:border-primary/30 transition-colors ${
                isRead(item.id) ? 'opacity-60' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-4">
                    {/* Header com badge e tempo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="bg-green-500/20 text-green-300 border-green-500/30"
                        >
                          ConJur
                        </Badge>
                        {isRead(item.id) && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <OptimizedImage
                          src={item.image_url || '/placeholder.svg'}
                          alt={item.title}
                          className="w-24 h-24 rounded-lg border shadow-sm overflow-hidden bg-muted"
                          loading="lazy"
                          width={96}
                          height={96}
                          onError={() => {}}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight mb-2 hover:text-primary transition-colors cursor-pointer"
                            onClick={() => openNewsReader(item)}>
                          {item.title}
                        </h3>
                        
                        {item.preview && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {item.preview}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão de ação */}
                    <div className="flex justify-end pt-2 border-t border-border/30">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          markAsRead(item.id);
                          setWebViewUrl(item.news_url);
                          setWebViewTitle(item.title);
                        }}
                        className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                      >
                        Ler agora
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de leitura no app - agora simplificado */}
      <Dialog open={selectedNews !== null} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              {selectedNews?.title}
            </DialogTitle>
          </DialogHeader>

          {loadingContent ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : newsContent?.success ? (
            <div className="space-y-6">
              {newsContent.image_url && (
                <img 
                  src={newsContent.image_url} 
                  alt={newsContent.title || selectedNews?.title}
                  className="w-full max-h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: newsContent.content_html || '' }}
              />

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleAiAction('resumir')}
                  disabled={loadingAi}
                  className="gap-2"
                  variant="outline"
                >
                  <Brain className="h-4 w-4" />
                  {loadingAi ? 'Analisando...' : 'Resumir'}
                </Button>
                
                <Button 
                  onClick={() => handleAiAction('explicar')}
                  disabled={loadingAi}
                  className="gap-2"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  {loadingAi ? 'Analisando...' : 'Explicar'}
                </Button>
              </div>

              {aiResponse && showAiAnalysis && (
                <div className="mt-4 p-6 bg-muted/50 rounded-lg relative border border-border/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      Análise da IA
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAiAnalysis(false)}
                      className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive bg-destructive/10 text-destructive border border-destructive/30 rounded-full"
                      title="Fechar análise"
                    >
                      <X className="h-5 w-5 font-bold" />
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-primary" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-semibold mb-2 text-foreground" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-medium mb-2 text-foreground" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 text-sm text-foreground leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm text-foreground" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                        code: ({node, ...props}) => <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-4 border-border" {...props} />
                      }}
                    >
                      {aiResponse}
                    </ReactMarkdown>
                  </div>

                  {/* Opções de continuação da conversa */}
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <p className="text-sm text-muted-foreground mb-3">
                      💬 O que você gostaria de saber sobre este documento?
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Aqui poderia abrir um chat ou expandir mais a análise
                          toast({
                            title: "🤔 Pergunta interessante!",
                            description: "Use o chat da Professora IA abaixo para fazer perguntas específicas sobre este caso.",
                          });
                        }}
                        className="text-left justify-start h-auto p-3 border-dashed hover:border-primary/50"
                      >
                        <div>
                          <div className="font-medium text-xs">🤔 Quais são os precedentes?</div>
                          <div className="text-xs text-muted-foreground">Casos similares anteriores</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "💼 Ótima pergunta!",
                            description: "Use o chat da Professora IA abaixo para explorar aplicações práticas.",
                          });
                        }}
                        className="text-left justify-start h-auto p-3 border-dashed hover:border-primary/50"
                      >
                        <div>
                          <div className="font-medium text-xs">💼 Como aplicar na prática?</div>
                          <div className="text-xs text-muted-foreground">Exemplos e situações reais</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "⚖️ Excelente questão!",
                            description: "Use o chat da Professora IA abaixo para entender os fundamentos legais.",
                          });
                        }}
                        className="text-left justify-start h-auto p-3 border-dashed hover:border-primary/50"
                      >
                        <div>
                          <div className="font-medium text-xs">⚖️ Quais leis se aplicam?</div>
                          <div className="text-xs text-muted-foreground">Base legal completa</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "🔮 Pergunta estratégica!",
                            description: "Use o chat da Professora IA abaixo para discutir implicações futuras.",
                          });
                        }}
                        className="text-left justify-start h-auto p-3 border-dashed hover:border-primary/50"
                      >
                        <div>
                          <div className="font-medium text-xs">🔮 E os impactos futuros?</div>
                          <div className="text-xs text-muted-foreground">Consequências e desdobramentos</div>
                        </div>
                      </Button>
                    </div>

                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          👩‍🏫
                        </div>
                        <div>
                          <div className="font-medium text-sm">Professora IA Especializada</div>
                          <div className="text-xs text-muted-foreground">Chat interativo sobre o documento</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Faça perguntas específicas, peça exemplos práticos ou solicite esclarecimentos sobre qualquer parte da análise.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat interativo - só aparece após análise da IA */}
              {aiResponse && showAiAnalysis && (
                <div className="mt-6">
                  <LegalNewsChat 
                    newsContent={newsContent?.content_text || ''}
                    newsTitle={selectedNews?.title || ''}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar o conteúdo da notícia.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedNews) {
                    setWebViewUrl(selectedNews.news_url);
                    setWebViewTitle(selectedNews.title);
                    setSelectedNews(null);
                  }
                }}
                className="gap-2"
              >
                Abrir no navegador
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};