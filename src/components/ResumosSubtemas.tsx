import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookText, ChevronRight } from 'lucide-react';
import type { SubtemaResumo } from '@/hooks/useResumosJuridicos';

interface ResumosSubtemasProps {
  tema: string;
  subtemas: SubtemaResumo[];
  onSubtemaClick: (subtema: SubtemaResumo) => void;
}

export const ResumosSubtemas = ({ tema, subtemas, onSubtemaClick }: ResumosSubtemasProps) => {
  if (subtemas.length === 0) {
    return (
      <div className="text-center py-12">
        <BookText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Nenhum subtema encontrado
        </h3>
        <p className="text-sm text-muted-foreground">
          Este tema ainda não possui subtemas organizados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do tema */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{tema}</h2>
        <p className="text-muted-foreground">
          {subtemas.length} {subtemas.length === 1 ? 'subtema disponível' : 'subtemas disponíveis'}
        </p>
      </div>

      {/* Lista de subtemas */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {subtemas.map((subtema, index) => (
          <motion.div
            key={subtema.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              delay: index * 0.1 
            }}
          >
            <Card 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/20"
              onClick={() => onSubtemaClick(subtema)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <BookText className="h-5 w-5 text-primary" />
                      {subtema.ordemSubtema && (
                        <Badge variant="secondary" className="text-xs">
                          #{subtema.ordemSubtema}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-3 line-clamp-2">
                      {subtema.subtema}
                    </h3>
                    
                    {/* Preview do resumo compacto */}
                    {subtema.resumoCompacto && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {subtema.resumoCompacto}
                      </p>
                    )}
                    
                    {/* Indicadores dos tipos de resumo disponíveis */}
                    <div className="flex flex-wrap gap-2">
                      {subtema.resumoCompacto && (
                        <Badge variant="outline" className="text-xs">
                          Compacto
                        </Badge>
                      )}
                      {subtema.resumoDetalhado && (
                        <Badge variant="outline" className="text-xs">
                          Detalhado
                        </Badge>
                      )}
                      {subtema.resumoStorytelling && (
                        <Badge variant="outline" className="text-xs">
                          Storytelling
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};