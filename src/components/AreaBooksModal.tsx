import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List, Filter } from 'lucide-react';
import { JuridicalBookCard } from './JuridicalBookCard';
import { motion, AnimatePresence } from 'framer-motion';

interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
}

interface AreaBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: string;
  livros: LivroJuridico[];
}

export const AreaBooksModal = ({ isOpen, onClose, area, livros }: AreaBooksModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'titulo' | 'autor'>('titulo');

  // Filtrar e ordenar livros
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = livros.filter(livro => 
      livro.livro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (livro.autor && livro.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (livro.sobre && livro.sobre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'titulo') {
        return a.livro.localeCompare(b.livro);
      } else {
        return (a.autor || '').localeCompare(b.autor || '');
      }
    });

    return filtered;
  }, [livros, searchTerm, sortBy]);

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {area}
          </DialogTitle>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge variant="outline">{filteredAndSortedBooks.length} livros</Badge>
          </div>
        </DialogHeader>

        {/* Controles */}
        <div className="flex-shrink-0 space-y-4 border-b border-border pb-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, autor ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Controles de visualização */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'titulo' | 'autor')}
                className="bg-background border border-border rounded px-3 py-1 text-sm"
              >
                <option value="titulo">Ordenar por Título</option>
                <option value="autor">Ordenar por Autor</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de livros */}
        <div className="flex-1 overflow-y-auto">
          {filteredAndSortedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhum livro encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Tente buscar com outros termos ou verifique a ortografia
              </p>
            </div>
          ) : (
            <motion.div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1'
                  : 'space-y-4 p-1'
              }
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredAndSortedBooks.map((livro) => (
                  <motion.div
                    key={livro.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.2,
                      layout: { duration: 0.3 }
                    }}
                  >
                    <JuridicalBookCard 
                      livro={livro} 
                      showAreaBadge={false}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};