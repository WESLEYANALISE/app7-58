import { useState, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Search, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useForaDaToga } from '@/hooks/useForaDaToga';
import { BibliotecaAreas } from './BibliotecaAreas';
import { BibliotecaLista } from './BibliotecaLista';
import { BibliotecaLeitor } from './BibliotecaLeitor';
import { Input } from '@/components/ui/input';
import { JuridicalBookCard } from './JuridicalBookCard';
import { MobileBookCard } from './MobileBookCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the ProductCarousel
const LazyProductCarousel = lazy(() => import('./ProductCarousel'));

interface LivroForaDaToga {
  id: number;
  imagem: string; // Mapeado de capa-livro
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  'capa-livro'?: string;
  'capa-area'?: string;
}

type ViewMode = 'areas' | 'lista' | 'leitor' | 'busca';

export const BibliotecaForaDaToga = () => {
  const { setCurrentFunction } = useNavigation();
  const { data: livros, isLoading, error } = useForaDaToga();
  const [viewMode, setViewMode] = useState<ViewMode>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroForaDaToga | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Organizar livros por área
  const livrosPorArea = livros?.reduce((acc, livro) => {
    const area = livro.area || 'Outras';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(livro as LivroForaDaToga);
    return acc;
  }, {} as Record<string, LivroForaDaToga[]>) || {};

  const areas = Object.keys(livrosPorArea).sort();

  const handleBack = () => {
    if (viewMode === 'leitor') {
      setViewMode('lista');
      setSelectedBook(null);
    } else if (viewMode === 'lista') {
      setViewMode('areas');
      setSelectedArea(null);
    } else if (viewMode === 'busca') {
      setViewMode('areas');
      setSearchTerm('');
    } else {
      setCurrentFunction(null);
    }
  };

  const handleAreaClick = (area: string) => {
    setSelectedArea(area);
    setViewMode('lista');
  };

  const handleBookClick = (livro: LivroForaDaToga) => {
    setSelectedBook(livro);
    setViewMode('leitor');
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      setViewMode('busca');
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'areas':
        return 'Fora da Toga';
      case 'lista':
        return selectedArea || 'Lista de Livros';
      case 'leitor':
        return selectedBook?.livro || 'Leitor';
      case 'busca':
        return `Busca: "${searchTerm}"`;
      default:
        return 'Fora da Toga';
    }
  };

  // Filtrar livros por busca global
  const filteredBooks = searchTerm
    ? (livros || []).filter(livro => 
        livro.livro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livro.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (livro.autor && livro.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (livro.sobre && livro.sobre.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  if (error) {
    return (
      <div className="fixed inset-0 bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFunction(null)}
              className="flex items-center gap-2 hover:bg-accent/80"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Fora da Toga</h1>
          </div>
        </div>
        
        <div className="pt-14 h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar a biblioteca</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Leitor em tela cheia
  if (viewMode === 'leitor' && selectedBook) {
    return (
      <AnimatePresence mode="wait">
        <BibliotecaLeitor
          livro={selectedBook}
          onClose={handleBack}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="fixed inset-0 bg-background">
      {/* Header Consistente */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            {viewMode === 'lista' ? 'Áreas' : 'Voltar'}
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="pt-14 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Barra de busca global - só nas áreas */}
          {viewMode === 'areas' && (
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar em toda a biblioteca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'areas' && (
                <motion.div
                  key="areas"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Descrição da biblioteca */}
                  <div className="text-center mb-8">
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Descubra uma coleção especial de livros que vão além do mundo jurídico. 
                      Literatura, desenvolvimento pessoal, e muito mais para enriquecer sua jornada.
                    </p>
                  </div>
                  
                  <BibliotecaAreas
                    livrosPorArea={livrosPorArea}
                    areas={areas}
                    onAreaClick={handleAreaClick}
                  />
                </motion.div>
              )}

              {viewMode === 'lista' && selectedArea && (
                <motion.div
                  key="lista"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BibliotecaLista
                    area={selectedArea}
                    livros={livrosPorArea[selectedArea] || []}
                    onBack={handleBack}
                    onBookClick={handleBookClick}
                  />
                </motion.div>
              )}

              {viewMode === 'busca' && (
                <motion.div
                  key="busca"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-4">
                      Resultados da busca "{searchTerm}"
                    </h2>
                    {filteredBooks.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                          Nenhum livro encontrado
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tente buscar com outros termos ou verifique a ortografia
                        </p>
                      </div>
                    ) : (
                      <motion.div 
                        className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {filteredBooks.map((livro) => (
                          <motion.div
                            key={livro.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isMobile ? (
                              <MobileBookCard 
                                livro={livro} 
                                onClick={() => handleBookClick(livro)}
                              />
                            ) : (
                              <JuridicalBookCard 
                                livro={livro} 
                                showAreaBadge={true}
                                onClick={() => handleBookClick(livro)}
                              />
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};