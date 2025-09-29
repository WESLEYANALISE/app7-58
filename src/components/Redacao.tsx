import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, BookOpen, PenTool, Lightbulb, Target, Loader2, Upload, Clock, Download, CheckCircle, AlertCircle, Star, FileText, Info } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useRedacao, TipoRedacao, AnaliseRedacao, DicasRedacao } from '@/hooks/useRedacao';
import { useRedacaoHistory } from '@/hooks/useRedacaoHistory';
import { usePDFExport } from '@/hooks/usePDFExport';
import { FileUploadZone } from '@/components/Redacao/FileUploadZone';
import { HistoricoRedacao } from '@/components/Redacao/HistoricoRedacao';
import { RedacaoMenuInicial } from '@/components/Redacao/RedacaoMenuInicial';
import { RedacaoVideoaulas } from '@/components/Redacao/RedacaoVideoaulas';
import { CorrigirRedacao } from '@/components/Redacao/CorrigirRedacao';
import { useToast } from '@/hooks/use-toast';

export const Redacao = () => {
  const { setCurrentFunction } = useNavigation();
  const { toast } = useToast();
  const [texto, setTexto] = useState('');
  const [tipoRedacao, setTipoRedacao] = useState<TipoRedacao>('dissertativa');
  const [arquivoUpload, setArquivoUpload] = useState<{ url: string; texto?: string; nome: string } | null>(null);
  const [tituloRedacao, setTituloRedacao] = useState('');
  const [activeTab, setActiveTab] = useState('escrever');
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<'menu' | 'corrigir' | 'videoaulas' | 'cursos'>('menu');
  
  const { 
    loading, 
    analiseRedacao, 
    dicasRedacao, 
    error, 
    analisarRedacao, 
    buscarDicas, 
    resetAnalise 
  } = useRedacao();
  
  const { salvarAnalise } = useRedacaoHistory();
  const { exporting, exportarAnalise } = usePDFExport();

  const handleBack = () => {
    if (opcaoSelecionada !== 'menu') {
      setOpcaoSelecionada('menu');
    } else {
      setCurrentFunction(null);
    }
  };

  const handleOpcaoSelecionada = (opcao: 'corrigir' | 'videoaulas' | 'cursos') => {
    if (opcao === 'cursos') {
      toast({
        title: "Em breve!",
        description: "Os cursos de redação jurídica estarão disponíveis em breve.",
      });
      return;
    }
    setOpcaoSelecionada(opcao);
  };

  const validarDados = () => {
    const temTexto = texto.trim() || arquivoUpload?.texto;
    const temTitulo = tituloRedacao.trim();
    
    if (!temTexto) {
      toast({
        title: "Texto obrigatório",
        description: "Digite sua redação ou faça upload de um arquivo PDF/imagem.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!temTitulo) {
      toast({
        title: "Título obrigatório", 
        description: "Digite um título para sua redação.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleAnalizar = async () => {
    if (!validarDados()) return;
    
    const textoParaAnalise = arquivoUpload?.texto || texto;
    await analisarRedacao(textoParaAnalise, tipoRedacao);
    setActiveTab('analise');
  };

  const handleFileUploaded = (file: { url: string; texto?: string; nome: string }) => {
    setArquivoUpload(file);
    if (file.texto) {
      setTexto(file.texto);
    }
    if (!tituloRedacao) {
      setTituloRedacao(file.nome.replace(/\.[^/.]+$/, '')); // Remove extensão
    }
    toast({
      title: "Arquivo carregado!",
      description: "O texto foi extraído e está pronto para análise.",
    });
  };

  const handleExportarPDF = async () => {
    if (!analiseRedacao) return;
    
    const titulo = tituloRedacao || `Análise ${tipoRedacao} - ${new Date().toLocaleDateString('pt-BR')}`;
    const pontosFortes = analiseRedacao.pontos_fortes || [];
    const pontosMelhoria = analiseRedacao.melhorias || [];
    
    await exportarAnalise(analiseRedacao, {
      titulo,
      tipo: tipoRedacao,
      textoOriginal: arquivoUpload?.texto || texto,
      pontosFortes,
      pontosMelhoria
    });
  };

  const handleSalvarAnalise = async () => {
    if (!analiseRedacao) return;
    
    const titulo = tituloRedacao || `Análise ${tipoRedacao} - ${new Date().toLocaleDateString('pt-BR')}`;
    const pontosFortes = analiseRedacao.pontos_fortes || [];
    const pontosMelhoria = analiseRedacao.melhorias || [];
    
    await salvarAnalise({
      titulo,
      tipo_redacao: tipoRedacao,
      texto_original: arquivoUpload?.texto || texto,
      analise: analiseRedacao,
      arquivo_url: arquivoUpload?.url,
      nome_arquivo: arquivoUpload?.nome,
      pontos_fortes: pontosFortes,
      pontos_melhoria: pontosMelhoria,
      nota: analiseRedacao.nota
    });
  };

  const handleReabrirAnalise = (analiseHistorico: any) => {
    setTexto(analiseHistorico.texto_original);
    setTipoRedacao(analiseHistorico.tipo_redacao as TipoRedacao);
    setTituloRedacao(analiseHistorico.titulo);
    
    // Simular análise carregada
    const analiseCarregada: AnaliseRedacao = {
      resumo: analiseHistorico.analise?.resumo || analiseHistorico.analise || 'Análise recarregada do histórico',
      nota: analiseHistorico.nota,
      pontos_fortes: analiseHistorico.pontos_fortes,
      melhorias: analiseHistorico.pontos_melhoria
    };
    
    // Reset e recarregar análise
    resetAnalise();
    setActiveTab('analise');
    
    toast({
      title: "Análise reaberta",
      description: "A análise foi carregada do histórico.",
    });
  };

  const handleBuscarDicas = async () => {
    await buscarDicas(tipoRedacao);
    setActiveTab('dicas');
  };

  const handleNovaAnalise = () => {
    resetAnalise();
    setTexto('');
    setTituloRedacao('');
    setArquivoUpload(null);
    setActiveTab('escrever');
  };

  const getNota = () => {
    if (!analiseRedacao?.nota) return null;
    const nota = parseFloat(analiseRedacao.nota);
    
    if (nota >= 9) return { cor: 'bg-green-500', texto: 'Excelente' };
    if (nota >= 7) return { cor: 'bg-blue-500', texto: 'Bom' };
    if (nota >= 5) return { cor: 'bg-yellow-500', texto: 'Regular' };
    return { cor: 'bg-red-500', texto: 'Precisa melhorar' };
  };

  const tiposRedacao = [
    { 
      id: 'dissertativa', 
      label: 'Dissertação', 
      desc: 'Texto argumentativo sobre tema jurídico',
      icon: <BookOpen className="h-4 w-4" />
    },
    { 
      id: 'parecer', 
      label: 'Parecer', 
      desc: 'Análise técnica de caso',
      icon: <FileText className="h-4 w-4" />
    },
    { 
      id: 'peca', 
      label: 'Peça', 
      desc: 'Petição, contestação, etc.',
      icon: <Target className="h-4 w-4" />
    }
  ];

  const statusPreenchimento = {
    temTitulo: Boolean(tituloRedacao.trim()),
    temTexto: Boolean(texto.trim() || arquivoUpload?.texto),
    temArquivo: Boolean(arquivoUpload)
  };

  const podeAnalizar = statusPreenchimento.temTitulo && statusPreenchimento.temTexto;

  // Renderizar baseado na opção selecionada
  if (opcaoSelecionada === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        {/* Header Mobile-Friendly */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <PenTool className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold">Redação Perfeita</h1>
                <p className="text-xs text-muted-foreground">Assistente IA para redação jurídica</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-semibold">Redação Perfeita</h1>
              </div>
            </div>
            
            <div className="w-20"> {/* Espaçador para centralizar */}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto p-4 max-w-7xl">
          <RedacaoMenuInicial onOpcaoSelecionada={handleOpcaoSelecionada} />
        </div>
      </div>
    );
  }

  if (opcaoSelecionada === 'videoaulas') {
    return <RedacaoVideoaulas onVoltar={handleBack} />;
  }

  if (opcaoSelecionada === 'corrigir') {
    return <CorrigirRedacao onVoltar={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Header Mobile-Friendly */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <PenTool className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Redação Perfeita</h1>
              <p className="text-xs text-muted-foreground">Assistente IA para redação jurídica</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-semibold">Redação Perfeita</h1>
            </div>
          </div>
          
          <div className="w-20"> {/* Espaçador para centralizar */}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 max-w-4xl space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status de Preenchimento */}
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Como usar a Redação Perfeita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border-2 ${
                statusPreenchimento.temTitulo 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {statusPreenchimento.temTitulo ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm font-medium">1. Título</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite um título para sua redação
                </p>
              </div>
              
              <div className={`p-3 rounded-lg border-2 ${
                statusPreenchimento.temTexto 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {statusPreenchimento.temTexto ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm font-medium">2. Texto</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Escreva ou faça upload do PDF
                </p>
              </div>
              
              <div className={`p-3 rounded-lg border-2 ${
                podeAnalizar 
                  ? 'border-purple-200 bg-purple-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {podeAnalizar ? (
                    <Target className="h-4 w-4 text-purple-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm font-medium">3. Analisar</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receba análise completa da IA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Nova Análise
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para analisar sua redação jurídica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span>Título da redação</span>
                <span className="text-red-500">*</span>
                {statusPreenchimento.temTitulo && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </label>
              <Input
                placeholder="Ex: Análise sobre responsabilidade civil..."
                value={tituloRedacao}
                onChange={(e) => setTituloRedacao(e.target.value)}
                className={statusPreenchimento.temTitulo ? 'border-green-500' : ''}
              />
            </div>

            {/* Tipo de Redação */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tipo de redação:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tiposRedacao.map((tipo) => (
                  <Button
                    key={tipo.id}
                    variant={tipoRedacao === tipo.id ? "default" : "outline"}
                    onClick={() => setTipoRedacao(tipo.id as TipoRedacao)}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    {tipo.icon}
                    <div className="text-center">
                      <div className="font-medium text-sm">{tipo.label}</div>
                      <div className="text-xs opacity-70">{tipo.desc}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Status do Arquivo */}
            {arquivoUpload && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Arquivo carregado:</strong> {arquivoUpload.nome}
                  <br />
                  <span className="text-xs">Texto extraído automaticamente. Você pode editá-lo abaixo.</span>
                </AlertDescription>
              </Alert>
            )}

            {/* Área de Texto */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span>Texto da redação</span>
                <span className="text-red-500">*</span>
                {statusPreenchimento.temTexto && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </label>
              <Textarea
                placeholder="Digite ou cole seu texto aqui..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className={`min-h-[250px] resize-y ${statusPreenchimento.temTexto ? 'border-green-500' : ''}`}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {texto.length} caracteres • {texto.split(/\s+/).filter(word => word.length > 0).length} palavras
                </span>
              </div>
            </div>

            {/* Upload de Arquivo */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Ou faça upload de um arquivo PDF/imagem
                </p>
              </div>
              <FileUploadZone onFileUploaded={handleFileUploaded} />
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3 pt-4 border-t">
              <Button 
                onClick={handleAnalizar}
                disabled={!podeAnalizar || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando sua redação...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-5 w-5" />
                    Analisar Redação
                  </>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={handleBuscarDicas}
                  disabled={loading}
                  className="h-10"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Ver Dicas
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('historico')}
                  className="h-10"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para funcionalidades secundárias */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg">
            <TabsTrigger 
              value="historico" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dicas" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Dicas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analise" 
              disabled={!analiseRedacao}
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <HistoricoRedacao onReabrirAnalise={handleReabrirAnalise} />
          </TabsContent>

          {/* Tab Dicas */}
          <TabsContent value="dicas" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            {dicasRedacao ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Dicas para {tipoRedacao === 'dissertativa' ? 'Dissertação' : tipoRedacao === 'parecer' ? 'Parecer' : 'Peça Processual'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Estrutura */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Estrutura Ideal
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {dicasRedacao.estrutura}
                    </p>
                  </div>

                  <Separator />

                  {/* Dicas Práticas */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      Dicas Práticas
                    </h3>
                    <div className="space-y-2">
                      {dicasRedacao.dicas.map((dica, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="min-w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-relaxed">{dica}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Critérios */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Critérios de Avaliação
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dicasRedacao.criterios.map((criterio, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm font-medium text-green-700">{criterio}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Dicas Personalizadas</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Receba dicas específicas para o tipo de redação selecionado
                  </p>
                  <Button onClick={handleBuscarDicas} disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Buscar Dicas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Análise */}
          <TabsContent value="analise" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            {analiseRedacao ? (
              <div className="space-y-6">
                {/* Header da Análise */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          Análise Completa
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tituloRedacao} • {tiposRedacao.find(t => t.id === tipoRedacao)?.label}
                        </CardDescription>
                      </div>
                      <div className="flex items-center justify-center sm:justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Nota:</span>
                        <Badge className={`${getNota()?.cor} text-white text-lg px-3 py-1`}>
                          {analiseRedacao.nota}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Resumo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumo da Análise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {analiseRedacao.resumo}
                    </p>
                  </CardContent>
                </Card>

                {/* Pontos Fortes e Melhorias */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Pontos Fortes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analiseRedacao.pontos_fortes?.map((ponto, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{ponto}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        Sugestões de Melhoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analiseRedacao.melhorias?.map((melhoria, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{melhoria}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Ações */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button 
                        onClick={handleSalvarAnalise}
                        variant="outline"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                      <Button 
                        onClick={handleExportarPDF}
                        disabled={exporting}
                        variant="outline"
                      >
                        {exporting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Exportando...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar PDF
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={handleNovaAnalise}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <PenTool className="mr-2 h-4 w-4" />
                        Nova Análise
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma análise disponível</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Complete o formulário acima e clique em "Analisar Redação"
                  </p>
                  <Button onClick={() => setActiveTab('escrever')}>
                    <PenTool className="mr-2 h-4 w-4" />
                    Ir para Formulário
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Redacao;