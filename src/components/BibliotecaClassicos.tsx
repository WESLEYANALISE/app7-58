
import { useState, Suspense, lazy, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Search, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useProdutos } from '@/hooks/useProdutos';
import { StandardBibliotecaAreas } from './StandardBibliotecaAreas';
import { StandardBibliotecaLista } from './StandardBibliotecaLista';
import { StandardBibliotecaLeitor } from './StandardBibliotecaLeitor';
import { SearchPreviewBar } from './SearchPreviewBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the ProductCarousel
const LazyProductCarousel = lazy(() => import('./ProductCarousel'));

interface LivroClassico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  beneficios?: string;
}

type ViewMode = 'areas' | 'lista' | 'leitor';

export const BibliotecaClassicos = () => {
  const { setCurrentFunction } = useNavigation();
  const { data: livros, isLoading, error } = useProdutos();
  const [viewMode, setViewMode] = useState<ViewMode>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroClassico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Verificar se há navegação específica vinda da busca global
  useEffect(() => {
    const checkNavigationContext = () => {
      const contextData = sessionStorage.getItem('navigationContext');
      if (contextData) {
        try {
          const context = JSON.parse(contextData);
          if (context.itemTitle && context.highlightItem && livros) {
            // Buscar o livro específico pelo título
            const foundBook = livros.find((livro: any) => 
              livro.livro?.toLowerCase().includes(context.itemTitle.toLowerCase()) ||
              livro.tema?.toLowerCase().includes(context.itemTitle.toLowerCase())
            );
            
            if (foundBook) {
              // Navegar diretamente para o livro específico
              setSelectedBook(foundBook as LivroClassico);
              setViewMode('leitor');
              setSelectedArea(foundBook.area);
            }
          }
        } catch (error) {
          console.error('Error parsing navigation context:', error);
        }
      }
    };

    if (livros && livros.length > 0) {
      checkNavigationContext();
    }
  }, [livros]);

  // Organizar livros por área
  const livrosPorArea = livros?.reduce((acc, livro) => {
    const area = livro.area || 'Outras';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(livro as LivroClassico);
    return acc;
  }, {} as Record<string, LivroClassico[]>) || {};

  const areas = Object.keys(livrosPorArea).sort();

  const handleBack = () => {
    if (viewMode === 'leitor') {
      setViewMode('lista');
      setSelectedBook(null);
    } else if (viewMode === 'lista') {
      setViewMode('areas');
      setSelectedArea(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const handleAreaClick = (area: string) => {
    setSelectedArea(area);
    setViewMode('lista');
  };

  const handleBookClick = (livro: LivroClassico) => {
    setSelectedBook(livro);
    setViewMode('leitor');
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'areas':
        return 'Biblioteca Clássicos';
      case 'lista':
        return selectedArea || 'Lista de Livros';
      case 'leitor':
        return selectedBook?.livro || 'Leitor';
      default:
        return 'Biblioteca Clássicos';
    }
  };


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
            <h1 className="ml-4 text-lg font-semibold">Biblioteca Clássicos</h1>
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
        <StandardBibliotecaLeitor
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
              <SearchPreviewBar
                placeholder="Buscar em toda a biblioteca..."
                data={livros || []}
                searchFields={['livro', 'area', 'sobre', 'autor', 'beneficios']}
                onItemClick={handleBookClick}
                renderResult={(livro) => ({
                  id: livro.id,
                  title: livro.livro,
                  subtitle: livro.autor ? `por ${livro.autor}` : (livro.sobre ? livro.sobre.substring(0, 100) + '...' : ''),
                  category: livro.area,
                  image: livro.imagem
                })}
                maxResults={8}
                showSuggestions={true}
                className="max-w-md mx-auto"
              />
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
                  {/* Livros em Destaque - apenas na tela de áreas */}
                  <div className="mb-8">
                    <Suspense fallback={<div className="h-32 bg-white/10 rounded-xl animate-pulse" />}>
                      <LazyProductCarousel />
                    </Suspense>
                  </div>
                  
                  <StandardBibliotecaAreas
                    livrosPorArea={livrosPorArea}
                    areas={areas}
                    onAreaClick={handleAreaClick}
                    title="📚 Biblioteca Clássicos"
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
                  <StandardBibliotecaLista
                    area={selectedArea}
                    livros={livrosPorArea[selectedArea] || []}
                    onBack={handleBack}
                    onBookClick={handleBookClick}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
