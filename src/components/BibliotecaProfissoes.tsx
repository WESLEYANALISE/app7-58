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

interface BibliotecaProfissoesProps {
  livrosPorProfissao: Record<string, { livros: LivroJuridico[], area: string, capa: string | null }>;
  profissoes: string[];
  onProfissaoClick: (profissao: string) => void;
}

export const BibliotecaProfissoes = ({ 
  livrosPorProfissao, 
  profissoes, 
  onProfissaoClick 
}: BibliotecaProfissoesProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Profissões de Concurso Público</h2>
        <p className="text-muted-foreground">
          Escolha a profissão para ver os livros específicos para aquele concurso
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {profissoes.map((profissao, index) => {
          const profissaoData = livrosPorProfissao[profissao];
          const totalLivros = profissaoData?.livros.length || 0;
          
          return (
            <motion.div
              key={profissao}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
                onClick={() => onProfissaoClick(profissao)}
              >
                <CardContent className="p-4">
                  <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 relative">
                    {profissaoData?.capa ? (
                      <OptimizedImage
                        src={profissaoData.capa}
                        alt={`Capa ${profissao}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {totalLivros} {totalLivros === 1 ? 'livro' : 'livros'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {profissao}
                    </h3>
                    {profissaoData?.area && profissaoData.area !== profissao && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {profissaoData.area}
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