import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface BibliotecaEstudosItem {
  id: number;
  'Área': string;
  'Ordem': string;
  'Tema': string;
  'Download': string;
  'Link': string;
  'Capa-area': string;
  'Capa-area-link': string;
  'Capa-livro': string;
  'Capa-livro-link': string;
  'Sobre': string;
}

interface LivroEstudos {
  id: number;
  area: string;
  ordem: string;
  tema: string;
  download: string;
  link: string;
  capaArea: string;
  capaAreaLink: string;
  capaLivro: string;
  capaLivroLink: string;
  sobre: string;
}

// Função para normalizar URLs do Google Drive
const normalizeGoogleDriveUrl = (url: string): string => {
  if (!url || !url.includes('drive.google.com')) return url;
  
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }
  return url;
};

// Função para gerar URL pública do bucket Capas
const generateCapaUrl = (fileName: string): string => {
  if (!fileName || !fileName.trim()) return '';
  const cleanFileName = fileName.trim();
  return `https://phzcazcyjhlmdchcjagy.supabase.co/storage/v1/object/public/Capas/${cleanFileName}`;
};

// Função para normalizar URLs das capas de área da coluna "Capa-area-link"
const normalizeCapaAreaLink = (capaAreaLink: string): string => {
  if (!capaAreaLink || !capaAreaLink.trim()) return '';
  const link = capaAreaLink.trim();
  return normalizeGoogleDriveUrl(link);
};

// Função para normalizar e validar dados
const normalizeItemData = (item: any): LivroEstudos => {
  // Normalizar todos os campos texto
  const area = (item['Área'] || '').toString().trim();
  const ordem = (item['Ordem'] || '').toString().trim();
  const tema = (item['Tema'] || '').toString().trim();
  const download = (item['Download'] || '').toString().trim();
  const link = (item['Link'] || '').toString().trim();
  const capaArea = (item['Capa-area'] || '').toString().trim();
  let capaAreaLink = (item['Capa-area-link'] || '').toString().trim();
  const capaLivro = (item['Capa-livro'] || '').toString().trim();
  let capaLivroLink = (item['Capa-livro-link'] || '').toString().trim();
  const sobre = (item['Sobre'] || '').toString().trim();

  // Capa da área: prioriza link direto; se ausente, usa valor da coluna se for URL; senão gera do bucket
  if (capaAreaLink) {
    capaAreaLink = normalizeGoogleDriveUrl(capaAreaLink);
  } else if (capaArea && /^(https?:)?\/\//i.test(capaArea)) {
    capaAreaLink = normalizeGoogleDriveUrl(capaArea);
  } else if (capaArea) {
    capaAreaLink = generateCapaUrl(capaArea);
  }

  // Capa do livro: prioriza link direto; se ausente, usa valor da coluna se for URL; senão gera do bucket
  if (capaLivroLink) {
    capaLivroLink = normalizeGoogleDriveUrl(capaLivroLink);
  } else if (capaLivro && /^(https?:)?\/\//i.test(capaLivro)) {
    capaLivroLink = normalizeGoogleDriveUrl(capaLivro);
  } else if (capaLivro) {
    capaLivroLink = generateCapaUrl(capaLivro);
  }

  return {
    id: item.id,
    area,
    ordem,
    tema,
    download,
    link,
    capaArea,
    capaAreaLink,
    capaLivro,
    capaLivroLink,
    sobre,
  };
};

export const useBibliotecaEstudos = () => {
  return useOptimizedQuery({
    queryKey: ['biblioteca-estudos-nova'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BIBILIOTECA-NOVA-490' as any)
        .select('*');

      if (error) {
        console.error('Erro ao buscar biblioteca de estudos:', error);
        throw error;
      }

      // Transformar e normalizar os dados
      const transformedData: LivroEstudos[] = (data as any).map(normalizeItemData);

      // Ordenar por área e depois por ordem numérica
      const sortedData = transformedData.sort((a, b) => {
        // Primeiro por área
        const areaCompare = a.area.localeCompare(b.area);
        if (areaCompare !== 0) return areaCompare;
        
        // Depois por ordem numérica
        const ordemA = parseInt(a.ordem) || 0;
        const ordemB = parseInt(b.ordem) || 0;
        return ordemA - ordemB;
      });

      // Log de diagnóstico (apenas em development)
      if (process.env.NODE_ENV === 'development') {
        const areaGroups = sortedData.reduce((acc, item) => {
          if (!acc[item.area]) acc[item.area] = [];
          acc[item.area].push(item);
          return acc;
        }, {} as Record<string, LivroEstudos[]>);

        console.log('Biblioteca de Estudos - Áreas encontradas:', Object.keys(areaGroups));
        console.log('Biblioteca de Estudos - Total de materiais:', sortedData.length);
        
        // Verificar capas das áreas
        Object.entries(areaGroups).forEach(([area, livros]) => {
          const capasArea = [...new Set(livros.map(l => l.capaAreaLink).filter(Boolean))];
          console.log(`Área "${area}": ${livros.length} materiais, Capa: ${capasArea[0] || 'Sem capa'}`);
          
          if (capasArea.length > 1) {
            console.warn(`Área "${area}" tem capas inconsistentes:`, capasArea);
          }
          
          const livrosSemCapa = livros.filter(l => !l.capaLivroLink && !l.capaLivro);
          if (livrosSemCapa.length > 0) {
            console.warn(`Área "${area}" tem ${livrosSemCapa.length} livros sem capa`);
          }
        });
      }

      return sortedData;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    useExternalCache: true,
  });
};

// Função para calcular capa dominante de uma área
const getAreaDominantCover = (livros: LivroEstudos[]): string => {
  // Contar frequência de cada capa de área
  const capaFrequency = livros.reduce((acc, livro) => {
    if (livro.capaAreaLink) {
      acc[livro.capaAreaLink] = (acc[livro.capaAreaLink] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Pegar a capa mais frequente
  const mostFrequentCapa = Object.entries(capaFrequency)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  if (mostFrequentCapa) return mostFrequentCapa;

  // Se não houver link, tentar gerar a partir do nome do arquivo
  const firstValidCapaArea = livros.find(l => l.capaArea)?.capaArea;
  return firstValidCapaArea ? generateCapaUrl(firstValidCapaArea) : '';
};

// Hook para organizar por área
export const useLivrosPorAreaEstudos = () => {
  const { data: livros, isLoading, error } = useBibliotecaEstudos();

  const livrosPorArea = livros?.reduce((acc, livro) => {
    const area = livro.area || 'Outras';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(livro);
    return acc;
  }, {} as Record<string, LivroEstudos[]>) || {};

  // Calcular capa dominante para cada área
  const areasComCapaDominante = Object.keys(livrosPorArea).sort().map(area => ({
    area,
    capaDominante: getAreaDominantCover(livrosPorArea[area]),
    livros: livrosPorArea[area]
  }));

  return {
    livrosPorArea,
    areas: Object.keys(livrosPorArea).sort(),
    areasComCapaDominante,
    livros: livros || [],
    isLoading,
    error
  };
};