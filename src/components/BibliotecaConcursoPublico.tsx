import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from './OptimizedImage';
import { ArrowLeft, BookOpen, Search, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useLivrosPorProfissao } from '@/hooks/useBibliotecaConcursoPublico';
import { BibliotecaProfissoes } from './BibliotecaProfissoes';
import { StandardBibliotecaLista } from './StandardBibliotecaLista';
import { StandardBibliotecaLeitor } from './StandardBibliotecaLeitor';
import { SearchPreviewBar } from './SearchPreviewBar';
import { JuridicalBookCard } from './JuridicalBookCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface LivroJuridico {
  id: number;
  'Área': string;
  'Profissões': string;
  'Ordem': string;
  'Tema': string;
  'Download': string;
  'Link': string;
  'Capa-area': string;
  'Capa-livro': string;
  'Sobre': string;
  'profissões-area': string;
  'capa-profissao': string;
}

type ViewMode = 'profissoes' | 'areas' | 'lista' | 'leitor' | 'busca';

export const BibliotecaConcursoPublico = () => {
  const { setCurrentFunction } = useNavigation();
  const { livrosPorProfissao, profissoes, livros, isLoading, error } = useLivrosPorProfissao();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('profissoes');
  const [selectedProfissao, setSelectedProfissao] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleBack = () => {
    console.log('handleBack - viewMode atual:', viewMode, 'selectedProfissao:', selectedProfissao, 'selectedArea:', selectedArea);
    
    if (viewMode === 'leitor') {
      setViewMode('lista');
      setSelectedBook(null);
    } else if (viewMode === 'lista') {
      setViewMode('areas');
      setSelectedArea(null); // Limpa a área, mantém a profissão
    } else if (viewMode === 'areas') {
      setViewMode('profissoes');
      setSelectedProfissao(null); // Limpa a profissão
    } else if (viewMode === 'busca') {
      setViewMode('profissoes');
      setSearchTerm('');
    } else {
      setCurrentFunction(null);
    }
  };

  const handleProfissaoClick = (profissao: string) => {
    setSelectedProfissao(profissao);
    setViewMode('areas');
  };

  const handleAreaClick = (area: string) => {
    setSelectedArea(area);
    setViewMode('lista');
  };

  const handleBookClick = (livro: LivroJuridico) => {
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
      case 'profissoes':
        return 'Biblioteca Concurso Público';
      case 'areas':
        return selectedProfissao || 'Áreas de Estudo';
      case 'lista':
        return selectedArea || 'Lista de Livros';
      case 'leitor':
        return selectedBook?.['Tema'] || 'Leitor';
      case 'busca':
        return `Busca: "${searchTerm}"`;
      default:
        return 'Biblioteca Concurso Público';
    }
  };

  // Filtrar livros por busca global
  const filteredBooks = searchTerm
    ? livros.filter(livro => 
        livro['Tema'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        livro['Área'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        (livro['Sobre'] && livro['Sobre'].toLowerCase().includes(searchTerm.toLowerCase())) ||
        (livro['Profissões'] && livro['Profissões'].toLowerCase().includes(searchTerm.toLowerCase()))
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
            <h1 className="ml-4 text-lg font-semibold">Biblioteca Concurso Público</h1>
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
          livro={{
            id: selectedBook.id,
            livro: selectedBook['Tema'],
            autor: '',
            area: selectedBook['Área'],
            sobre: selectedBook['Sobre'],
            link: selectedBook['Link'],
            download: selectedBook['Download'],
            imagem: selectedBook['Capa-livro'],
            'capa-area': selectedBook['Capa-area'],
            'capa-livro': selectedBook['Capa-livro']
          }}
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
              {viewMode === 'lista' ? 'Áreas' : viewMode === 'areas' ? 'Profissões' : 'Voltar'}
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
          {/* Barra de busca global - só quando não está na view principal de profissões */}
          {viewMode === 'areas' && (
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <SearchPreviewBar
                placeholder="Buscar em toda a biblioteca..."
                data={livros}
                searchFields={['Profissões', 'Tema', 'Área']}
                onItemClick={(livro) => {
                  if (livro['Profissões']) {
                    const primeiraProfissao = livro['Profissões'].split(',')[0].trim();
                    if (!primeiraProfissao.toLowerCase().includes('oab')) {
                      handleProfissaoClick(primeiraProfissao);
                    }
                  }
                }}
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
              {viewMode === 'profissoes' && (
                <motion.div
                  key="profissoes"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BibliotecaProfissoes
                    livrosPorProfissao={livrosPorProfissao}
                    profissoes={profissoes as string[]}
                    onProfissaoClick={handleProfissaoClick}
                  />
                </motion.div>
              )}

              {viewMode === 'areas' && selectedProfissao && (
                <motion.div
                  key="areas"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Áreas de {selectedProfissao}</h2>
                      <p className="text-muted-foreground">
                        Escolha a área específica para ver os livros
                      </p>
                    </div>
                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {(
                        (livrosPorProfissao[selectedProfissao]?.livros?.length
                          ? livrosPorProfissao[selectedProfissao]!.livros
                          : livros.filter(l => l['Profissões']?.toLowerCase().includes(selectedProfissao.toLowerCase()))
                        )
                          .reduce((areas: string[], livro) => {
                            if (livro['Área'] && !areas.includes(livro['Área'])) {
                              areas.push(livro['Área']);
                            }
                            return areas;
                          }, [] as string[])
                      )
                        .map((area, index) => (

                          <motion.div
                            key={area}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                             <Card 
                               className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
                               onClick={() => handleAreaClick(area)}
                             >
                               <CardContent className="p-4">
                                 <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 relative">
                                   {(() => {
                                     const livroComCapa = (livrosPorProfissao[selectedProfissao]?.livros?.length
                                       ? livrosPorProfissao[selectedProfissao]!.livros
                                       : livros.filter(l => l['Profissões']?.toLowerCase().includes(selectedProfissao.toLowerCase()))
                                     ).find(l => l['Área'] === area && l['Capa-area']);
                                     
                                     return livroComCapa?.['Capa-area'] ? (
                                       <OptimizedImage
                                         src={livroComCapa['Capa-area']}
                                         alt={`Capa da área ${area}`}
                                         className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                       />
                                     ) : (
                                       <div className="flex items-center justify-center h-full">
                                         <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                                       </div>
                                     );
                                   })()}
                                   <div className="absolute top-2 right-2">
                                     <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                       {(livrosPorProfissao[selectedProfissao]?.livros?.length
                                         ? livrosPorProfissao[selectedProfissao]!.livros
                                         : livros.filter(l => l['Profissões']?.toLowerCase().includes(selectedProfissao.toLowerCase()))
                                       ).filter(l => l['Área'] === area).length} livros
                                     </Badge>
                                   </div>
                                </div>
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                    {area}
                                  </h3>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {viewMode === 'lista' && selectedArea && selectedProfissao && (
                <motion.div
                  key="lista"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StandardBibliotecaLista
                    area={selectedArea}
                    livros={livrosPorProfissao[selectedProfissao]?.livros.filter(l => l['Área'] === selectedArea).map(l => ({
                      id: l.id,
                      livro: l['Tema'],
                      autor: '',
                      area: l['Área'],
                      sobre: l['Sobre'],
                      link: l['Link'],
                      download: l['Download'],
                      imagem: l['Capa-livro'],
                      'capa-area': l['Capa-area'],
                      'capa-livro': l['Capa-livro']
                    })) || []}
                    onBack={handleBack}
                    onBookClick={(livro) => {
                      // Encontrar o livro original para manter a estrutura completa
                      const livroOriginal = livrosPorProfissao[selectedProfissao]?.livros.find(l => l.id === livro.id);
                      if (livroOriginal) {
                        handleBookClick(livroOriginal);
                      }
                    }}
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
                            <JuridicalBookCard 
                              livro={{
                                id: livro.id,
                                livro: livro['Tema'],
                                autor: '',
                                area: livro['Área'],
                                sobre: livro['Sobre'],
                                link: livro['Link'],
                                download: livro['Download'],
                                imagem: livro['Capa-livro']
                              }} 
                              showAreaBadge={true}
                              onClick={() => handleBookClick(livro)}
                            />
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