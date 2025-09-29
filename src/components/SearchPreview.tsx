import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Video, Users, BookOpen, Scale, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'funcao' | 'conteudo' | 'documento';
  category: string;
  icon: any;
  action: () => void;
}

interface SearchPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export const SearchPreview = ({ isOpen, onClose, query, onQueryChange }: SearchPreviewProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { setCurrentFunction } = useNavigation();
  const { functions } = useAppFunctions();

  // Mock data para resultados de pesquisa
  const mockContent = [
    {
      id: 'const-1',
      title: 'Direitos Fundamentais na Constituição',
      description: 'Artigos 5º a 17 da Constituição Federal tratam dos direitos e garantias fundamentais...',
      type: 'conteudo' as const,
      category: 'Direito Constitucional',
      icon: Scale,
      keywords: ['direitos fundamentais', 'constituição', 'artigo 5', 'garantias']
    },
    {
      id: 'civil-1',
      title: 'Responsabilidade Civil no Código Civil',
      description: 'Artigos 186 a 188 e 927 a 943 tratam da responsabilidade civil e obrigação de indenizar...',
      type: 'conteudo' as const,
      category: 'Direito Civil',
      icon: FileText,
      keywords: ['responsabilidade civil', 'indenização', 'danos', 'código civil']
    },
    {
      id: 'penal-1',
      title: 'Crimes contra a Pessoa',
      description: 'Título I da Parte Especial do Código Penal (artigos 121 a 154-B)...',
      type: 'conteudo' as const,
      category: 'Direito Penal',
      icon: Scale,
      keywords: ['crimes', 'homicídio', 'lesão corporal', 'código penal']
    },
    {
      id: 'trab-1',
      title: 'Direitos Trabalhistas CLT',
      description: 'Consolidação das Leis do Trabalho - direitos e deveres do trabalhador...',
      type: 'conteudo' as const,
      category: 'Direito do Trabalho',
      icon: Users,
      keywords: ['clt', 'trabalhista', 'emprego', 'salário', 'férias']
    }
  ];

  const searchContent = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const contentResults: SearchResult[] = [];
    const functionResults: SearchResult[] = [];

    // Buscar em funções
    if (functions) {
      functions.forEach(func => {
        if (
          func.funcao.toLowerCase().includes(query) ||
          func.area?.toLowerCase().includes(query) ||
          func.profissao?.toLowerCase().includes(query)
        ) {
          functionResults.push({
            id: `func-${func.id}`,
            title: func.funcao,
            description: `${func.area} - ${func.profissao}`,
            type: 'funcao',
            category: func.area || 'Funcionalidade',
            icon: getIconForFunction(func.funcao),
            action: () => {
              setCurrentFunction(func.funcao);
              onClose();
            }
          });
        }
      });
    }

    // Buscar em conteúdo mock
    mockContent.forEach(item => {
      if (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query))
      ) {
        contentResults.push({
          ...item,
          action: () => {
            // Simular navegação para conteúdo
            console.log('Navegando para:', item.title);
            onClose();
          }
        });
      }
    });

    return [...functionResults, ...contentResults];
  };

  const getIconForFunction = (funcName: string) => {
    const name = funcName.toLowerCase();
    if (name.includes('assistente') || name.includes('ia')) return Bot;
    if (name.includes('video')) return Video;
    if (name.includes('biblioteca') || name.includes('livro')) return BookOpen;
    if (name.includes('vade') || name.includes('lei')) return Scale;
    return FileText;
  };

  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true);
      // Simular delay de busca
      const timer = setTimeout(() => {
        const searchResults = searchContent(query);
        setResults(searchResults);
        setLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, functions]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-32">
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Pesquisar funcionalidades, conteúdos jurídicos..."
              className="pl-10 pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Pesquisando...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4">
              <div className="space-y-2">
                {results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <Card 
                      key={result.id} 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={result.action}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                               <h3 className="font-medium text-sm">{result.title}</h3>
                               <Badge variant="secondary" className="text-xs">
                                 {result.type === 'funcao' ? 'Funcionalidade' : 'Conteúdo'}
                               </Badge>
                             </div>
                             
                             <p className="text-sm text-muted-foreground line-clamp-1">
                               {result.description}
                             </p>
                             
                             <p className="text-xs text-muted-foreground mt-1">
                               {result.category}
                             </p>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum resultado encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Tente usar termos diferentes ou mais específicos
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Pesquisar na Plataforma</h3>
              <p className="text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para começar a pesquisar
              </p>
              
              <div className="mt-6 text-left">
                <h4 className="font-medium text-sm mb-3">Sugestões de pesquisa:</h4>
                <div className="flex flex-wrap gap-2">
                  {['Assistente IA', 'Videoaulas', 'Constituição', 'Código Civil', 'Direitos Fundamentais'].map((suggestion) => (
                    <Badge 
                      key={suggestion}
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => onQueryChange(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-1 py-0.5 bg-background rounded text-xs">Esc</kbd> para fechar
          </p>
        </div>
      </div>
    </div>
  );
};