import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, FileText, Image } from 'lucide-react';
import { AnaliseArquivo } from './types';

interface ConfirmacaoAnaliseProps {
  analise: AnaliseArquivo;
  arquivo: File;
  onConfirmar: () => void;
  onRecusar: () => void;
  loading?: boolean;
}

export const ConfirmacaoAnalise = ({ 
  analise, 
  arquivo, 
  onConfirmar, 
  onRecusar, 
  loading = false 
}: ConfirmacaoAnaliseProps) => {
  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 80) return 'bg-green-500';
    if (confianca >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfiancaIcon = (confianca: number) => {
    if (confianca >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (confianca >= 60) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
      <CardHeader className="text-center px-4 sm:px-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/20 to-blue-500/10 rounded-full">
            {arquivo.type === 'application/pdf' ? (
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            ) : (
              <Image className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            )}
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
          Análise do Material
        </CardTitle>
        <CardDescription className="text-muted-foreground/80 text-sm sm:text-base">
          Confirme se a interpretação está correta antes de gerar o plano
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-3 sm:p-4 bg-secondary/30 rounded-lg border border-border/40">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {arquivo.type === 'application/pdf' ? (
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
            ) : (
              <Image className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
            )}
            <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
              {arquivo.name}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getConfiancaIcon(analise.confianca)}
            <Badge variant="secondary" className="gap-1 text-xs">
              <div 
                className={`w-2 h-2 rounded-full ${getConfiancaColor(analise.confianca)}`}
              />
              {analise.confianca}% confiança
            </Badge>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-2">
              Assunto Identificado:
            </h4>
            <p className="text-xs sm:text-sm bg-primary/10 text-primary p-2 sm:p-3 rounded-lg border border-primary/20 break-words">
              {analise.assunto}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-2">
              Resumo do Conteúdo:
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed p-2 sm:p-3 bg-secondary/20 rounded-lg border border-border/30 break-words">
              {analise.resumo}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm mb-1">
                Confirme a Interpretação
              </h5>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                O material analisado corresponde ao que você pretendia estudar? 
                Confirme para gerar um plano de estudos personalizado baseado neste conteúdo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onRecusar}
            disabled={loading}
            className="flex-1 h-10 sm:h-auto text-xs sm:text-sm"
          >
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Não, tentar novamente</span>
            <span className="sm:hidden">Tentar novamente</span>
          </Button>
          <Button
            onClick={onConfirmar}
            disabled={loading}
            className="flex-1 h-10 sm:h-auto text-xs sm:text-sm"
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {loading ? 'Gerando...' : (
              <>
                <span className="hidden sm:inline">Sim, gerar plano</span>
                <span className="sm:hidden">Gerar plano</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};