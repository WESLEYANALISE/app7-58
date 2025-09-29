import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight } from 'lucide-react';

interface LivroEstudos {
  id: number;
  area: string;
  ordem: string;
  tema: string;
  download: string;
  link: string;
  capaArea: string;
  capaAreaLink: string;
  capaLivro: string;
  capaLivroLink: string;
  sobre: string;
}

interface BibliotecaAreasEstudosProps {
  livrosPorArea: Record<string, LivroEstudos[]>;
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

export const BibliotecaAreasEstudos = ({ livrosPorArea, areas, onAreaClick }: BibliotecaAreasEstudosProps) => {
  if (areas.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Biblioteca em construção
        </h3>
        <p className="text-sm text-muted-foreground">
          Em breve teremos materiais disponíveis para estudo
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-0">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text-legal mb-2 sm:mb-4">
          📚 Biblioteca de Estudos Completa
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
          {Object.values(livrosPorArea).reduce((acc, livros) => acc + livros.length, 0)} materiais organizados em {areas.length} áreas do direito
        </p>
      </div>

      {/* Grid de áreas */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {areas.map((area, index) => {
          const livros = livrosPorArea[area] || [];
          const gradientColor = getAreaColor(area);
          const capaAreaLink = (livros.find(l => l.capaAreaLink && l.capaAreaLink.trim())?.capaAreaLink);
          
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
                <div className={`h-20 sm:h-24 lg:h-28 relative overflow-hidden`}>
                  {/* Background image com capa da área se disponível */}
                  {capaAreaLink && capaAreaLink.trim() ? (
                    <div className="absolute inset-0">
                      <img
                        src={capaAreaLink}
                        alt={area}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
                    </div>
                  ) : null}
                  <div className={`h-full bg-gradient-to-br ${gradientColor} relative ${capaAreaLink && capaAreaLink.trim() ? 'hidden' : ''}`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                  
                  <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white/80" />
                  </div>
                  <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs sm:text-sm">
                      {livros.length} {livros.length === 1 ? 'material' : 'materiais'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-5 lg:p-7">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg lg:text-xl text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {area}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
                        Explore nossa coleção de materiais em {area.toLowerCase()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </div>
                  
                  {/* Preview dos primeiros materiais */}
                  {livros.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex -space-x-1 sm:-space-x-2">
                      {livros.slice(0, 3).map((livro) => (
                        <div 
                          key={livro.id}
                          className="w-6 h-8 sm:w-7 sm:h-9 lg:w-8 lg:h-10 rounded shadow-sm border-2 border-background overflow-hidden"
                        >
                          {livro.capaLivroLink && livro.capaLivroLink.trim() ? (
                            <img
                              src={livro.capaLivroLink}
                              alt={livro.tema}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 ${livro.capaLivroLink && livro.capaLivroLink.trim() ? 'hidden' : ''}`} />
                        </div>
                      ))}
                      {livros.length > 3 && (
                        <div className="w-6 h-8 sm:w-7 sm:h-9 lg:w-8 lg:h-10 rounded shadow-sm border-2 border-background bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">+{livros.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};