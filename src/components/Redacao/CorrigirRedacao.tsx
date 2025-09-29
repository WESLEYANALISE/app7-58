import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, PenTool, Loader2, Upload, CheckCircle, AlertCircle, Star, FileText, Info, Sparkles, Target } from 'lucide-react';
import { useRedacao, TipoRedacao, AnaliseRedacao } from '@/hooks/useRedacao';
import { useRedacaoAprofundada, AnaliseRedacaoAprofundada, TipoRedacaoAprofundada } from '@/hooks/useRedacaoAprofundada';
import { useRedacaoHistory } from '@/hooks/useRedacaoHistory';
import { useRedacaoPDFExport } from '@/hooks/useRedacaoPDFExport';
import { FileUploadZone } from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';

interface CorrigirRedacaoProps {
  onVoltar: () => void;
}

export const CorrigirRedacao = ({ onVoltar }: CorrigirRedacaoProps) => {
  const { toast } = useToast();
  const [texto, setTexto] = useState('');
  const [tipoRedacao, setTipoRedacao] = useState<TipoRedacao>('dissertativa');
  const [arquivoUpload, setArquivoUpload] = useState<{ url: string; texto?: string; nome: string } | null>(null);
  const [tituloRedacao, setTituloRedacao] = useState('');
  const [etapaAtual, setEtapaAtual] = useState<'dados' | 'analise'>('dados');
  const [tipoAnalise, setTipoAnalise] = useState<'simples' | 'aprofundada'>('simples');
  
  const { 
    loading, 
    analiseRedacao, 
    analiseTecnica,
    error, 
    analisarRedacao, 
    analisarRedacaoTecnica,
    resetAnalise 
  } = useRedacao();

  const { 
    loading: loadingAprofundada, 
    analiseAprofundada, 
    error: errorAprofundada, 
    analisarRedacaoAprofundada, 
    resetAnalise: resetAnaliseAprofundada 
  } = useRedacaoAprofundada();
  
  const { salvarAnalise } = useRedacaoHistory();
  const { exportarAnalise, exporting } = useRedacaoPDFExport();

  const validarDados = () => {
    const temTexto = texto.trim() || arquivoUpload?.texto;
    const temTitulo = tituloRedacao.trim();
    
    if (!temTexto) {
      toast({
        title: "Texto obrigatório",
        description: "Digite sua redação ou faça upload de um arquivo.",
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
    
    if (tipoAnalise === 'aprofundada') {
      await analisarRedacaoAprofundada(textoParaAnalise, tipoRedacao as TipoRedacaoAprofundada);
    } else {
      await analisarRedacao(textoParaAnalise, tipoRedacao);
    }
    
    setEtapaAtual('analise');
  };

  const handleFileUploaded = (file: { url: string; texto?: string; nome: string }) => {
    setArquivoUpload(file);
    if (file.texto) {
      setTexto(file.texto);
    }
    if (!tituloRedacao) {
      setTituloRedacao(file.nome.replace(/\.[^/.]+$/, ''));
    }
    toast({
      title: "Arquivo carregado!",
      description: "O texto foi extraído e está pronto para análise.",
    });
  };

  const handleNovaAnalise = () => {
    resetAnalise();
    resetAnaliseAprofundada();
    setTexto('');
    setTituloRedacao('');
    setArquivoUpload(null);
    setEtapaAtual('dados');
    setTipoAnalise('simples');
  };

  const tiposRedacao = [
    { id: 'dissertativa', label: 'Dissertação', desc: 'Texto argumentativo', icon: <PenTool className="h-4 w-4" />, color: 'from-purple-500 to-blue-600' },
    { id: 'parecer', label: 'Parecer', desc: 'Análise técnica', icon: <FileText className="h-4 w-4" />, color: 'from-indigo-500 to-purple-600' },
    { id: 'peca', label: 'Peça', desc: 'Petição/Contestação', icon: <Target className="h-4 w-4" />, color: 'from-red-500 to-pink-600' }
  ];

  const statusPreenchimento = {
    temTitulo: Boolean(tituloRedacao.trim()),
    temTexto: Boolean(texto.trim() || arquivoUpload?.texto)
  };

  const podeAnalizar = statusPreenchimento.temTitulo && statusPreenchimento.temTexto;
  const isLoading = loading || loadingAprofundada;
  const currentError = error || errorAprofundada;
  const currentAnalise = analiseAprofundada || analiseRedacao;

  const getNota = () => {
    const nota = currentAnalise?.nota ? parseFloat(currentAnalise.nota) : null;
    if (!nota) return null;
    
    if (nota >= 9) return { cor: 'from-emerald-500 to-green-600', texto: 'Excelente', emoji: '🏆' };
    if (nota >= 7) return { cor: 'from-blue-500 to-indigo-600', texto: 'Bom', emoji: '👍' };
    if (nota >= 5) return { cor: 'from-yellow-500 to-orange-600', texto: 'Regular', emoji: '⚡' };
    return { cor: 'from-red-500 to-pink-600', texto: 'Precisa melhorar', emoji: '💪' };
  };

  const handleExportPDF = () => {
    if (!currentAnalise) return;
    
    const dadosExport = {
      titulo: tituloRedacao,
      tipo: tipoRedacao,
      texto_original: arquivoUpload?.texto || texto,
      analise: currentAnalise,
      analise_tecnica: analiseAprofundada?.analise_tecnica,
      nota: parseFloat(currentAnalise.nota || '0'),
      pontos_fortes: currentAnalise.pontos_fortes || [],
      pontos_melhoria: currentAnalise.melhorias || []
    };
    
    exportarAnalise(dadosExport);
  };

  if (etapaAtual === 'analise' && currentAnalise) {
    const nota = getNota();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header Minimalista */}
        <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onVoltar}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Análise Completa</h1>
                <p className="text-xs text-slate-400">{tituloRedacao}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exporting}
                className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {exporting ? 'Gerando...' : 'Exportar PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNovaAnalise}
                className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
              >
                Nova Análise
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo da Análise */}
        <div className="p-4 max-w-4xl mx-auto space-y-6">
          {currentError && (
            <Alert className="bg-red-900/20 border-red-500/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentError}</AlertDescription>
            </Alert>
          )}

          {/* Card da Nota */}
          {nota && (
            <Card className="bg-gradient-to-r ${nota.cor} p-6 border-0 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">{currentAnalise.nota}/10</div>
                  <div className="text-lg opacity-90">{nota.texto} {nota.emoji}</div>
                </div>
                <div className="text-5xl opacity-80">{nota.emoji}</div>
              </div>
            </Card>
          )}

          {/* Resumo da Análise */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <Info className="h-5 w-5 text-blue-400" />
                Resumo da Análise
              </h3>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {currentAnalise.resumo}
              </div>
            </div>
          </Card>

          {/* Grid de Pontos Fortes e Melhorias */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pontos Fortes */}
            {currentAnalise.pontos_fortes && currentAnalise.pontos_fortes.length > 0 && (
              <Card className="bg-emerald-900/20 backdrop-blur-sm border-emerald-500/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-300">
                    <CheckCircle className="h-5 w-5" />
                    Pontos Fortes
                  </h3>
                  <div className="space-y-3">
                    {currentAnalise.pontos_fortes.map((ponto, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-emerald-900/20 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <p className="text-emerald-100 text-sm leading-relaxed">{ponto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Pontos de Melhoria */}
            {currentAnalise.melhorias && currentAnalise.melhorias.length > 0 && (
              <Card className="bg-amber-900/20 backdrop-blur-sm border-amber-500/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-300">
                    <Target className="h-5 w-5" />
                    Oportunidades de Melhoria
                  </h3>
                  <div className="space-y-3">
                    {currentAnalise.melhorias.map((melhoria, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-900/20 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <p className="text-amber-100 text-sm leading-relaxed">{melhoria}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Análise Técnica Aprofundada (apenas se disponível) */}
          {analiseAprofundada?.analise_tecnica && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-gradient bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                📊 Análise Técnica Aprofundada
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Legislação Relacionada */}
                {analiseAprofundada.analise_tecnica.legislacaoRelacionada.length > 0 && (
                  <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-500/30">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-300">
                        ⚖️ Legislação Relacionada
                      </h3>
                      <div className="space-y-2">
                        {analiseAprofundada.analise_tecnica.legislacaoRelacionada.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1 text-sm">•</span>
                            <p className="text-blue-100 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Jurisprudência */}
                {analiseAprofundada.analise_tecnica.jurisprudenciaRelevante.length > 0 && (
                  <Card className="bg-purple-900/20 backdrop-blur-sm border-purple-500/30">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-300">
                        🏛️ Jurisprudência
                      </h3>
                      <div className="space-y-2">
                        {analiseAprofundada.analise_tecnica.jurisprudenciaRelevante.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1 text-sm">•</span>
                            <p className="text-purple-100 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Impactos Práticos */}
                {analiseAprofundada.analise_tecnica.impactosPraticos.length > 0 && (
                  <Card className="bg-teal-900/20 backdrop-blur-sm border-teal-500/30">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-teal-300">
                        🎯 Impactos Práticos
                      </h3>
                      <div className="space-y-2">
                        {analiseAprofundada.analise_tecnica.impactosPraticos.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-teal-400 mt-1 text-sm">•</span>
                            <p className="text-teal-100 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Recomendações Técnicas */}
                {analiseAprofundada.analise_tecnica.recomendacoesTecnicas.length > 0 && (
                  <Card className="bg-rose-900/20 backdrop-blur-sm border-rose-500/30">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-rose-300">
                        💡 Recomendações Técnicas
                      </h3>
                      <div className="space-y-2">
                        {analiseAprofundada.analise_tecnica.recomendacoesTecnicas.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-rose-400 mt-1 text-sm">•</span>
                            <p className="text-rose-100 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Minimalista */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onVoltar}
            className="text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <PenTool className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Corrigir Redação</h1>
              <p className="text-xs text-slate-400">Análise inteligente com IA</p>
            </div>
          </div>

          <div className="w-20"> {/* Espaçador */}</div>
        </div>
      </div>

      {/* Conteúdo Principal */}
        <div className="p-4 max-w-4xl mx-auto space-y-6">
          {currentError && (
            <Alert className="bg-red-900/20 border-red-500/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentError}</AlertDescription>
            </Alert>
          )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            statusPreenchimento.temTitulo ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {statusPreenchimento.temTitulo ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
            )}
            <span className="text-sm font-medium">Título</span>
          </div>
          
          <div className={`w-12 h-0.5 transition-all duration-300 ${
            statusPreenchimento.temTitulo ? 'bg-emerald-400' : 'bg-slate-600'
          }`} />
          
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            statusPreenchimento.temTexto ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {statusPreenchimento.temTexto ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
            )}
            <span className="text-sm font-medium">Texto</span>
          </div>
          
          <div className={`w-12 h-0.5 transition-all duration-300 ${
            podeAnalizar ? 'bg-emerald-400' : 'bg-slate-600'
          }`} />
          
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            podeAnalizar ? 'text-purple-400' : 'text-slate-400'
          }`}>
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Analisar</span>
          </div>
        </div>

        {/* Formulário */}
        <div className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título da redação *
            </label>
            <Input
              placeholder="Ex: Análise sobre responsabilidade civil..."
              value={tituloRedacao}
              onChange={(e) => setTituloRedacao(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          {/* Tipo de Redação com cores melhoradas */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Tipo de redação
            </label>
            <div className="grid grid-cols-3 gap-3">
              {tiposRedacao.map((tipo) => (
                <Button
                  key={tipo.id}
                  variant={tipoRedacao === tipo.id ? "default" : "outline"}
                  onClick={() => setTipoRedacao(tipo.id as TipoRedacao)}
                  className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                    tipoRedacao === tipo.id
                      ? `bg-gradient-to-br ${tipo.color} text-white border-0 scale-105 shadow-lg`
                      : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                  }`}
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

          {/* Tipo de Análise */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Tipo de análise
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={tipoAnalise === 'simples' ? "default" : "outline"}
                onClick={() => setTipoAnalise('simples')}
                className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                  tipoAnalise === 'simples'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 scale-105 shadow-lg'
                    : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <Sparkles className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">Análise Simples</div>
                  <div className="text-xs opacity-70">🚀 Rápida e eficiente</div>
                </div>
              </Button>
              
              <Button
                variant={tipoAnalise === 'aprofundada' ? "default" : "outline"}
                onClick={() => setTipoAnalise('aprofundada')}
                className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                  tipoAnalise === 'aprofundada'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 scale-105 shadow-lg'
                    : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <FileText className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">Análise Técnica</div>
                  <div className="text-xs opacity-70">⚖️ Com legislação</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Texto da Redação */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Texto da redação *
            </label>
            
            {/* Textarea Principal */}
            <Textarea
              placeholder="Cole ou digite sua redação aqui..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="min-h-[200px] bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 mb-4"
            />
            
            {/* Upload de Arquivo - Melhorado */}
            <div className="border border-slate-600 rounded-lg bg-slate-800/30">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-300">Ou envie um arquivo</div>
                    <div className="text-sm text-slate-400">PDF, DOC, DOCX ou imagem até 10MB</div>
                  </div>
                </div>
                
                <FileUploadZone onFileUploaded={handleFileUploaded} disabled={isLoading} />
              </div>
            </div>
            
            {arquivoUpload && (
              <Alert className="mt-3 bg-emerald-900/20 border-emerald-500/50 text-emerald-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Arquivo carregado:</strong> {arquivoUpload.nome}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Botão Analisar */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleAnalizar}
              disabled={!podeAnalizar || isLoading}
              className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
                podeAnalizar 
                  ? `bg-gradient-to-r ${tipoAnalise === 'aprofundada' ? 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500' : 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'} text-white shadow-2xl hover:scale-105` 
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {tipoAnalise === 'aprofundada' ? 'Fazendo análise técnica...' : 'Analisando...'}
                </>
              ) : (
                <>
                  {tipoAnalise === 'aprofundada' ? <FileText className="h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                  {tipoAnalise === 'aprofundada' ? 'Análise Técnica Completa' : 'Analisar Redação'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
          {/* Progress indicator melhorado */}
          {isLoading && (
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                  <div>
                    <p className="font-medium text-slate-200">
                      {tipoAnalise === 'aprofundada' ? 'Fazendo análise técnica aprofundada...' : 'Analisando sua redação...'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {tipoAnalise === 'aprofundada' 
                        ? 'Buscando legislação, jurisprudência e fazendo análise completa'
                        : 'Avaliando estrutura, argumentação e linguagem jurídica'
                      }
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">Estrutura</div>
                    <CheckCircle className="h-4 w-4 mx-auto text-green-500" />
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">Argumentação</div>
                    <Loader2 className="h-4 w-4 mx-auto animate-spin text-blue-500" />
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">Fundamentação</div>
                    <Loader2 className="h-4 w-4 mx-auto animate-spin text-purple-500" />
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">
                      {tipoAnalise === 'aprofundada' ? 'Legislação' : 'Linguagem'}
                    </div>
                    <Loader2 className="h-4 w-4 mx-auto animate-spin text-yellow-500" />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
  );
};