import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ArrowLeft, 
  X,
  Video, 
  Volume2, 
  BookOpen, 
  FileText, 
  ScrollText, 
  Brain,
  Newspaper,
  Sparkles,
  Loader2,
  Clock,
  Play,
  ExternalLink,
  History,
  Trash2
} from 'lucide-react';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { useAISearchAssistant } from '@/hooks/useAISearchAssistant';
import { useNavigation } from '@/context/NavigationContext';
import { useSearchHistory } from '@/hooks/useSearchHistory';

const typeIcons: Record<SearchResult['type'], any> = {
  videoaulas: Video,
  cursos: Video,
  audio: Volume2,
  livro: BookOpen,
  artigo: FileText,
  resumo: ScrollText,
  flashcard: Brain,
  noticia: Newspaper,
  lei: ScrollText,
  jusblog: FileText
};

const typeLabels: Record<SearchResult['type'], string> = {
  videoaulas: 'Videoaula',
  cursos: 'Curso',
  audio: 'Áudio',
  livro: 'Livro',
  artigo: 'Artigo',
  resumo: 'Resumo',
  flashcard: 'Flashcard',
  noticia: 'Notícia',
  lei: 'Lei',
  jusblog: 'JusBlog'
};

const typeColors: Record<SearchResult['type'], string> = {
  videoaulas: 'bg-red-100 text-red-800 border-red-200',
  cursos: 'bg-purple-100 text-purple-800 border-purple-200',
  audio: 'bg-blue-100 text-blue-800 border-blue-200',
  livro: 'bg-green-100 text-green-800 border-green-200',
  artigo: 'bg-orange-100 text-orange-800 border-orange-200',
  resumo: 'bg-amber-100 text-amber-800 border-amber-200',
  flashcard: 'bg-pink-100 text-pink-800 border-pink-200',
  noticia: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  lei: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  jusblog: 'bg-teal-100 text-teal-800 border-teal-200'
};

interface GlobalSearchProps {
  onClose: () => void;
}

