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

export interface AulaFaculdade {
  id: number;
  semestre: string;
  modulo: string;
  tema: string;
  'numero-aula': string;
  Assunto: string;
  video: string;
  conteudo: string;
  material: string;
  'capa-semestre': string;
  'capa-modulo': string;
  'capa-tema': string;
  'capa-assunto': string;
}

export interface SemestreFaculdade {
  numero: string;
  nome: string;
  capa: string;
  modulos: ModuloFaculdade[];
  totalAulas: number;
}

export interface ModuloFaculdade {
  nome: string;
  capa: string;
  semestre: string;
  temas: TemaFaculdade[];
  totalDuracao: number;
}

export interface TemaFaculdade {
  nome: string;
  capa: string;
  modulo: string;
  semestre: string;
  aulas: AulaFaculdadeCompleta[];
  totalDuracao: number;
}

export interface AulaFaculdadeCompleta {
  id: number;
  nome: string;
  numeroAula: string;
  capa: string;
  video: string;
  conteudo: string;
  material: string;
  tema: string;
  modulo: string;
  semestre: string;
  duracao: number; // em minutos, calculado baseado no conteúdo
}

export interface ProgressoFaculdade {
  aulaId: number;
  percentualAssistido: number;
  tempoAssistido: number; // em segundos
  concluida: boolean;
  ultimoAcesso: Date;
}

