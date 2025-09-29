import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight } from 'lucide-react';

interface StandardLivro {
  id: number;
  imagem?: string;
  livro?: string;
  tema?: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  'capa-area'?: string;
  capaArea?: string;
  capaAreaLink?: string;
  'capa-livro'?: string;
  capaLivro?: string;
  capaLivroLink?: string;
}

interface StandardBibliotecaAreasProps {
  livrosPorArea: Record<string, StandardLivro[]>;
  areas: string[];
  onAreaClick: (area: string) => void;
  title?: string;
  subtitle?: string;
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

export const StandardBibliotecaAreas = ({ 
  livrosPorArea, 
  areas, 
  onAreaClick,
  title = "📚 Biblioteca Jurídica Completa",
  subtitle 
}: StandardBibliotecaAreasProps) => {
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

  const totalMateriais = Object.values(livrosPorArea).reduce((acc, livros) => acc + livros.length, 0);
  const defaultSubtitle = `${totalMateriais} materiais organizados em ${areas.length} áreas do direito`;

  return (
    <div className="px-2 sm:px-0">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-legal mb-3 sm:mb-5">
          {title}
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg lg:text-xl px-4">
          {subtitle || defaultSubtitle}
        </p>
      </div>

      {/* Grid de áreas */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 md:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {areas.map((area, index) => {
          const livros = livrosPorArea[area] || [];
          const gradientColor = getAreaColor(area);
          const firstBook = livros[0];
          
          // Buscar capa da área de diferentes propriedades
          const capaArea = firstBook?.['capa-area'] || 
                          firstBook?.capaArea || 
                          firstBook?.capaAreaLink ||
                          firstBook?.['Capa-area'];
          
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
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden shadow-lg"
                onClick={() => onAreaClick(area)}
              >
                {/* Header da área aumentado */}
                <div className={`h-24 sm:h-28 lg:h-32 relative overflow-hidden`}>
                  {/* Background image com capa da área se disponível */}
                  {capaArea && capaArea.trim() ? (
                    <div className="absolute inset-0">
                      <img
                        src={capaArea}
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
                  <div className={`h-full bg-gradient-to-br ${gradientColor} relative ${capaArea && capaArea.trim() ? 'hidden' : ''}`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                  
                  <div className="absolute top-3 sm:top-4 lg:top-5 right-3 sm:right-4 lg:right-5">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 text-white/80" />
                  </div>
                  <div className="absolute bottom-3 sm:bottom-4 lg:bottom-5 left-3 sm:left-4 lg:left-5">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-sm sm:text-base">
                      {livros.length} {livros.length === 1 ? 'material' : 'materiais'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-5 sm:p-6 lg:p-8">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {area}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
                        Explore nossa coleção de materiais em {area.toLowerCase()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
                  </div>
                  
                  {/* Preview dos primeiros materiais */}
                  {livros.length > 0 && (
                    <div className="mt-4 sm:mt-5 flex -space-x-1 sm:-space-x-2">
                      {livros.slice(0, 3).map((livro) => {
                        const capaLivro = livro.imagem || 
                                         livro['capa-livro'] || 
                                         livro.capaLivro || 
                                         livro.capaLivroLink ||
                                         (livro as any)['Capa-livro'];
                        
                        return (
                          <div 
                            key={livro.id}
                            className="w-7 h-9 sm:w-8 sm:h-11 lg:w-9 lg:h-12 rounded shadow-md border-2 border-background overflow-hidden"
                          >
                            {capaLivro ? (
                              <img
                                src={capaLivro}
                                alt={livro.livro || livro.tema || 'Material'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 ${capaLivro ? 'hidden' : ''}`} />
                          </div>
                        );
                      })}
                      {livros.length > 3 && (
                        <div className="w-7 h-9 sm:w-8 sm:h-11 lg:w-9 lg:h-12 rounded shadow-md border-2 border-background bg-muted flex items-center justify-center">
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