import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'videoaulas' | 'cursos' | 'audio' | 'livro' | 'artigo' | 'resumo' | 'flashcard' | 'noticia' | 'lei' | 'jusblog';
  category: string;
  preview: string;
  metadata: {
    author?: string;
    area?: string;
    tema?: string;
    duration?: string;
    originalData?: any;
    tableSource?: string;
    [key: string]: any;
  };
}

const searchInTable = async (table: string, searchTerm: string, type: SearchResult['type'], titleField: string, contentField: string, categoryField?: string) => {
  try {
    // Busca MUITO mais precisa - foca no título do livro/conteúdo, não na área
    const { data, error } = await supabase
      .from(table as any)
      .select('*')
      .or(`${titleField}.ilike.%${searchTerm}%,${contentField}.ilike.%${searchTerm}%`);

    if (error) {
      console.error(`Error searching in ${table}:`, error);
      return [];
    }

      return data?.map((item: any, index: number) => ({
        id: `${table}-${item.id || index}`,
        title: item[titleField] || 'Sem título',
        content: item[contentField] || '',
        type,
        category: item[categoryField] || item.area || item['Área'] || item.Area || 'Geral',
        preview: (item[contentField] || '').substring(0, 150) + (item[contentField]?.length > 150 ? '...' : ''),
        metadata: {
          author: item.autor || item.Autor,
          area: item.area || item['Área'] || item.Area,
          tema: item.tema || item.Tema,
          assunto: item.Assunto,
          modulo: item.Modulo,
          capa: item.capa || item['Capa-livro'] || item['Capa-area'],
          imagem: item.imagem,
          'capa-area': item['capa-area'] || item['Capa-area'],
          'capa-modulo': item['capa-modulo'] || item['Capa-livro'],
          'capa-livro-link': item['Capa-livro-link'],
          'capa-area-link': item['Capa-area-link'],
          video: item.video,
          link: item.link || item.Link,
          download: item.download || item.Download,
          portal: item.portal,
          data: item.data,
          lei: item.lei,
          numeroArtigo: item['Número do Artigo'],
          originalData: item, // Dados originais para navegação específica
          tableSource: table, // Fonte da tabela para navegação
          ...item
        }
      })) || [];
  } catch (error) {
    console.error(`Error searching in ${table}:`, error);
    return [];
  }
};

export const useGlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['globalSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      setIsSearching(true);
      
      try {
        // Busca APENAS nas tabelas das bibliotecas - foco total nos LIVROS
        const searchPromises = [
          // APENAS BIBLIOTECAS DE LIVROS - Busca precisa nos títulos
          searchInTable('BIBLIOTECA-CLASSICOS', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('BIBLIOTECA-JURIDICA', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('BIBILIOTECA-NOVA-490', searchTerm, 'livro', 'Tema', 'Sobre'),
          searchInTable('BIBILIOTECA-CONCURSO', searchTerm, 'livro', 'Tema', 'Sobre'),
          searchInTable('BILBIOTECA-FORA DA TOGA', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('LIVROS-INDICACAO', searchTerm, 'livro', 'Titulo', 'Sobre'),
          // Bibliotecas temáticas - apenas livros específicos
          searchInTable('01. AUTO CONHECIMENTO', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('02. Empreendedorismo e Negócios', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('03. Finanças pessoas e Investimento', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('04. Inteligência Emocional e Relacionamentos', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('05. Espiritualidade e Propósitos', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('05. Sociedade e Comportamento', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('06. Romance', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('01. LIVROS-APP-NOVO', searchTerm, 'livro', 'livro', 'sobre'),
          
          // OUTRAS FUNCIONALIDADES - apenas se não for busca específica de livro
          ...(searchTerm.toLowerCase().includes('curso') || 
              searchTerm.toLowerCase().includes('aula') || 
              searchTerm.toLowerCase().includes('video') ? [
            // Cursos e videoaulas apenas se buscar especificamente
            searchInTable('CURSOS-APP-VIDEO', searchTerm, 'cursos', 'Aula', 'conteudo'),
            searchInTable('CURSO-FACULDADE', searchTerm, 'cursos', 'Assunto', 'conteudo'),
            searchInTable('VIDEO-AULAS-DIAS', searchTerm, 'videoaulas', 'Aula', 'conteudo'),
            searchInTable('VIDEOS', searchTerm, 'videoaulas', 'area', 'link'),
          ] : []),
          
          ...(searchTerm.toLowerCase().includes('lei') || 
              searchTerm.toLowerCase().includes('artigo') || 
              searchTerm.toLowerCase().includes('código') ? [
            // Leis apenas se buscar especificamente
            searchInTable('CF88', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
            searchInTable('CC', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
            searchInTable('CDC', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
            searchInTable('CLT', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          ] : []),
          
          ...(searchTerm.toLowerCase().includes('resumo') || 
              searchTerm.toLowerCase().includes('mapa') ? [
            // Resumos apenas se buscar especificamente
            searchInTable('RESUMOS-NOVOS', searchTerm, 'resumo', 'Subtema', 'Resumo detalhado'),
            searchInTable('MAPAS MENTAIS', searchTerm, 'resumo', 'Subtema', 'Conteúdo'),
          ] : [])
        ];

        const results = await Promise.all(searchPromises);
        const flattened = results.flat();
        
        // Filtrar resultados para MÁXIMA precisão - apenas conteúdo relevante
        const filtered = flattened.filter(result => {
          const searchLower = searchTerm.toLowerCase();
          const titleLower = result.title.toLowerCase();
          
          // FILTRO RIGOROSO: só mostrar se o título contém o termo buscado
          // Evita mostrar apenas categorias/áreas
          const titleMatch = titleLower.includes(searchLower);
          
          // Para livros, verificar se não é apenas uma categoria vazia
          if (result.type === 'livro') {
            // Não mostrar se o título for muito genérico ou igual à categoria
            const isGeneric = titleLower === result.category.toLowerCase() ||
                            titleLower.length < 3 ||
                            !titleMatch;
            return !isGeneric && titleMatch;
          }
          
          return titleMatch;
        });
        
        // Ordenação SUPER otimizada - prioridade absoluta para matches exatos
        const sorted = filtered.sort((a, b) => {
          const searchLower = searchTerm.toLowerCase();
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          
          // Prioridade 1: Match exato no título (case insensitive)
          const aExact = aTitle === searchLower;
          const bExact = bTitle === searchLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          // Prioridade 2: Título começa com o termo
          const aStarts = aTitle.startsWith(searchLower);
          const bStarts = bTitle.startsWith(searchLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Prioridade 3: LIVROS sempre primeiro
          if (a.type === 'livro' && b.type !== 'livro') return -1;
          if (a.type !== 'livro' && b.type === 'livro') return 1;
          
          // Prioridade 4: Por similaridade do título
          const aIncludes = aTitle.includes(searchLower);
          const bIncludes = bTitle.includes(searchLower);
          if (aIncludes && !bIncludes) return -1;
          if (!aIncludes && bIncludes) return 1;
          
          return 0;
        });

          // Limitar resultados - máximo 15 para manter foco
          return sorted.slice(0, 15);
      } finally {
        setIsSearching(false);
      }
    },
    enabled: searchTerm.trim().length > 2,
    staleTime: 1000 * 60, // 1 minute cache
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const search = (term: string) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    const key = result.type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<SearchResult['type'], SearchResult[]>);

  return {
    searchTerm,
    searchResults,
    groupedResults,
    isLoading: isLoading || isSearching,
    search,
    clearSearch,
    totalResults: searchResults.length
  };
};