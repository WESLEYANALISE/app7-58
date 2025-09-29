import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, User, Search, Filter, X } from 'lucide-react';
import { useSearchHighlight } from '@/hooks/useSearchHighlight';
import { useNavigate } from 'react-router-dom';

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

interface StandardBibliotecaListaProps {
  area: string;
  livros: StandardLivro[];
  onBack: () => void;
  onBookClick: (livro: StandardLivro) => void;
}

export const StandardBibliotecaLista = ({
  area,
  livros,
  onBack,
  onBookClick
}: StandardBibliotecaListaProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'estudos' | 'alfabetica'>('estudos');
  const [previewBook, setPreviewBook] = useState<StandardLivro | null>(null);
  const navigate = useNavigate();
  
  // Sistema de highlight para itens vindos da busca global
  const { shouldHighlightItem, highlightAndScrollToItem } = useSearchHighlight();

  // Filtrar e ordenar livros
  const filteredAndSortedBooks = useMemo(() => {
    const getTitulo = (livro: StandardLivro) => livro.livro || livro.tema || '';
    
    let filtered = livros.filter(livro => {
      const titulo = getTitulo(livro).toLowerCase();
      const autor = (livro.autor || '').toLowerCase();
      const sobre = (livro.sobre || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return titulo.includes(searchLower) || 
             autor.includes(searchLower) || 
             sobre.includes(searchLower);
    });

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'estudos') {
        // Ordenar por ID (ordem de estudos/sequência)
        return a.id - b.id;
      } else {
        // Ordenar alfabeticamente por título
        return getTitulo(a).localeCompare(getTitulo(b));
      }
    });
    return filtered;
  }, [livros, searchTerm, sortBy]);

  const getCapaArea = (livro: StandardLivro) => {
    return livro['capa-area'] || 
           livro.capaArea || 
           livro.capaAreaLink ||
           (livro as any)['Capa-area'];
  };

  const getCapaLivro = (livro: StandardLivro) => {
    return livro.imagem || 
           livro['capa-livro'] || 
           livro.capaLivro || 
           livro.capaLivroLink ||
           (livro as any)['Capa-livro'];
  };

  const getTitulo = (livro: StandardLivro) => {
    return livro.livro || livro.tema || 'Material';
  };

  return (
    <div className="px-2 sm:px-0">
      <div className="space-y-4 sm:space-y-6">
        {/* Header da área com capa */}
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-xl">
          {getCapaArea(livros[0]) ? (
            <img 
              src={getCapaArea(livros[0])!} 
              alt={area}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-64 bg-gradient-to-br from-secondary/20 to-secondary/30 flex items-center justify-center ${getCapaArea(livros[0]) ? 'hidden' : ''}`}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{area}</h2>
              <p className="text-white/80">Biblioteca Jurídica</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2 line-clamp-2">{area}</h1>
            <p className="text-white/80 mb-4">
              {filteredAndSortedBooks.length} {filteredAndSortedBooks.length === 1 ? 'material disponível' : 'materiais disponíveis'}
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="space-y-3 sm:space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por título, autor ou descrição..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 h-11" 
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'estudos' | 'alfabetica')} 
              className="bg-background border border-border rounded px-3 py-2 text-sm flex-1 sm:flex-none"
            >
              <option value="estudos">Ordem de estudos</option>
              <option value="alfabetica">Ordem alfabética</option>
            </select>
          </div>
        </div>

        {/* Lista de livros */}
        {filteredAndSortedBooks.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhum material encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente buscar com outros termos ou verifique a ortografia
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedBooks.map((livro, index) => {
              const cardRef = useRef<HTMLDivElement>(null);
              const shouldHighlight = shouldHighlightItem(livro.id, getTitulo(livro));
              
              // Adicionar highlight se necessário
              useEffect(() => {
                if (shouldHighlight && cardRef.current) {
                  highlightAndScrollToItem(cardRef.current, 1500 + (index * 100));
                }
              }, [shouldHighlight]);
              
              return (
                <motion.div
                  key={livro.id}
                  ref={cardRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary overflow-hidden shadow-md ${shouldHighlight ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                    onClick={() => {
                      const adapted = {
                        id: livro.id,
                        imagem: getCapaLivro(livro) || '',
                        livro: getTitulo(livro),
                        autor: livro.autor,
                        area,
                        sobre: livro.sobre,
                        link: livro.link,
                        download: livro.download,
                      };
                      navigate(`/book/${livro.id}`, { state: { book: adapted } });
                    }}
                  >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-4 sm:gap-5">
                      {/* Imagem do livro - responsiva e maior */}
                      <div className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 relative overflow-hidden rounded-lg shadow-lg">
                        {getCapaLivro(livro) ? (
                          <img 
                            src={getCapaLivro(livro)!} 
                            alt={getTitulo(livro)} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Conteúdo - responsivo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <div className="flex-1 pr-2 sm:pr-4">
                            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                              {getTitulo(livro)}
                            </h3>
                            
                            {livro.autor && (
                              <div className="flex items-center gap-1 text-muted-foreground mb-2">
                                <User className="h-4 w-4" />
                                <span className="text-sm sm:text-base truncate">{livro.autor}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Descrição - responsiva */}
                        {livro.sobre && (
                          <div className="mb-3 sm:mb-4">
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-2">
                              {livro.sobre}
                            </p>
                          </div>
                        )}
                        
                        {/* Call to action - responsivo */}
                        <div className="flex items-center justify-end">
                          <div className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                            <span className="text-sm font-semibold">Abrir livro</span>
                            <BookOpen className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setPreviewBook(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg max-w-xs sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="pr-4 flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 line-clamp-2">
                      {getTitulo(previewBook)}
                    </h2>
                    {previewBook.autor && (
                      <p className="text-sm sm:text-base text-muted-foreground truncate">
                        Autor: {previewBook.autor}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setPreviewBook(null)} 
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  <div className="w-32 h-44 sm:w-40 sm:h-56 flex-shrink-0 rounded-lg overflow-hidden shadow-xl mx-auto sm:mx-0">
                    {getCapaLivro(previewBook) ? (
                      <img 
                        src={getCapaLivro(previewBook)!} 
                        alt={getTitulo(previewBook)} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {previewBook.sobre && (
                      <div className="mb-6">
                        <h3 className="text-lg sm:text-xl font-bold mb-3">Sobre o livro</h3>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {previewBook.sobre}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
                      <Button
                        onClick={() => {
                          onBookClick(previewBook);
                          setPreviewBook(null);
                        }}
                        className="text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-semibold"
                      >
                        Ler agora
                      </Button>
                      {previewBook.download && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(previewBook.download!, '_blank')}
                          className="text-sm sm:text-base border-2 border-muted-foreground/20 hover:bg-muted/50 py-3 px-6 rounded-lg font-semibold"
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};