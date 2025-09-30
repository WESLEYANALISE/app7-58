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
        // Busca ampla e inteligente em TODAS as funcionalidades solicitadas
        const searchPromises = [
          // 1. BIBLIOTECAS DE LIVROS - Busca precisa nos títulos
          searchInTable('BIBLIOTECA-CLASSICOS', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('BIBLIOTECA-JURIDICA', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('BIBILIOTECA-NOVA-490', searchTerm, 'livro', 'Tema', 'Sobre'),
          searchInTable('BIBILIOTECA-CONCURSO', searchTerm, 'livro', 'Tema', 'Sobre'),
          searchInTable('BILBIOTECA-FORA DA TOGA', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('LIVROS-INDICACAO', searchTerm, 'livro', 'Titulo', 'Sobre'),
          // Bibliotecas temáticas específicas
          searchInTable('01. AUTO CONHECIMENTO', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('02. Empreendedorismo e Negócios', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('03. Finanças pessoas e Investimento', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('04. Inteligência Emocional e Relacionamentos', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('05. Espiritualidade e Propósitos', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('05. Sociedade e Comportamento', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('06. Romance', searchTerm, 'livro', 'livro', 'sobre'),
          searchInTable('01. LIVROS-APP-NOVO', searchTerm, 'livro', 'livro', 'sobre'),

          // 2. CURSOS PREPARATÓRIOS - Buscar somente nas tabelas de cursos
          searchInTable('CURSOS-APP-VIDEO', searchTerm, 'cursos', 'Aula', 'conteudo'),
          searchInTable('CURSO-FACULDADE', searchTerm, 'cursos', 'Assunto', 'conteudo'),
          
          // 3. VIDEOAULAS (YouTube) - Buscar somente na tabela usada pela função Videoaulas
          searchInTable('VIDEOS', searchTerm, 'videoaulas', 'area', 'link'),
          
          // 4. RESUMOS JURÍDICOS - Busca em resumos e mapas mentais
          searchInTable('RESUMOS-NOVOS', searchTerm, 'resumo', 'Subtema', 'Resumo detalhado'),
          searchInTable('MAPAS MENTAIS', searchTerm, 'resumo', 'Subtema', 'Conteúdo'),
          searchInTable('RESUMOS-PERSONALIZADOS', searchTerm, 'resumo', 'titulo', 'conteudo'),
          
          // 5. AUDIOAULAS - Busca em audioaulas
          searchInTable('AUDIO-AULAS', searchTerm, 'audio', 'Aula', 'conteudo'),
          searchInTable('AUDIOS-RELAXANTES', searchTerm, 'audio', 'nome', 'descricao'),
          
          // 6. NOTÍCIAS DO RADAR JURÍDICO - Busca em notícias
          searchInTable('NOTICIAS-JURIDICAS', searchTerm, 'noticia', 'titulo', 'conteudo'),
          searchInTable('NOTICIAS-COMENTADAS', searchTerm, 'noticia', 'titulo', 'resumo'),
          searchInTable('RADAR-JURIDICO', searchTerm, 'noticia', 'titulo', 'conteudo'),
          
          // 7. VADE MECUM - Busca em leis e códigos
          searchInTable('CF88', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          searchInTable('CC', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          searchInTable('CDC', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          searchInTable('CLT', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          searchInTable('CP', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          searchInTable('CPC', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          searchInTable('CPP', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          searchInTable('CTN', searchTerm, 'lei', 'Número do Artigo', 'Artigo'),
          
          // 8. ARTIGOS E PETIÇÕES
          searchInTable('ARITIGOS-COMENTADOS', searchTerm, 'artigo', 'titulo', 'conteudo'),
          searchInTable('CURSO-ARTIGOS-LEIS', searchTerm, 'artigo', 'titulo', 'conteudo'),
          searchInTable('PETICOES', searchTerm, 'artigo', 'titulo', 'conteudo'),
          
          // 9. OUTRAS FUNCIONALIDADES
          searchInTable('BLOGER', searchTerm, 'jusblog', 'titulo', 'conteudo'),
          searchInTable('QUESTÕES-CURSO', searchTerm, 'artigo', 'pergunta', 'resposta'),
          searchInTable('OAB -EXAME', searchTerm, 'artigo', 'pergunta', 'resposta'),
          
          // EXCLUÍDO: Flashcards conforme solicitado
        ];

        const results = await Promise.all(searchPromises);
        const flattened = results.flat();
        
        // Filtro inteligente - permite busca mais ampla mas relevante
        const filtered = flattened.filter(result => {
          const searchLower = searchTerm.toLowerCase();
          const titleLower = result.title.toLowerCase();
          const contentLower = result.content.toLowerCase();
          
          // Busca inteligente: título OU conteúdo contém o termo
          const titleMatch = titleLower.includes(searchLower);
          const contentMatch = contentLower.includes(searchLower);
          
          // Para livros, verificar se não é apenas uma categoria vazia
          if (result.type === 'livro') {
            const isGeneric = titleLower === result.category.toLowerCase() ||
                            titleLower.length < 3;
            return !isGeneric && (titleMatch || contentMatch);
          }
          
          // Para outros tipos, aceitar tanto título quanto conteúdo
          return titleMatch || contentMatch;
        });
        
        // Ordenação inteligente - prioriza relevância
        const sorted = filtered.sort((a, b) => {
          const searchLower = searchTerm.toLowerCase();
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          
          // Prioridade 1: Match exato no título
          const aExact = aTitle === searchLower;
          const bExact = bTitle === searchLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          // Prioridade 2: Título começa com o termo
          const aStarts = aTitle.startsWith(searchLower);
          const bStarts = bTitle.startsWith(searchLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Prioridade 3: Tipos mais relevantes primeiro (livros, cursos, videoaulas)
          const priorityOrder = ['livro', 'cursos', 'videoaulas', 'audio', 'noticia', 'resumo', 'lei', 'artigo', 'jusblog'];
          const aPriority = priorityOrder.indexOf(a.type);
          const bPriority = priorityOrder.indexOf(b.type);
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // Prioridade 4: Match no título vs conteúdo
          const aTitleMatch = aTitle.includes(searchLower);
          const bTitleMatch = bTitle.includes(searchLower);
          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          
          return 0;
        });

        // Limitar resultados - máximo 50 para performance mas amplo o suficiente
        return sorted.slice(0, 50);
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