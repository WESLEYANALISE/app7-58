import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookText, ChevronRight } from 'lucide-react';
import type { TemaResumo } from '@/hooks/useResumosJuridicos';

interface ResumosAreasProps {
  resumosPorArea: Record<string, Record<string, TemaResumo>>;
  areas: string[];
  onAreaClick: (area: string) => void;
}

const getAreaColor = (area: string) => {
  const colors = {
    'Direito Civil': 'from-blue-500 to-blue-600',
    'Direito Penal': 'from-red-500 to-red-600',
    'Direito Constitucional': 'from-green-500 to-green-600',
    'Direito Administrativo': 'from-purple-500 to-purple-600',
    'Direito do Trabalho': 'from-orange-500 to-orange-600',
    'Direito Tributário': 'from-yellow-500 to-yellow-600',
    'Direito Empresarial': 'from-indigo-500 to-indigo-600',
    'Direito Ambiental': 'from-emerald-500 to-emerald-600',
    'Direito Internacional': 'from-cyan-500 to-cyan-600',
    'Processo Civil': 'from-blue-600 to-blue-700',
    'Processo Penal': 'from-red-600 to-red-700',
  };
  return colors[area as keyof typeof colors] || 'from-gray-500 to-gray-600';
};

export const ResumosAreas = ({ resumosPorArea, areas, onAreaClick }: ResumosAreasProps) => {
  if (areas.length === 0) {
    return (
      <div className="text-center py-12">
        <BookText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Resumos em construção
        </h3>
        <p className="text-sm text-muted-foreground">
          Em breve teremos resumos organizados disponíveis
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-0">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text-legal mb-2 sm:mb-4">
          📚 Resumos Jurídicos Organizados
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
          {Object.values(resumosPorArea).reduce((acc, temas) => 
            acc + Object.values(temas).reduce((temasAcc, tema) => temasAcc + tema.subtemas.length, 0), 0
          )} resumos organizados em {areas.length} áreas do direito
        </p>
      </div>

      {/* Grid de áreas */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {areas.map((area, index) => {
          const temas = resumosPorArea[area] || {};
          const totalResumos = Object.values(temas).reduce((acc, tema) => acc + tema.subtemas.length, 0);
          const gradientColor = getAreaColor(area);
          
          return (
            <motion.div
              key={area}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1 
              }}
            >
              <Card 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden"
                onClick={() => onAreaClick(area)}
              >
                <div className={`h-16 sm:h-20 lg:h-24 relative overflow-hidden bg-gradient-to-br ${gradientColor}`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                  
                  <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
                    <BookText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white/80" />
                  </div>
                  <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs sm:text-sm">
                      {totalResumos} {totalResumos === 1 ? 'resumo' : 'resumos'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {area}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {Object.keys(temas).length} {Object.keys(temas).length === 1 ? 'tema organizado' : 'temas organizados'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};