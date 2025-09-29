import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { usePlanoEstudo } from '@/hooks/usePlanoEstudo';
import { FormularioPlano } from './FormularioPlano';
import { PlanoGerado } from './PlanoGerado';
import { HistoricoPlanos } from './HistoricoPlanos';
import { ConfirmacaoAnalise } from './ConfirmacaoAnalise';
import { exportarPDF } from './ExportarPDF';
import { useToast } from '@/hooks/use-toast';

export const PlanoEstudo = () => {
  const { setCurrentFunction } = useNavigation();
  const { 
    loading, 
    loadingAnalise,
    planoGerado, 
    analiseArquivo,
    dadosFormulario,
    error, 
    gerarPlano, 
    confirmarAnalise,
    recusarAnalise,
    resetPlano, 
    loadPlano 
  } = usePlanoEstudo();
  const { toast } = useToast();

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const handleExportarPDF = async () => {
    if (!planoGerado) return;
    
    try {
      await exportarPDF(planoGerado);
      toast({
        title: "PDF exportado com sucesso!",
        description: "Seu plano de estudos foi baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Header Consistente */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Plano de Estudo</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pt-14 h-full overflow-auto">
        <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg backdrop-blur-sm">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          
          {/* Tela de confirmação de análise */}
          {analiseArquivo && dadosFormulario?.arquivo ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <ConfirmacaoAnalise
                analise={analiseArquivo}
                arquivo={dadosFormulario.arquivo}
                onConfirmar={confirmarAnalise}
                onRecusar={recusarAnalise}
                loading={loading}
              />
            </div>
          ) : !planoGerado ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <FormularioPlano onSubmit={gerarPlano} loading={loading || loadingAnalise} />
              <HistoricoPlanos onReabrirPlano={loadPlano} />
            </div>
          ) : (
            <PlanoGerado 
              plano={planoGerado} 
              onNovoPlano={resetPlano}
              onExportarPDF={handleExportarPDF}
            />
          )}
          
          {/* Loading Overlay para análise */}
          {loadingAnalise && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-xl animate-fade-in">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Analisando material</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Estou processando seu arquivo para entender o conteúdo...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading Overlay para geração do plano */}
          {loading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-xl animate-fade-in">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Gerando seu plano de estudos</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nossa IA está criando um plano personalizado para você...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};