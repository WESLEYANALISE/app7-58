import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Clock, FileText, Trash2, Download, Eye } from 'lucide-react';
import { useRedacaoHistory } from '@/hooks/useRedacaoHistory';
import { usePDFExport } from '@/hooks/usePDFExport';
import { AnaliseRedacao } from '@/hooks/useRedacao';

interface HistoricoRedacaoProps {
  onReabrirAnalise: (analise: any) => void;
}

export const HistoricoRedacao: React.FC<HistoricoRedacaoProps> = ({ onReabrirAnalise }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'dissertativa' | 'parecer' | 'peca'>('todos');
  
  const { loading, historico, excluirAnalise, buscarPorTipo, buscarHistorico } = useRedacaoHistory();
  const { exporting, exportarAnalise } = usePDFExport();

  const historicoFiltrado = historico.filter(item => {
    const matchSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.texto_original.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || item.tipo_redacao === filtroTipo;
    return matchSearch && matchTipo;
  });

  const handleFiltrarPorTipo = (tipo: 'todos' | 'dissertativa' | 'parecer' | 'peca') => {
    setFiltroTipo(tipo);
    if (tipo === 'todos') {
      buscarHistorico();
    } else {
      buscarPorTipo(tipo);
    }
  };

  const handleExportarPDF = async (item: any) => {
    const analiseRedacao: AnaliseRedacao = {
      resumo: item.analise?.resumo || 'Análise não disponível',
      nota: item.nota,
      pontos_fortes: item.pontos_fortes,
      melhorias: item.pontos_melhoria
    };

    await exportarAnalise(analiseRedacao, {
      titulo: item.titulo,
      tipo: item.tipo_redacao,
      textoOriginal: item.texto_original,
      pontosFortes: item.pontos_fortes,
      pontosMelhoria: item.pontos_melhoria
    });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'dissertativa': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'parecer': return 'bg-green-100 text-green-700 border-green-200';
      case 'peca': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getNotaColor = (nota: string) => {
    const notaNum = parseFloat(nota);
    if (notaNum >= 8) return 'text-green-600 font-bold';
    if (notaNum >= 6) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Análises
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filtroTipo === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFiltrarPorTipo('todos')}
            >
              Todos
            </Button>
            <Button 
              variant={filtroTipo === 'dissertativa' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFiltrarPorTipo('dissertativa')}
            >
              Dissertativa
            </Button>
            <Button 
              variant={filtroTipo === 'parecer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFiltrarPorTipo('parecer')}
            >
              Parecer
            </Button>
            <Button 
              variant={filtroTipo === 'peca' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFiltrarPorTipo('peca')}
            >
              Peça
            </Button>
          </div>
        </div>

        <Separator />

        {/* Lista do histórico */}
        <ScrollArea className="h-[400px]">
          {historicoFiltrado.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma análise encontrada</p>
              <p className="text-sm">Faça sua primeira análise para começar o histórico</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historicoFiltrado.map((item) => (
                <Card key={item.id} className="border border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-sm">{item.titulo}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getTipoColor(item.tipo_redacao)}>
                              {item.tipo_redacao}
                            </Badge>
                            <span className={`text-sm font-medium ${getNotaColor(item.nota)}`}>
                              Nota: {item.nota}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Preview do texto */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.texto_original.substring(0, 150)}...
                      </p>

                      {/* Estatísticas rápidas */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-green-600">✓ Pontos fortes: </span>
                          <span className="font-medium">{item.pontos_fortes.length}</span>
                        </div>
                        <div>
                          <span className="text-orange-600">⚠ Melhorias: </span>
                          <span className="font-medium">{item.pontos_melhoria.length}</span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReabrirAnalise(item)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportarPDF(item)}
                          disabled={exporting}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir análise?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A análise será permanentemente removida do seu histórico.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => excluirAnalise(item.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};