import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookText, ChevronRight } from 'lucide-react';
import type { TemaResumo } from '@/hooks/useResumosJuridicos';

interface ResumosTemasProps {
  area: string;
  temas: Record<string, TemaResumo>;
  onTemaClick: (tema: string) => void;
}

export const ResumosTemas = ({ area, temas, onTemaClick }: ResumosTemasProps) => {
  const temasArray = Object.values(temas).sort((a, b) => (a.ordemTema || '').localeCompare(b.ordemTema || ''));

  if (temasArray.length === 0) {
    return (
      <div className="text-center py-12">
        <BookText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Nenhum tema encontrado
        </h3>
        <p className="text-sm text-muted-foreground">
          Esta área ainda não possui temas organizados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da área */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{area}</h2>
        <p className="text-muted-foreground">
          {temasArray.length} {temasArray.length === 1 ? 'tema disponível' : 'temas disponíveis'}
        </p>
      </div>

      {/* Lista de temas */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {temasArray.map((tema, index) => (
          <motion.div
            key={tema.tema}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              delay: index * 0.1 
            }}
          >
            <Card 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => onTemaClick(tema.tema)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <BookText className="h-5 w-5 text-primary" />
                      {tema.ordemTema && (
                        <Badge variant="secondary" className="text-xs">
                          #{tema.ordemTema}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {tema.tema}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {tema.subtemas.length} {tema.subtemas.length === 1 ? 'subtema' : 'subtemas'}
                    </p>
                    
                    {/* Preview dos primeiros subtemas */}
                    <div className="space-y-1">
                      {tema.subtemas.slice(0, 3).map((subtema) => (
                        <div key={subtema.id} className="text-xs text-muted-foreground truncate">
                          • {subtema.subtema}
                        </div>
                      ))}
                      {tema.subtemas.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          + {tema.subtemas.length - 3} mais...
                        </div>
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