export const GlobalSearch = ({ onClose }: GlobalSearchProps) => {
  const [inputValue, setInputValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchResult['type'] | 'all' | 'videos' | 'resumos' | 'leis' | 'noticias' | 'audios'>('all');
  const { setCurrentFunction } = useNavigation();
  const { 
    searchTerm, 
    searchResults, 
    groupedResults, 
    isLoading, 
    search, 
    clearSearch, 
    totalResults 
  } = useGlobalSearch();
  const { isLoading: aiLoading, suggestions, askAI, clearSuggestions } = useAISearchAssistant();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Hide footer menu and other elements when search is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('search-modal-open');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('search-modal-open');
    };
  }, []);

  const handleSearch = () => {
    if (inputValue.trim()) {
      search(inputValue.trim());
      addToHistory(inputValue.trim(), searchResults.length);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
    clearSuggestions();
    setActiveFilter('all');
  };

  const handleHistoryClick = (term: string) => {
    setInputValue(term);
    search(term);
    addToHistory(term, 0);
  };

  const handleAIHelp = () => {
    if (inputValue.trim()) {
      askAI(inputValue.trim());
    }
  };

  // Filter results based on active filter and limit for performance
  const filteredResults = useMemo(() => {
    let filtered = searchResults;
    
    if (activeFilter === 'videos') {
      filtered = searchResults.filter(result => result.type === 'videoaulas');
    } else if (activeFilter === 'resumos') {
      filtered = searchResults.filter(result => result.type === 'resumo');
    } else if (activeFilter === 'leis') {
      filtered = searchResults.filter(result => result.type === 'lei' || result.type === 'artigo');
    } else if (activeFilter === 'noticias') {
      filtered = searchResults.filter(result => result.type === 'noticia');
    } else if (activeFilter === 'audios') {
      filtered = searchResults.filter(result => result.type === 'audio');
    } else if (activeFilter !== 'all') {
      filtered = searchResults.filter(result => result.type === activeFilter);
    }
    
    // Limit to 100 results to prevent UI freezing but show more comprehensive results
    return filtered.slice(0, 100);
  }, [searchResults, activeFilter]);

  // Navigate to function when clicking on result with intelligent deep linking and highlighting
  const handleResultClick = (result: SearchResult) => {
    const { tableSource, originalData } = result.metadata;
    
    // Create enhanced navigation context with specific item data for highlighting
    const navigationContext = {
      itemId: originalData?.id?.toString(),
      itemTitle: result.title,
      itemData: originalData,
      searchTerm: result.title,
      targetSection: result.category,
      autoOpen: true,
      highlightTerm: searchTerm, // Para destacar o termo buscado
      highlightItem: true, // Flag para indicar que deve destacar o item específico
      pulseAnimation: true, // Flag para animação de pulso no item encontrado
      scrollToItem: true // Flag para rolar até o item específico
    };

    // Store context in sessionStorage for cross-component access
    sessionStorage.setItem('navigationContext', JSON.stringify(navigationContext));
    
    // Enhanced intelligent navigation mapping
    let targetFunction: string;
    
    // LIVROS - Navegação específica para cada biblioteca
    if (result.type === 'livro') {
      if (tableSource?.includes('BIBLIOTECA-CLASSICOS')) {
        targetFunction = 'Biblioteca Clássicos';
      } else if (tableSource?.includes('BIBLIOTECA-JURIDICA')) {
        targetFunction = 'Biblioteca de Estudos';
      } else if (tableSource?.includes('BIBILIOTECA-NOVA-490')) {
        targetFunction = 'Biblioteca de Estudos';
      } else if (tableSource?.includes('BIBILIOTECA-CONCURSO')) {
        targetFunction = 'Biblioteca Concurso Público';
      } else if (tableSource?.includes('BILBIOTECA-FORA DA TOGA')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('LIVROS-INDICACAO')) {
        targetFunction = 'Indicações de Livros';
      } else if (tableSource?.includes('01. AUTO CONHECIMENTO')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('02. Empreendedorismo e Negócios')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('03. Finanças pessoas e Investimento')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('04. Inteligência Emocional e Relacionamentos')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('05. Espiritualidade e Propósitos')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('05. Sociedade e Comportamento')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('06. Romance')) {
        targetFunction = 'Biblioteca Fora da Toga';
      } else if (tableSource?.includes('01. LIVROS-APP-NOVO')) {
        targetFunction = 'Biblioteca de Estudos';
      } else {
        targetFunction = 'Biblioteca de Estudos';
      }
    }
    
    // CURSOS PREPARATÓRIOS
    else if (result.type === 'cursos') {
      targetFunction = 'Cursos Preparatórios';
      
      // Adicionar informações específicas do curso
      navigationContext.itemData = {
        ...navigationContext.itemData,
        courseArea: originalData?.area || originalData?.Area,
        courseModule: originalData?.Modulo,
        courseAssunto: originalData?.Assunto
      };
    }
    
    // VIDEOAULAS
    else if (result.type === 'videoaulas') {
      targetFunction = 'Videoaulas';
      
      // Adicionar informações específicas da videoaula
      navigationContext.itemData = {
        ...navigationContext.itemData,
        videoArea: originalData?.area || originalData?.Area,
        videoTema: originalData?.Tema,
        videoLink: originalData?.video || originalData?.link
      };
    }
    
    // AUDIOAULAS
    else if (result.type === 'audio') {
      targetFunction = 'Áudio-aulas';
      
      navigationContext.itemData = {
        ...navigationContext.itemData,
        audioArea: originalData?.area,
        audioTema: originalData?.Tema
      };
    }
    
    // RESUMOS
    else if (result.type === 'resumo') {
      if (tableSource === 'MAPAS MENTAIS') {
        targetFunction = 'Mapas Mentais';
      } else if (tableSource === 'RESUMOS-PERSONALIZADOS') {
        targetFunction = 'Resumos Jurídicos';
      } else {
        targetFunction = 'Resumos Jurídicos';
      }
      
      navigationContext.itemData = {
        ...navigationContext.itemData,
        resumoTema: originalData?.Tema,
        resumoSubtema: originalData?.Subtema,
        resumoArea: originalData?.area
      };
    }
    
    // NOTÍCIAS
    else if (result.type === 'noticia') {
      if (tableSource?.includes('RADAR-JURIDICO')) {
        targetFunction = 'Radar Jurídico';
      } else {
        targetFunction = 'Notícias Comentadas';
      }
      
      navigationContext.itemData = {
        ...navigationContext.itemData,
        noticiaData: originalData?.data,
        noticiaFonte: originalData?.portal
      };
    }
    
    // VADE MECUM - Navegação específica para leis
    else if (result.type === 'lei') {
      targetFunction = 'Vade Mecum Digital';
      
      // Extract code and article number for direct navigation
      if (tableSource && originalData) {
        const codeMap: Record<string, string> = {
          'CC': 'cc',
          'CF88': 'cf88', 
          'CP': 'cp',
          'CPC': 'cpc',
          'CPP': 'cpp',
          'CLT': 'clt',
          'CDC': 'cdc',
          'CTN': 'ctn',
          'ESTATUTO - OAB': 'estatuto-oab'
        };
        
        navigationContext.itemData = {
          ...navigationContext.itemData,
          selectedCodeId: codeMap[tableSource],
          articleNumber: originalData["Número do Artigo"],
          articleContent: originalData["Artigo"]
        };
      }
    }
    
    // ARTIGOS E PETIÇÕES
    else if (result.type === 'artigo') {
      if (tableSource === 'ARITIGOS-COMENTADOS') {
        targetFunction = 'Artigos Comentados';
      } else if (tableSource === 'CURSO-ARTIGOS-LEIS') {
        targetFunction = 'Artigo por Artigo';
      } else if (tableSource === 'PETICOES') {
        targetFunction = 'Petições';
      } else if (tableSource === 'OAB -EXAME' || tableSource === 'QUESTÕES-CURSO') {
        targetFunction = 'Banco de Questões';
      } else {
        targetFunction = 'Artigos Comentados';
      }
    }
    
    // BLOG JURÍDICO
    else if (result.type === 'jusblog') {
      targetFunction = 'Blogger Jurídico';
    }
    
    // Fallback para tipos não mapeados
    else {
      const functionMap: Record<SearchResult['type'], string> = {
        videoaulas: 'Videoaulas',
        cursos: 'Cursos Preparatórios',
        audio: 'Áudio-aulas', 
        livro: 'Biblioteca de Estudos',
        artigo: 'Artigos Comentados',
        resumo: 'Resumos Jurídicos',
        flashcard: 'Flashcards',
        noticia: 'Notícias Comentadas',
        lei: 'Vade Mecum Digital',
        jusblog: 'Blogger Jurídico'
      };
      
      targetFunction = functionMap[result.type] || 'Biblioteca de Estudos';
    }
    
    // Update context and navigate
    sessionStorage.setItem('navigationContext', JSON.stringify(navigationContext));
    setCurrentFunction(targetFunction);
    onClose();
  };

  const ResultCard = ({ result }: { result: SearchResult }) => {
    const Icon = typeIcons[result.type];
    
    // Priorizar capa específica do item (livro, curso, etc.) sobre capa da área
    const imageUrl = result.metadata.imagem || 
                     result.metadata.capa || 
                     result.metadata['Capa-livro'] || 
                     result.metadata['capa-livro'] || 
                     result.metadata['Capa-area'] || 
                     result.metadata['capa-area'] || 
                     result.metadata['capa-modulo'];
    
    return (
      <div 
        className="p-2.5 sm:p-3 rounded-lg border border-border/30 hover:border-border/60 transition-all duration-200 cursor-pointer bg-background/30 hover:bg-background/60 group hover:shadow-sm"
        onClick={() => handleResultClick(result)}
      >
        <div className="flex items-start gap-2.5 sm:gap-3">
          {/* Image/Capa - Smaller on mobile */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={result.title}
                className="w-12 h-9 sm:w-16 sm:h-12 object-cover rounded border border-border/20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Icon when no image */}
          {!imageUrl && (
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight">
                {result.title}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {(result.type === 'videoaulas' || result.type === 'cursos') && (
                  <Play className="h-3 w-3 text-red-500" />
                )}
                {result.type === 'audio' && (
                  <Volume2 className="h-3 w-3 text-blue-500" />
                )}
                <Badge 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0.5 bg-muted/50"
                >
                  {typeLabels[result.type]}
                </Badge>
              </div>
            </div>
            
            {result.category && (
              <p className="text-xs text-muted-foreground mb-1.5 truncate">{result.category}</p>
            )}
            
            {result.preview && (
              <div className="text-xs text-foreground/60 line-clamp-2 mb-2 leading-relaxed">
                {result.preview}
              </div>
            )}
            
            {result.metadata.author && (
              <p className="text-xs text-muted-foreground truncate">
                Por: {result.metadata.author}
              </p>
            )}
            
            {/* Video specific info */}
            {(result.type === 'videoaulas' || result.type === 'cursos') && (result.metadata.Tema || result.metadata.Assunto) && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground truncate">
                  {result.metadata.Tema || result.metadata.Assunto}
                </p>
              </div>
            )}
            
            {/* Click to access indicator - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">Clique para acessar</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-lg z-50 overflow-hidden">
      {/* Full Screen Modal */}
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
        
        {/* Top Header - Fixed and Visible */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/30 bg-background shadow-sm shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 h-9 px-3 text-foreground hover:bg-muted rounded-lg font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleAIHelp}
              disabled={!inputValue.trim() || aiLoading}
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs hidden sm:flex"
            >
              {aiLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              Ajuda IA
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground sm:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {!searchTerm ? (
            <div className="flex-1 flex flex-col items-center justify-start pt-4 sm:pt-8 px-4 sm:px-6">
              <div className="text-center w-full max-w-xl space-y-4 sm:space-y-6">
                {/* Search Icon - Smaller on mobile */}
                <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 mx-auto" />
                
                {/* Title - Responsive */}
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Busca Global Inteligente
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base px-2">
                    Busque em livros, cursos, videoaulas, resumos, notícias, audioaulas e leis
                  </p>
                </div>
                
                {/* Search Bar - Responsive */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50" />
                    <Input
                      placeholder="Digite pelo menos 3 caracteres..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 sm:pl-12 pr-4 h-12 sm:h-14 text-base sm:text-lg bg-background border-border/50 focus:border-primary rounded-xl shadow-sm"
                      autoFocus
                    />
                    {inputValue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSearch} 
                    disabled={!inputValue.trim() || isLoading}
                    className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-xl shadow-sm shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    )}
                    Buscar
                  </Button>
                </div>
              
                {/* Search History - Compact on mobile */}
                {history.length > 0 && (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Pesquisas recentes</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Limpar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {history.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleHistoryClick(item.term)}
                          className="group flex items-center justify-between p-2.5 sm:p-3 text-left bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.term}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.results > 0 ? `${item.results} resultados` : 'Sem resultados'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(item.id);
                            }}
                            className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Category Pills - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 w-full max-w-4xl">
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-border bg-muted/20 text-xs sm:text-sm">
                    <Video className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    <span className="truncate">Cursos e Videoaulas</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-border bg-muted/20 text-xs sm:text-sm">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="truncate">Biblioteca Jurídica</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-border bg-muted/20 text-xs sm:text-sm">
                    <ScrollText className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span className="truncate">Leis e Códigos</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-border bg-muted/20 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    <span className="truncate">Resumos e Artigos</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-border bg-muted/20 text-xs sm:text-sm col-span-2 sm:col-span-1">
                    <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                    <span className="truncate">Flashcards</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Content - Full height with scroll */
            <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6">
              {/* Search Bar - Compact and sticky */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 bg-muted/20 p-2 sm:p-3 rounded-lg border border-border/30 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Pesquisar..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-8 h-9 sm:h-10 bg-transparent border-0 focus:outline-none text-sm sm:text-base"
                  />
                  {inputValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="h-9 sm:h-10 px-4 sm:px-6 font-medium rounded-lg shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                  ) : (
                    <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  )}
                  <span className="hidden sm:inline">Buscar</span>
                </Button>
              </div>

              {/* Results Area - Flexible height */}
              <div className="flex-1 bg-background/80 rounded-lg border border-border/30 overflow-hidden flex flex-col">
                {/* AI Suggestions */}
                <AnimatePresence>
                  {suggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 border-b border-border/50"
                    >
                      <div className="text-sm bg-primary/5 p-3 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-medium">Sugestão da IA</span>
                        </div>
                        <p className="text-foreground/90">{suggestions.content}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearSuggestions}
                          className="mt-2 h-6 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Fechar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter Tabs - Horizontal scroll on mobile */}
                {totalResults > 0 && (
                  <div className="px-2 sm:px-3 py-2 border-b border-border/30 bg-muted/20 shrink-0">
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                      <button
                        onClick={() => setActiveFilter('all')}
                        className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                          activeFilter === 'all' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-background/60 border text-foreground/70 hover:text-foreground hover:bg-background'
                        }`}
                      >
                        Todos ({totalResults})
                      </button>
                      
                      {/* Specific Category Filters */}
                      <button
                        onClick={() => setActiveFilter('cursos')}
                        className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                          activeFilter === 'cursos' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-background/60 border text-foreground/70 hover:text-foreground hover:bg-background'
                        }`}
                      >
                        <Video className="h-3 w-3" />
                        <span className="hidden sm:inline">Cursos preparatórios</span>
                        <span className="sm:hidden">Cursos</span>
                        ({(groupedResults.videoaulas?.length || 0) + (groupedResults.cursos?.length || 0)})
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter('resumos')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          activeFilter === 'resumos' 
                            ? 'bg-foreground text-background' 
                            : 'bg-background border text-foreground/70 hover:text-foreground'
                        }`}
                      >
                        <ScrollText className="h-3 w-3" />
                        Resumos ({groupedResults.resumo?.length || 0})
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter('leis')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          activeFilter === 'leis' 
                            ? 'bg-foreground text-background' 
                            : 'bg-background border text-foreground/70 hover:text-foreground'
                        }`}
                      >
                        <FileText className="h-3 w-3" />
                        Leis ({(groupedResults.lei?.length || 0) + (groupedResults.artigo?.length || 0)})
                      </button>
                      
                      {/* Existing Type Filters */}
                      {Object.entries(groupedResults).map(([type, results]) => {
                        if (['video', 'resumo', 'lei', 'artigo'].includes(type)) return null;
                        const Icon = typeIcons[type as SearchResult['type']];
                        const label = typeLabels[type as SearchResult['type']];
                        return (
                          <button
                            key={type}
                            onClick={() => setActiveFilter(type as SearchResult['type'])}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              activeFilter === type 
                                ? 'bg-foreground text-background' 
                                : 'bg-background border text-foreground/70 hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {label} ({results.length})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Results List - Full height scroll */}
                <div className="flex-1 overflow-y-auto">
                  {filteredResults.length > 50 && (
                    <div className="p-2 text-xs text-muted-foreground text-center border-b border-border/20 bg-muted/20">
                      Mostrando primeiros 50 de {totalResults} resultados
                    </div>
                  )}
                  <div className="divide-y divide-border/20">
                    {isLoading ? (
                      <div className="text-center py-8 sm:py-12">
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm font-medium">Pesquisando...</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Buscando por "{searchTerm}"
                        </p>
                      </div>
                    ) : filteredResults.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
                        <Search className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Não encontramos conteúdos para "{searchTerm}"
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• Tente termos mais específicos</p>
                          <p>• Verifique a ortografia</p>
                          <p>• Use sinônimos relacionados</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                        {filteredResults.map((result) => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
