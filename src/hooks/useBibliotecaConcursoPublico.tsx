import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

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

export const useBibliotecaConcursoPublico = () => {
  return useOptimizedQuery({
    queryKey: ['biblioteca-concurso-publico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BIBILIOTECA-CONCURSO')
        .select('*')
        .not('Profissões', 'is', null)
        .not('Profissões', 'eq', '')
        .order('Ordem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar biblioteca concurso público:', error);
        throw error;
      }

      return data as LivroJuridico[];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    useExternalCache: true,
  });
};

// Hook para organizar livros por profissão para concurso público
export const useLivrosPorProfissao = () => {
  const { data: livros, isLoading, error } = useBibliotecaConcursoPublico();

  // Criar um mapa de capas das profissões baseado nos dados da tabela
  const capasMap = livros?.reduce((acc, livro) => {
    if (livro['profissões-area'] && livro['capa-profissao']) {
      const profissaoArea = livro['profissões-area'].trim();
      const capaProfissao = livro['capa-profissao'].trim();
      if (profissaoArea && capaProfissao) {
        acc[profissaoArea] = capaProfissao;
      }
    }
    return acc;
  }, {} as Record<string, string>) || {};

  // Criar uma estrutura para organizar por profissões
  const livrosPorProfissao = livros?.reduce((acc, livro) => {
    if (livro['Profissões']) {
      const profissoes = livro['Profissões'].split(',').map(p => p.trim());
      
      profissoes.forEach((profissao) => {
        if (profissao && profissao !== '' && !profissao.toLowerCase().includes('oab')) {
          if (!acc[profissao]) {
            // Buscar a capa específica da profissão no mapa criado
            const capaEspecifica = capasMap[profissao] || null;
            
            acc[profissao] = {
              livros: [],
              area: profissao,
              capa: capaEspecifica
            };
          }
          
          acc[profissao].livros.push(livro);
        }
      });
    }
    return acc;
  }, {} as Record<string, { livros: LivroJuridico[], area: string, capa: string | null }>) || {};

  const profissoes = Array.from(new Set((livros || []).flatMap(l => (l['Profissões'] || '')
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.toLowerCase().includes('oab'))
  ))).sort();

  return {
    livrosPorProfissao,
    profissoes,
    livros: livros || [],
    isLoading,
    error
  };
};