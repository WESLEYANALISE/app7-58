import { useState, useMemo } from 'react';

// Função para normalizar texto (remover acentos e tornar minúsculo)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

// Função para calcular distância de Levenshtein (para sugestões)
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
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        );
      }
    }
  }

  return matrix[n][m];
};

interface SearchResult<T> {
  item: T;
  score: number;
}

interface UseAdvancedSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  threshold?: number; // Para sugestões (distância máxima)
}

export const useAdvancedSearch = <T,>({
  data,
  searchFields,
  threshold = 3
}: UseAdvancedSearchProps<T>) => {
  const [query, setQuery] = useState('');

  // Criar índice de termos únicos para sugestões
  const searchIndex = useMemo(() => {
    const terms = new Set<string>();
    
    data.forEach(item => {
      searchFields.forEach(field => {
        const value = item[field];
        if (typeof value === 'string' && value.trim()) {
          // Adicionar palavras individuais
          normalizeText(value).split(/\s+/).forEach(word => {
            if (word.length > 2) {
              terms.add(word);
            }
          });
          // Adicionar frases completas
          terms.add(normalizeText(value));
        }
      });
    });

    return Array.from(terms);
  }, [data, searchFields]);

  // Buscar itens
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const normalizedQuery = normalizeText(query);
    const results: SearchResult<T>[] = [];

    data.forEach(item => {
      let maxScore = 0;
      
      searchFields.forEach(field => {
        const value = item[field];
        if (typeof value === 'string' && value.trim()) {
          const normalizedValue = normalizeText(value);
          
          // Pontuação para matches exatos
          if (normalizedValue.includes(normalizedQuery)) {
            const exactMatch = normalizedValue === normalizedQuery;
            const startsWithMatch = normalizedValue.startsWith(normalizedQuery);
            const wordMatch = normalizedValue.split(/\s+/).some(word => word === normalizedQuery);
            
            if (exactMatch) maxScore = Math.max(maxScore, 100);
            else if (startsWithMatch) maxScore = Math.max(maxScore, 90);
            else if (wordMatch) maxScore = Math.max(maxScore, 80);
            else maxScore = Math.max(maxScore, 70);
          }
          
          // Pontuação para matches parciais
          const words = normalizedQuery.split(/\s+/);
          const matchedWords = words.filter(word => 
            normalizedValue.includes(word) && word.length > 1
          );
          
          if (matchedWords.length > 0) {
            const partialScore = (matchedWords.length / words.length) * 60;
            maxScore = Math.max(maxScore, partialScore);
          }
        }
      });

      if (maxScore > 0) {
        results.push({ item, score: maxScore });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.item);
  }, [data, query, searchFields]);

  // Gerar sugestões para consultas sem resultados
  const suggestions = useMemo(() => {
    if (!query.trim() || searchResults.length > 0) return [];

    const normalizedQuery = normalizeText(query);
    const candidateSuggestions: { term: string; distance: number }[] = [];

    searchIndex.forEach(term => {
      const distance = levenshteinDistance(normalizedQuery, term);
      if (distance <= threshold && distance > 0) {
        candidateSuggestions.push({ term, distance });
      }
    });

    return candidateSuggestions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(s => s.term);
  }, [query, searchResults.length, searchIndex, threshold]);

  return {
    query,
    setQuery,
    results: searchResults,
    suggestions,
    hasResults: searchResults.length > 0,
    isEmpty: query.trim().length > 0 && searchResults.length === 0
  };
};