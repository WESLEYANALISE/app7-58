import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Download, RefreshCw, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { PlanoEstudoGerado, AtividadeEstudo } from './types';

interface PlanoGeradoProps {
  plano: PlanoEstudoGerado;
  onNovoPlano: () => void;
  onExportarPDF: () => void;
}

export const PlanoGerado = ({ plano, onNovoPlano, onExportarPDF }: PlanoGeradoProps) => {
  const [atividadesConcluidas, setAtividadesConcluidas] = useState<Set<string>>(new Set());

  const toggleAtividade = (diaIndex: number, atividadeIndex: number) => {
    const key = `${diaIndex}-${atividadeIndex}`;
    const novasConcluidas = new Set(atividadesConcluidas);
    
    if (novasConcluidas.has(key)) {
      novasConcluidas.delete(key);
    } else {
      novasConcluidas.add(key);
    }
    
    setAtividadesConcluidas(novasConcluidas);
  };

  const getTipoIcon = (tipo: AtividadeEstudo['tipo']) => {
    switch (tipo) {
      case 'estudo': return <BookOpen className="h-4 w-4" />;
      case 'revisao': return <RefreshCw className="h-4 w-4" />;
      case 'exercicio': return <FileText className="h-4 w-4" />;
      case 'descanso': return <Clock className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTipoCor = (tipo: AtividadeEstudo['tipo']) => {
    switch (tipo) {
      case 'estudo': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'revisao': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'exercicio': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'descanso': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const totalAtividades = plano.cronograma.reduce((acc, dia) => acc + dia.atividades.length, 0);
  const atividadesCompletas = atividadesConcluidas.size;
  const progresso = totalAtividades > 0 ? (atividadesCompletas / totalAtividades) * 100 : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header com título e ações */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {plano.titulo}
              </CardTitle>
              <CardDescription className="mt-2 text-muted-foreground/80 text-sm">{plano.resumo}</CardDescription>
            </div>
            <div className="hidden md:flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={onNovoPlano} className="border-border/50 hover:bg-accent/50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
              <Button onClick={onExportarPDF} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso do Plano</span>
              <span>{atividadesCompletas}/{totalAtividades} atividades</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-primary to-primary/70 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

          {/* Cronograma */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Cronograma de Estudos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop View */}
          <div className="hidden md:block space-y-6">
            {plano.cronograma.map((dia, diaIndex) => (
              <div key={diaIndex} className="bg-gradient-to-r from-card/80 to-card/60 border border-border/50 rounded-lg p-4 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-bold">
                      Dia {dia.dia}
                    </span>
                  </h3>
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                    <Clock className="h-3 w-3 mr-1" />
                    {dia.tempoTotal}h total
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {dia.atividades.map((atividade, atividadeIndex) => {
                    const key = `${diaIndex}-${atividadeIndex}`;
                    const concluida = atividadesConcluidas.has(key);
                    
                    return (
                      <div 
                        key={atividadeIndex}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 ${
                          concluida 
                            ? 'bg-green-500/10 border-green-500/20 shadow-sm' 
                            : 'bg-card/40 border-border/30 hover:bg-card/60'
                        }`}
                      >
                        <Checkbox
                          checked={concluida}
                          onCheckedChange={() => toggleAtividade(diaIndex, atividadeIndex)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTipoCor(atividade.tipo)}`}>
                              {getTipoIcon(atividade.tipo)}
                              {atividade.tipo}
                            </span>
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                              {atividade.tempo}h
                            </span>
                          </div>
                          <h4 className={`font-medium text-sm ${concluida ? 'line-through text-muted-foreground' : ''}`}>
                            {atividade.titulo}
                          </h4>
                          <p className={`text-xs mt-1 ${concluida ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'}`}>
                            {atividade.descricao}
                          </p>
                        </div>
                        
                        {concluida && (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View with Accordion */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="space-y-2">
              {plano.cronograma.map((dia, diaIndex) => (
                <AccordionItem 
                  key={diaIndex} 
                  value={`dia-${diaIndex}`}
                  className="bg-gradient-to-r from-card/80 to-card/60 border border-border/50 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-bold">
                        Dia {dia.dia}
                      </span>
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                        <Clock className="h-3 w-3 mr-1" />
                        {dia.tempoTotal}h
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {dia.atividades.map((atividade, atividadeIndex) => {
                        const key = `${diaIndex}-${atividadeIndex}`;
                        const concluida = atividadesConcluidas.has(key);
                        
                        return (
                          <div 
                            key={atividadeIndex}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                              concluida 
                                ? 'bg-green-500/10 border-green-500/20 shadow-sm' 
                                : 'bg-card/40 border-border/30'
                            }`}
                          >
                            <Checkbox
                              checked={concluida}
                              onCheckedChange={() => toggleAtividade(diaIndex, atividadeIndex)}
                              className="mt-1"
                            />
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTipoCor(atividade.tipo)}`}>
                                  {getTipoIcon(atividade.tipo)}
                                  {atividade.tipo}
                                </span>
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                                  {atividade.tempo}h
                                </span>
                              </div>
                              <h4 className={`font-medium text-sm leading-tight ${concluida ? 'line-through text-muted-foreground' : ''}`}>
                                {atividade.titulo}
                              </h4>
                              <p className={`text-xs mt-1 leading-tight ${concluida ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'}`}>
                                {atividade.descricao}
                              </p>
                            </div>
                            
                            {concluida && (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Fixed Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/30 p-4 z-40">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onNovoPlano} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
          <Button onClick={onExportarPDF} className="flex-1 bg-gradient-to-r from-primary to-primary/80">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Dicas e Materiais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-yellow-500">💡</span>
              Dicas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plano.dicas.map((dica, index) => (
                <li key={index} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span className="text-foreground/90">{dica}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Materiais Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plano.materiais.map((material, index) => (
                <li key={index} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-secondary/5 border border-secondary/10">
                  <BookOpen className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{material}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};