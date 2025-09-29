import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookText, FileText, Lightbulb, ScrollText, Download, Copy, GraduationCap } from 'lucide-react';
import type { SubtemaResumo } from '@/hooks/useResumosJuridicos';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useResumosPDFExport } from '@/hooks/useResumosPDFExport';
import { useToast } from '@/hooks/use-toast';


interface ResumosVisualizacaoProps {
  subtema: SubtemaResumo;
  area?: string;
  onClose: () => void;
}

type TipoResumo = 'detalhado' | 'storytelling' | 'compacto';

const tiposResumo = {
  detalhado: {
    label: 'Resumo Detalhado',
    icon: ScrollText,
    description: 'Versão completa com explicações aprofundadas',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  storytelling: {
    label: 'Resumo Storytelling',
    icon: Lightbulb,
    description: 'Versão narrativa para facilitar memorização',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  compacto: {
    label: 'Resumo Compacto',
    icon: FileText,
    description: 'Versão concisa e objetiva, ideal para revisão rápida',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
};

export const ResumosVisualizacao = ({ subtema, area = "Direito", onClose }: ResumosVisualizacaoProps) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoResumo>('detalhado');
  const { exportarResumo, exporting } = useResumosPDFExport();
  const { toast } = useToast();

  const getResumoContent = () => {
    switch (tipoSelecionado) {
      case 'detalhado':
        return subtema.resumoDetalhado;
      case 'storytelling':
        return subtema.resumoStorytelling;
      case 'compacto':
        return subtema.resumoCompacto;
      default:
        return subtema.resumoDetalhado;
    }
  };

  const handleCopyText = async () => {
    const content = getResumoContent();
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Texto copiado!",
        description: "O resumo foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    exportarResumo(subtema, area);
  };

  const tiposDisponiveis = Object.entries(tiposResumo).filter(([key]) => {
    switch (key) {
      case 'detalhado':
        return subtema.resumoDetalhado;
      case 'storytelling':
        return subtema.resumoStorytelling;
      case 'compacto':
        return subtema.resumoCompacto;
      default:
        return false;
    }
  });

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <BookText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold line-clamp-1">{subtema.subtema}</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="pt-14 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Título e informações */}
            <div className="text-center space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold">{subtema.subtema}</h1>
              {subtema.ordemSubtema && (
                <Badge variant="secondary" className="text-sm">
                  Ordem: {subtema.ordemSubtema}
                </Badge>
              )}
            </div>

            {/* Seletor de tipo de resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tiposDisponiveis.map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = tipoSelecionado === key;
                
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'border-2 border-primary bg-primary/10' 
                        : 'hover:shadow-md border hover:border-primary/20'
                    }`}
                    onClick={() => setTipoSelecionado(key as TipoResumo)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${config.color}`} />
                      <h3 className="font-semibold text-sm mb-1">{config.label}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {config.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Conteúdo do resumo */}
            <Card className="border-2 mb-20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = tiposResumo[tipoSelecionado].icon;
                    return <Icon className="h-6 w-6 text-primary" />;
                  })()}
                  {tiposResumo[tipoSelecionado].label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-gray max-w-none">
                  {getResumoContent() ? (
                    <MarkdownRenderer 
                      content={getResumoContent()} 
                      className="text-foreground leading-relaxed space-y-4"
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Este tipo de resumo não está disponível para este subtema.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-40">
        {/* PDF Export Button */}
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <Download className="h-5 w-5" />
        </Button>

        {/* Copy Text Button */}
        <Button
          onClick={handleCopyText}
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <Copy className="h-5 w-5" />
        </Button>
      </div>

    </div>
  );
};