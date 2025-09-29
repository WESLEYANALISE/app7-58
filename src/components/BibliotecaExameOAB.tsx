import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useLivrosPorAreaOAB } from '@/hooks/useBibliotecaExameOAB';
import { StandardBibliotecaAreas } from './StandardBibliotecaAreas';
import { StandardBibliotecaLista } from './StandardBibliotecaLista';
import { StandardBibliotecaLeitor } from './StandardBibliotecaLeitor';
import { SearchPreviewBar } from './SearchPreviewBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface LivroOAB {
  id: number;
  'Área': string;
  'Tema': string;
  'Download': string;
  'Link': string;
  'Capa-area': string;
  'Capa-livro': string;
  'Sobre': string;
  'Ordem': string;
  'capa-exame': string;
  'profissões-area': string;
}

type ViewMode = 'areas' | 'lista' | 'leitor';

export const BibliotecaExameOAB = () => {
  const { setCurrentFunction } = useNavigation();
  const { livros, isLoading, error } = useLivrosPorAreaOAB();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Organizar livros por área adaptando para StandardLivro
  const livrosPorArea = livros?.reduce((acc, livro) => {
    const area = livro['Área'] || 'Outras';
    if (!acc[area]) {
      acc[area] = [];
    }
    
    // Adaptar para StandardLivro
    const adaptedLivro = {
      id: livro.id,
      imagem: livro['Capa-livro'],
      livro: livro['Tema'],
      tema: livro['Tema'],
      autor: '',
      area: livro['Área'],
      sobre: livro['Sobre'],
      link: livro['Link'],
      download: livro['Download'],
      'capa-area': livro['Capa-area'],
      'capa-livro': livro['Capa-livro'],
      // Manter os campos originais também
      ...livro
    };
    
    acc[area].push(adaptedLivro);
    return acc;
  }, {} as Record<string, any[]>) || {};

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

  const handleBookClick = (livro: any) => {
    setSelectedBook(livro);
    setViewMode('leitor');
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'areas':
        return 'Biblioteca Exame da Ordem - OAB';
      case 'lista':
        return selectedArea || 'Lista de Materiais';
      case 'leitor':
        return selectedBook?.livro || selectedBook?.tema || 'Leitor';
      default:
        return 'Biblioteca Exame da Ordem - OAB';
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
            <h1 className="ml-4 text-lg font-semibold">Biblioteca Exame da Ordem - OAB</h1>
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
                placeholder="Buscar em toda a biblioteca OAB..."
                data={livros?.map(livro => ({
                  id: livro.id,
                  livro: livro['Tema'],
                  tema: livro['Tema'],
                  area: livro['Área'],
                  sobre: livro['Sobre'],
                  imagem: livro['Capa-livro'],
                  'capa-livro': livro['Capa-livro']
                })) || []}
                searchFields={['livro', 'tema', 'area', 'sobre']}
                onItemClick={handleBookClick}
                renderResult={(livro) => ({
                  id: livro.id,
                  title: livro.livro || livro.tema,
                  subtitle: livro.sobre ? livro.sobre.substring(0, 100) + '...' : '',
                  category: livro.area,
                  image: livro.imagem || livro['capa-livro']
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
                    title="📚 Biblioteca Exame da Ordem - OAB"
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