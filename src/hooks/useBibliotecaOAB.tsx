import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  Profissões?: string;
  'profissões-area'?: string;
  'capa-profissao'?: string;
}

export const useBibliotecaOAB = () => {
  return useOptimizedQuery({
    queryKey: ['biblioteca-oab'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BIBLIOTECA-JURIDICA')
        .select('*')
        .ilike('Profissões', '%OAB%')
        .order('id', { ascending: true });

      if (error) {
        console.error('Erro ao buscar biblioteca OAB:', error);
        throw error;
      }

      return data as LivroJuridico[];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    useExternalCache: true,
  });
};

// Hook para organizar livros por profissão do exame da OAB
export const useLivrosPorProfissaoOAB = () => {
  const { data: livros, isLoading, error } = useBibliotecaOAB();

  // Criar uma estrutura para organizar por profissões da OAB
  const livrosPorProfissao = livros?.reduce((acc, livro) => {
    if (livro.Profissões) {
      const profissoes = livro.Profissões.split(',').map(p => p.trim());
      const profissoesArea = livro['profissões-area']?.split(',').map(p => p.trim()) || [];
      const capas = livro['capa-profissao']?.split(',').map(p => p.trim()) || [];
      
      // Para cada profissão da OAB, criar entrada se não existir
      profissoes.forEach((profissao, index) => {
        if (profissao && profissao.toLowerCase().includes('oab')) {
          if (!acc[profissao]) {
            // Tentar pegar a capa específica da profissão ou usar a primeira disponível
            let capaEspecifica = capas[index] || null;
            
            // Se não encontrar capa específica, procurar por uma capa que contenha o nome da profissão
            if (!capaEspecifica && livro.imagem) {
              const nomeSimplificado = profissao.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[áàâã]/g, 'a')
                .replace(/[éèê]/g, 'e')
                .replace(/[íì]/g, 'i')
                .replace(/[óòôõ]/g, 'o')
                .replace(/[úù]/g, 'u')
                .replace(/ç/g, 'c');
              
              if (livro.imagem.toLowerCase().includes(nomeSimplificado) || 
                  livro.imagem.toLowerCase().includes(profissao.toLowerCase())) {
                capaEspecifica = livro.imagem;
              }
            }
            
            acc[profissao] = {
              livros: [],
              area: profissoesArea[index] || profissao,
              capa: capaEspecifica
            };
          }
          
          // Se ainda não tem capa e esta é uma imagem relacionada, usar ela
          if (!acc[profissao].capa && livro.imagem) {
            const nomeSimplificado = profissao.toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[áàâã]/g, 'a')
              .replace(/[éèê]/g, 'e')
              .replace(/[íì]/g, 'i')
              .replace(/[óòôõ]/g, 'o')
              .replace(/[úù]/g, 'u')
              .replace(/ç/g, 'c');
            
            if (livro.imagem.toLowerCase().includes(nomeSimplificado) || 
                livro.imagem.toLowerCase().includes(profissao.toLowerCase())) {
              acc[profissao].capa = livro.imagem;
            }
          }
          
          acc[profissao].livros.push(livro);
        }
      });
    }
    return acc;
  }, {} as Record<string, { livros: LivroJuridico[], area: string, capa: string | null }>) || {};

  const profissoesOAB = Object.keys(livrosPorProfissao).sort();

  return {
    livrosPorProfissao,
    profissoesOAB,
    livros: livros || [],
    isLoading,
    error
  };
};