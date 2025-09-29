import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, FileText, Download, Trash2, Calendar } from 'lucide-react';
import { usePlanoEstudoHistory, PlanoEstudoHistorico } from '@/hooks/usePlanoEstudoHistory';
import { exportarPDF } from './ExportarPDF';
import { useToast } from '@/hooks/use-toast';

interface HistoricoPlanosProps {
  onReabrirPlano: (plano: PlanoEstudoHistorico) => void;
}

export const HistoricoPlanos = ({ onReabrirPlano }: HistoricoPlanosProps) => {
  const { history, removeFromHistory, clearHistory } = usePlanoEstudoHistory();
  const { toast } = useToast();

  const handleExportarPDF = async (plano: PlanoEstudoHistorico) => {
    try {
      await exportarPDF(plano);
      toast({
        title: "PDF exportado com sucesso!",
        description: "Plano baixado do histórico.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleRemoverPlano = (id: string) => {
    removeFromHistory(id);
    toast({
      title: "Plano removido",
      description: "O plano foi removido do histórico.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico de Planos
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Seus últimos {history.length} planos de estudo
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {history.map((plano) => (
            <div
              key={plano.id}
              className="flex items-center justify-between p-4 border border-border/30 rounded-lg bg-card/40 hover:bg-card/60 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{plano.titulo}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(plano.createdAt)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {plano.cronograma.length} dias
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReabrirPlano(plano)}
                  className="h-8 w-8 p-0"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExportarPDF(plano)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoverPlano(plano.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};