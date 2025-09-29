import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Função para normalizar texto (remover acentos)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Função para calcular distância de Levenshtein
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  const m = str1.length;
  const n = str2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  for (let i = 0; i <= n; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= m; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[n][m];
};

interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  category?: string;
}

interface SearchPreviewBarProps {
  placeholder?: string;
  data: any[];
  searchFields: string[];
  onItemClick: (item: any) => void;
  renderResult?: (item: any) => SearchResult;
  maxResults?: number;
  className?: string;
  showSuggestions?: boolean;
}

export const SearchPreviewBar = ({
  placeholder = "Pesquisar...",
  data = [],
  searchFields,
  onItemClick,
  renderResult,
  maxResults = 5,
  className = "",
  showSuggestions = true
}: SearchPreviewBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const normalizedQuery = normalizeText(query);
    
    // Buscar resultados
    const filtered = data.filter(item => 
      searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (!value) return false;
        const normalizedValue = normalizeText(value.toString());
        return normalizedValue.includes(normalizedQuery);
      })
    ).slice(0, maxResults);

    setResults(filtered);

    // Gerar sugestões se não há resultados e sugestões estão habilitadas
    if (filtered.length === 0 && showSuggestions) {
      const allTerms = new Set<string>();
      
      data.forEach(item => {
        searchFields.forEach(field => {
          const value = getNestedValue(item, field);
          if (value && typeof value === 'string') {
            normalizeText(value).split(/\s+/).forEach(word => {
              if (word.length > 2) {
                allTerms.add(word);
              }
            });
          }
        });
      });

      const candidateSuggestions: { term: string; distance: number }[] = [];
      
      Array.from(allTerms).forEach(term => {
        const distance = levenshteinDistance(normalizedQuery, term);
        if (distance <= 3 && distance > 0) {
          candidateSuggestions.push({ term, distance });
        }
      });

      const topSuggestions = candidateSuggestions
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map(s => s.term);

      setSuggestions(topSuggestions);
    } else {
      setSuggestions([]);
    }

    setIsOpen(filtered.length > 0 || (filtered.length === 0 && showSuggestions && query.trim().length > 2));
  }, [query, data, searchFields, maxResults, showSuggestions]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleItemClick = (item: any) => {
    onItemClick(item);
    setQuery('');
    setIsOpen(false);
  };

  const defaultRenderResult = (item: any): SearchResult => ({
    id: item.id || Math.random(),
    title: item.title || item.nome || item.livro || 'Item',
    subtitle: item.subtitle || item.autor || item.area,
    image: item.image || item.imagem || item.capa,
    category: item.category || item.area
  });

  const renderFunc = renderResult || defaultRenderResult;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="shadow-lg border-border/50 bg-background/95 backdrop-blur-sm">
              <div className="max-h-80 overflow-y-auto">
                {/* Resultados */}
                {results.map((item, index) => {
                  const result = renderFunc(item);
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border/30 last:border-0"
                    >
                      {result.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {result.subtitle}
                          </p>
                        )}
                        {result.category && (
                          <p className="text-xs text-primary/70 mt-1">
                            {result.category}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Sugestões quando não há resultados */}
                {results.length === 0 && suggestions.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Você quis dizer:
                      </span>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setQuery(suggestion)}
                        className="px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        {suggestion}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Mensagem quando não há resultados nem sugestões */}
                {results.length === 0 && suggestions.length === 0 && query.trim().length > 2 && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhum resultado encontrado para "{query}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};