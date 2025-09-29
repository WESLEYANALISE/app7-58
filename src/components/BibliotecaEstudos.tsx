import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Search, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useBibliotecaEstudos } from '@/hooks/useBibliotecaEstudos';
import { StandardBibliotecaAreas } from './StandardBibliotecaAreas';
import { StandardBibliotecaLista } from './StandardBibliotecaLista';
import { StandardBibliotecaLeitor } from './StandardBibliotecaLeitor';
import { SearchPreviewBar } from './SearchPreviewBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

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

type ViewMode = 'areas' | 'lista' | 'leitor';

export const BibliotecaEstudos = () => {
  const { setCurrentFunction } = useNavigation();
  const { data: livros, isLoading, error } = useBibliotecaEstudos();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroEstudos | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Organizar livros por área
  const livrosPorArea = livros?.reduce((acc, livro) => {
    const area = livro.area || 'Outras';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(livro);
    return acc;
  }, {} as Record<string, LivroEstudos[]>) || {};

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

  const handleBookClick = (livro: LivroEstudos) => {
    // Adaptar livro para o formato esperado pelo leitor
    const adaptedLivro = {
      id: livro.id,
      imagem: livro.capaLivroLink || '',
      livro: livro.tema,
      autor: '',
      area: livro.area,
      sobre: livro.sobre,
      link: livro.link,
      download: livro.download,
      beneficios: ''
    };
    setSelectedBook(adaptedLivro as any);
    setViewMode('leitor');
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'areas':
        return 'Biblioteca de Estudos';
      case 'lista':
        return selectedArea || 'Lista de Materiais';
      case 'leitor':
        return selectedBook?.tema || 'Leitor';
      default:
        return 'Biblioteca de Estudos';
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
            <h1 className="ml-4 text-lg font-semibold">Biblioteca de Estudos</h1>
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
          livro={selectedBook as any}
          onClose={handleBack}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:h-full lg:min-h-0">
      {/* Header - apenas no mobile */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14 lg:hidden">
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
      <div className="lg:h-full lg:overflow-y-auto" 
           style={{ 
             paddingBottom: isMobile ? '6rem' : '0',
             height: isMobile ? 'calc(100vh - 3.5rem)' : 'auto'
           }}>
        <div className="w-full px-2 lg:px-0 py-2 lg:py-0">
          {/* Barra de busca global - só nas áreas */}
          {viewMode === 'areas' && (
            <div className="mb-8">
              <SearchPreviewBar
                placeholder="Buscar em toda a biblioteca..."
                data={livros || []}
                searchFields={['tema', 'area', 'sobre', 'ordem']}
                onItemClick={handleBookClick}
                renderResult={(livro) => ({
                  id: livro.id,
                  title: livro.tema,
                  subtitle: livro.sobre ? livro.sobre.substring(0, 100) + '...' : '',
                  category: livro.area,
                  image: livro.capaLivroLink
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
                  <StandardBibliotecaAreas
                    livrosPorArea={livrosPorArea}
                    areas={areas}
                    onAreaClick={handleAreaClick}
                    title="📚 Biblioteca de Estudos Completa"
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