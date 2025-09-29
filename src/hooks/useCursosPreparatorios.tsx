import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

const ensurePublicUrl = (bucket: string, path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  let normalized = path.replace(/^\/+/, '');
  // Remove bucket prefix if present to avoid duplication
  const bucketPrefix = bucket + '/';
  if (normalized.startsWith(bucketPrefix)) {
    normalized = normalized.slice(bucketPrefix.length);
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(normalized);
  return data.publicUrl;
};

export interface VideoAula {
  id: number;
  Area: string;
  Modulo: string;
  Aula: string;
  Tema: string;
  Assunto: string;
  capa: string;
  video: string;
  conteudo: string;
  material: string;
  'capa-modulo': string;
  'capa-area': string;
}

export interface CursoArea {
  nome: string;
  capa: string;
  modulos: CursoModulo[];
  totalAulas: number;
}

export interface CursoModulo {
  nome: string;
  capa: string;
  area: string;
  aulas: CursoAula[];
  totalDuracao: number;
}

export interface CursoAula {
  id: number;
  nome: string;
  tema: string;
  assunto: string;
  capa: string;
  video: string;
  conteudo: string;
  material: string;
  modulo: string;
  area: string;
  duracao: number; // em minutos, calculado baseado no conteúdo
}

export interface ProgressoUsuario {
  aulaId: number;
  percentualAssistido: number;
  tempoAssistido: number; // em segundos
  concluida: boolean;
  ultimoAcesso: Date;
}

export const useCursosPreparatorios = () => {
  return useOptimizedQuery({
    queryKey: ['cursos-preparatorios'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('CURSOS-APP-VIDEO')
          .select('*')
          .order('Area', { ascending: true })
          .order('Tema', { ascending: true })
          .order('Assunto', { ascending: true });

        if (error) throw error;
        return data as VideoAula[];
      } catch (error) {
        console.error('Erro ao buscar cursos preparatórios:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes cache
    useExternalCache: true,
  });
};

export const useCursosOrganizados = () => {
  const { data: videoAulas, isLoading, error } = useCursosPreparatorios();

  const cursosOrganizados = useMemo(() => {
    if (!videoAulas) return { areas: [], totalAreas: 0, totalModulos: 0, totalAulas: 0 };

    const areasMap = new Map<string, CursoArea>();

    // Ordenar aulas pela coluna "Aula" (ordem numérica)
    const aulasOrdenadas = [...videoAulas].sort((a, b) => {
      const aulaA = parseInt(a.Aula?.toString() || '0');
      const aulaB = parseInt(b.Aula?.toString() || '0');
      return aulaA - aulaB;
    });

    aulasOrdenadas.forEach((aula) => {
      const areaKey = aula.Area;
      const moduloKey = aula.Tema; // Tema é o nome do módulo

      // Criar área se não existir
      if (!areasMap.has(areaKey)) {
        areasMap.set(areaKey, {
          nome: aula.Area,
          capa: ensurePublicUrl('Capas', aula['capa-area']),
          modulos: [],
          totalAulas: 0,
        });
      }

      const area = areasMap.get(areaKey)!;
      // Atualiza capa da área se ainda não definida e existir na aula atual
      if (!area.capa && aula['capa-area']) {
        area.capa = ensurePublicUrl('Capas', aula['capa-area']);
      }

      // Encontrar ou criar módulo (usando Tema como nome do módulo)
      let modulo = area.modulos.find(m => m.nome === moduloKey);
      if (!modulo) {
        modulo = {
          nome: aula.Tema, // Tema é o nome do módulo
          capa: ensurePublicUrl('CAPA MODULO', aula['capa-modulo']),
          area: aula.Area,
          aulas: [],
          totalDuracao: 0,
        };
        area.modulos.push(modulo);
      }

      // Atualiza capa do módulo se ainda não definida
      if (!modulo.capa && aula['capa-modulo']) {
        modulo.capa = ensurePublicUrl('CAPA MODULO', aula['capa-modulo']);
      }

      // Estimar duração baseada no conteúdo (aproximadamente 150 palavras por minuto)
      const palavras = aula.conteudo ? aula.conteudo.split(' ').length : 0;
      const duracaoEstimada = Math.max(5, Math.round(palavras / 150)); // mínimo 5 minutos

      // Adicionar aula (usando Assunto como nome da aula)
      const cursoAula: CursoAula = {
        id: aula.id,
        nome: aula.Assunto, // Assunto é o nome da aula
        tema: aula.Tema,
        assunto: aula.Assunto,
        capa: aula.capa,
        video: aula.video,
        conteudo: aula.conteudo,
        material: aula.material,
        modulo: aula.Tema, // Tema é o módulo
        area: aula.Area,
        duracao: duracaoEstimada,
      };

      modulo.aulas.push(cursoAula);
      modulo.totalDuracao += duracaoEstimada;
      area.totalAulas++;
    });

    const areas = Array.from(areasMap.values());
    
    return {
      areas,
      totalAreas: areas.length,
      totalModulos: areas.reduce((total, area) => total + area.modulos.length, 0),
      totalAulas: areas.reduce((total, area) => total + area.totalAulas, 0),
    };
  }, [videoAulas]);

  return {
    ...cursosOrganizados,
    isLoading,
    error,
  };
};

// Hook para gerenciar progresso do usuário
export const useProgressoUsuario = () => {
  const [progresso, setProgresso] = useState<Map<number, ProgressoUsuario>>(new Map());

  // Carregar progresso do localStorage
  useEffect(() => {
    const progressoSalvo = localStorage.getItem('cursosProgressoUsuario');
    if (progressoSalvo) {
      try {
        const data = JSON.parse(progressoSalvo);
        const progressoMap = new Map<number, ProgressoUsuario>();
        
        Object.entries(data).forEach(([aulaId, prog]) => {
          progressoMap.set(Number(aulaId), {
            ...(prog as ProgressoUsuario),
            ultimoAcesso: new Date((prog as ProgressoUsuario).ultimoAcesso),
          });
        });
        
        setProgresso(progressoMap);
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    }
  }, []);

  // Salvar progresso no localStorage
  const salvarProgresso = (progressoMap: Map<number, ProgressoUsuario>) => {
    const progressoObj = Object.fromEntries(progressoMap);
    localStorage.setItem('cursosProgressoUsuario', JSON.stringify(progressoObj));
    setProgresso(new Map(progressoMap));
  };

  const atualizarProgresso = (aulaId: number, tempoAssistido: number, duracaoTotal: number) => {
    const novoProgresso = new Map(progresso);
    const percentual = Math.min(100, Math.round((tempoAssistido / duracaoTotal) * 100));
    const concluida = percentual >= 90; // Considera concluída com 90%

    novoProgresso.set(aulaId, {
      aulaId,
      percentualAssistido: percentual,
      tempoAssistido,
      concluida,
      ultimoAcesso: new Date(),
    });

    salvarProgresso(novoProgresso);
  };

  const obterProgresso = (aulaId: number): ProgressoUsuario | null => {
    return progresso.get(aulaId) || null;
  };

  const calcularProgressoModulo = (aulas: CursoAula[]): number => {
    if (aulas.length === 0) return 0;
    
    const aulasCompletas = aulas.filter(aula => {
      const prog = progresso.get(aula.id);
      return prog?.concluida || false;
    }).length;

    return Math.round((aulasCompletas / aulas.length) * 100);
  };

  const calcularProgressoArea = (area: CursoArea): number => {
    const todasAulas = area.modulos.flatMap(modulo => modulo.aulas);
    return calcularProgressoModulo(todasAulas);
  };

  return {
    progresso,
    atualizarProgresso,
    obterProgresso,
    calcularProgressoModulo,
    calcularProgressoArea,
  };
};