export const useCursoFaculdade = () => {
  return useOptimizedQuery({
    queryKey: ['curso-faculdade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('CURSO-FACULDADE' as any)
        .select('*')
        .order('numero-aula');
      
      if (error) {
        console.error('Erro ao buscar cursos de faculdade:', error);
        throw error;
      }
      
      return (data as unknown as AulaFaculdade[]) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes cache
    useExternalCache: true,
  });
};

export const useFaculdadeOrganizada = () => {
  const { data: aulasFaculdade, isLoading, error } = useCursoFaculdade();

  const cursosOrganizados = useMemo(() => {
    if (!aulasFaculdade) return { semestres: [], totalSemestres: 0, totalModulos: 0, totalAulas: 0 };

    const semestresMap = new Map<string, SemestreFaculdade>();

    // Ordenar aulas pela coluna "numero-aula" (ordem numérica)
    const aulasOrdenadas = [...aulasFaculdade].sort((a, b) => {
      const aulaA = parseInt(a['numero-aula']?.toString() || '0');
      const aulaB = parseInt(b['numero-aula']?.toString() || '0');
      return aulaA - aulaB;
    });

    aulasOrdenadas.forEach((aula) => {
      const semestreKey = aula.semestre;
      const moduloKey = aula.modulo;
      const temaKey = aula.tema;

      // Criar semestre se não existir
      if (!semestresMap.has(semestreKey)) {
        semestresMap.set(semestreKey, {
          numero: aula.semestre,
          nome: `${aula.semestre}º Semestre`,
          capa: ensurePublicUrl('CAPA MODULO', aula['capa-semestre']),
          modulos: [],
          totalAulas: 0,
        });
      }

      const semestre = semestresMap.get(semestreKey)!;
      
      // Atualiza capa do semestre se ainda não definida
      if (!semestre.capa && aula['capa-semestre']) {
        semestre.capa = ensurePublicUrl('CAPA MODULO', aula['capa-semestre']);
      }

      // Encontrar ou criar módulo
      let modulo = semestre.modulos.find(m => m.nome === moduloKey);
      if (!modulo) {
        modulo = {
          nome: aula.modulo,
          capa: ensurePublicUrl('CAPA MODULO', aula['capa-modulo']),
          semestre: aula.semestre,
          temas: [],
          totalDuracao: 0,
        };
        semestre.modulos.push(modulo);
      }

      // Atualiza capa do módulo se ainda não definida
      if (!modulo.capa && aula['capa-modulo']) {
        modulo.capa = ensurePublicUrl('CAPA MODULO', aula['capa-modulo']);
      }

      // Encontrar ou criar tema
      let tema = modulo.temas.find(t => t.nome === temaKey);
      if (!tema) {
        tema = {
          nome: aula.tema,
          capa: ensurePublicUrl('CAPA MODULO', aula['capa-tema']),
          modulo: aula.modulo,
          semestre: aula.semestre,
          aulas: [],
          totalDuracao: 0,
        };
        modulo.temas.push(tema);
      }

      // Atualiza capa do tema se ainda não definida
      if (!tema.capa && aula['capa-tema']) {
        tema.capa = ensurePublicUrl('CAPA MODULO', aula['capa-tema']);
      }

      // Estimar duração baseada no conteúdo (aproximadamente 150 palavras por minuto)
      const palavras = aula.conteudo ? aula.conteudo.split(' ').length : 0;
      const duracaoEstimada = Math.max(5, Math.round(palavras / 150)); // mínimo 5 minutos

      // Adicionar aula
      const aulaCompleta: AulaFaculdadeCompleta = {
        id: aula.id,
        nome: aula.Assunto,
        numeroAula: aula['numero-aula'],
        capa: aula['capa-assunto'],
        video: aula.video,
        conteudo: aula.conteudo,
        material: aula.material,
        tema: aula.tema,
        modulo: aula.modulo,
        semestre: aula.semestre,
        duracao: duracaoEstimada,
      };

      tema.aulas.push(aulaCompleta);
      tema.totalDuracao += duracaoEstimada;
      modulo.totalDuracao += duracaoEstimada;
      semestre.totalAulas++;
    });

    const semestres = Array.from(semestresMap.values());
    
    return {
      semestres,
      totalSemestres: semestres.length,
      totalModulos: semestres.reduce((total, sem) => total + sem.modulos.length, 0),
      totalAulas: semestres.reduce((total, sem) => total + sem.totalAulas, 0),
    };
  }, [aulasFaculdade]);

  return {
    ...cursosOrganizados,
    isLoading,
    error,
  };
};

// Hook para gerenciar progresso do usuário na faculdade
export const useProgressoFaculdade = () => {
  const [progresso, setProgresso] = useState<Map<number, ProgressoFaculdade>>(new Map());

  // Carregar progresso do localStorage
  useEffect(() => {
    const progressoSalvo = localStorage.getItem('faculdadeProgressoUsuario');
    if (progressoSalvo) {
      try {
        const data = JSON.parse(progressoSalvo);
        const progressoMap = new Map<number, ProgressoFaculdade>();
        
        Object.entries(data).forEach(([aulaId, prog]) => {
          progressoMap.set(Number(aulaId), {
            ...(prog as ProgressoFaculdade),
            ultimoAcesso: new Date((prog as ProgressoFaculdade).ultimoAcesso),
          });
        });
        
        setProgresso(progressoMap);
      } catch (error) {
        console.error('Erro ao carregar progresso da faculdade:', error);
      }
    }
  }, []);

  // Salvar progresso no localStorage
  const salvarProgresso = (progressoMap: Map<number, ProgressoFaculdade>) => {
    const progressoObj = Object.fromEntries(progressoMap);
    localStorage.setItem('faculdadeProgressoUsuario', JSON.stringify(progressoObj));
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

  const obterProgresso = (aulaId: number): ProgressoFaculdade | null => {
    return progresso.get(aulaId) || null;
  };

  const calcularProgressoTema = (aulas: AulaFaculdadeCompleta[]): number => {
    if (aulas.length === 0) return 0;
    
    const aulasCompletas = aulas.filter(aula => {
      const prog = progresso.get(aula.id);
      return prog?.concluida || false;
    }).length;

    return Math.round((aulasCompletas / aulas.length) * 100);
  };

  const calcularProgressoModulo = (temas: TemaFaculdade[]): number => {
    const todasAulas = temas.flatMap(tema => tema.aulas);
    return calcularProgressoTema(todasAulas);
  };

  const calcularProgressoSemestre = (semestre: SemestreFaculdade): number => {
    const todasAulas = semestre.modulos.flatMap(modulo => modulo.temas.flatMap(tema => tema.aulas));
    return calcularProgressoTema(todasAulas);
  };

  return {
    progresso,
    atualizarProgresso,
    obterProgresso,
    calcularProgressoTema,
    calcularProgressoModulo,
    calcularProgressoSemestre,
  };
};