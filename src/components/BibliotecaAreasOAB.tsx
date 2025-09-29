import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from './OptimizedImage';
import { BookOpen } from 'lucide-react';

interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  Profissões?: string;
  'profissões-area'?: string;
  'capa-profissao'?: string;
}

interface BibliotecaAreasOABProps {
  livrosPorArea: Record<string, { livros: LivroJuridico[], profissao: string, capa: string | null }>;
  areasOAB: string[];
  onAreaClick: (area: string) => void;
}

export const BibliotecaAreasOAB = ({ 
  livrosPorArea, 
  areasOAB, 
  onAreaClick 
}: BibliotecaAreasOABProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-5">Áreas do Exame da Ordem - OAB</h2>
        <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">
          Escolha a área para ver os livros específicos para o exame da OAB
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-2 gap-6 sm:gap-7 md:gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {areasOAB.map((area, index) => {
          const areaData = livrosPorArea[area];
          const totalLivros = areaData?.livros.length || 0;
          
          return (
            <motion.div
              key={area}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden shadow-lg"
                onClick={() => onAreaClick(area)}
              >
                <CardContent className="p-6 sm:p-7 lg:p-8">
                  <div className="aspect-[3/4] mb-6 sm:mb-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 relative">
                    {areaData?.capa ? (
                      <OptimizedImage
                        src={areaData.capa}
                        alt={`Capa ${area}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-20 w-20 sm:h-24 sm:w-24 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-sm sm:text-base">
                        {totalLivros} {totalLivros === 1 ? 'livro' : 'livros'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-bold text-lg sm:text-xl lg:text-2xl line-clamp-2 group-hover:text-primary transition-colors">
                      {area}
                    </h3>
                    {areaData?.profissao && (
                      <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
                        {areaData.profissao}
                      </p>
                    )}
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