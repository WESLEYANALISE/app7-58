import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
  id: number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

export interface StudyProgress {
  flashcardId: number;
  status: 'conhecido' | 'revisar' | 'estudando';
  attempts: number;
  lastStudied: Date;
  difficulty: 'facil' | 'medio' | 'dificil';
}

export interface StudySession {
  id: string;
  date: Date;
  area: string;
  temas: string[];
  totalCards: number;
  correctAnswers: number;
  duration: number; // em minutos
}

export interface StudyPlan {
  id: string;
  name: string;
  areas: string[];
  temas: string[];
  dailyGoal: number;
  weeklyGoal: number;
  isActive: boolean;
  createdAt: Date;
}

export const useFlashcardsData = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar flashcards do Supabase com cache local (stale-while-revalidate)
  useEffect(() => {
    const cacheKey = 'flashcards-cache-v1';
    let hadCache = false;

    // Tentar servir imediatamente do cache local
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached?.data)) {
          setFlashcards(cached.data);
          setLoading(false); // entrada instantânea
          hadCache = true;
          console.log(`⚡ Flashcards carregados do cache: ${cached.data.length}`);
        }
      }
    } catch (e) {
      console.warn('Falha ao ler cache de flashcards', e);
    }

    const loadFlashcards = async () => {
      try {
        console.log('Iniciando carregamento de flashcards...');

        // Carregar todos os flashcards em lotes (evita limite do Supabase)
        let allFlashcards: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: batchData, error: batchError } = await (supabase as any)
            .from('FLASH-CARDS-FINAL')
            .select('id, area, tema, pergunta, resposta, exemplo')
            .order('area', { ascending: true })
            .order('tema', { ascending: true })
            .range(from, from + batchSize - 1);

          if (batchError) throw batchError;

          if (batchData && batchData.length > 0) {
            allFlashcards = [...allFlashcards, ...batchData];
            from += batchSize;
            hasMore = batchData.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        const mappedData = (allFlashcards || []).map(item => ({
          id: item.id,
          area: item.area || '',
          tema: item.tema || '',
          pergunta: item.pergunta || '',
          resposta: item.resposta || '',
          exemplo: item.exemplo || ''
        }));

        setFlashcards(mappedData);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data: mappedData, updatedAt: Date.now() }));
        } catch {}

        const uniqueAreas = [...new Set(mappedData.map(f => f.area))].filter(Boolean);
        console.log(`📚 ${uniqueAreas.length} áreas únicas encontradas`);
      } catch (error) {
        console.error('❌ Erro ao carregar flashcards:', error);
        if (!hadCache) {
          toast({
            title: "Erro ao Carregar",
            description: "Não foi possível carregar os flashcards. Tente novamente.",
            variant: "destructive"
          });
        }
      } finally {
        if (!hadCache) setLoading(false);
      }
    };

    loadFlashcards();
    loadProgressFromStorage();
    loadSessionsFromStorage();
    loadStudyPlansFromStorage();
  }, [toast]);

  // Carregar dados do localStorage
  const loadProgressFromStorage = () => {
    const saved = localStorage.getItem('flashcards-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed.map((p: any) => ({
          ...p,
          lastStudied: new Date(p.lastStudied)
        })));
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    }
  };

  const loadSessionsFromStorage = () => {
    const saved = localStorage.getItem('flashcards-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed.map((s: any) => ({
          ...s,
          date: new Date(s.date)
        })));
      } catch (error) {
        console.error('Erro ao carregar sessões:', error);
      }
    }
  };

  const loadStudyPlansFromStorage = () => {
    const saved = localStorage.getItem('flashcards-study-plans');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudyPlans(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        })));
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    }
  };

  // Salvar dados no localStorage
  const saveProgress = (newProgress: StudyProgress[]) => {
    localStorage.setItem('flashcards-progress', JSON.stringify(newProgress));
    setProgress(newProgress);
  };

  const saveSessions = (newSessions: StudySession[]) => {
    localStorage.setItem('flashcards-sessions', JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const saveStudyPlans = (newPlans: StudyPlan[]) => {
    localStorage.setItem('flashcards-study-plans', JSON.stringify(newPlans));
    setStudyPlans(newPlans);
  };

  // Atualizar progresso de um flashcard
  const updateFlashcardProgress = (flashcardId: string, status: 'conhecido' | 'revisar', difficulty: 'facil' | 'medio' | 'dificil' = 'medio') => {
    const existing = progress.find(p => p.flashcardId.toString() === flashcardId);
    const newProgress = existing
      ? { ...existing, status, attempts: existing.attempts + 1, lastStudied: new Date(), difficulty }
      : { flashcardId: parseInt(flashcardId), status, attempts: 1, lastStudied: new Date(), difficulty };

    const updatedProgress = progress.filter(p => p.flashcardId.toString() !== flashcardId).concat(newProgress);
    saveProgress(updatedProgress);
  };

  // Salvar sessão de estudo
  const saveStudySession = (area: string, temas: string[], totalCards: number, correctAnswers: number, duration: number) => {
    const session: StudySession = {
      id: Date.now().toString(),
      date: new Date(),
      area,
      temas,
      totalCards,
      correctAnswers,
      duration
    };

    const newSessions = [session, ...sessions].slice(0, 50); // Manter apenas as últimas 50 sessões
    saveSessions(newSessions);
  };

  // Criar plano de estudo
  const createStudyPlan = (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => {
    const newPlan: StudyPlan = {
      ...plan,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    // Desativar outros planos se este for ativo
    const updatedPlans = plan.isActive 
      ? studyPlans.map(p => ({ ...p, isActive: false })).concat(newPlan)
      : [...studyPlans, newPlan];

    saveStudyPlans(updatedPlans);
    return newPlan;
  };

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalCards = flashcards.length;
    const studiedCards = progress.length;
    const conhecidos = progress.filter(p => p.status === 'conhecido').length;
    const paraRevisar = progress.filter(p => p.status === 'revisar').length;

    // Performance por área
    const areaPerformance = flashcards.reduce((acc, card) => {
      const cardProgress = progress.find(p => p.flashcardId === card.id);
      if (!acc[card.area]) {
        acc[card.area] = { total: 0, conhecidos: 0, paraRevisar: 0 };
      }
      acc[card.area].total++;
      if (cardProgress?.status === 'conhecido') acc[card.area].conhecidos++;
      if (cardProgress?.status === 'revisar') acc[card.area].paraRevisar++;
      return acc;
    }, {} as Record<string, { total: number; conhecidos: number; paraRevisar: number }>);

    // Streak de estudos (dias consecutivos)
    const today = new Date();
    const recentSessions = sessions.filter(s => {
      const daysDiff = Math.floor((today.getTime() - s.date.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff < 30;
    });

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dayHasSession = recentSessions.some(s => 
        s.date.toDateString() === checkDate.toDateString()
      );
      if (dayHasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalCards,
      studiedCards,
      conhecidos,
      paraRevisar,
      accuracy: studiedCards > 0 ? Math.round((conhecidos / studiedCards) * 100) : 0,
      areaPerformance,
      totalSessions: sessions.length,
      streak,
      avgSessionDuration: sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length) : 0
    };
  }, [flashcards, progress, sessions]);

  // Cards que precisam de revisão (estudados há mais de 3 dias ou marcados para revisar)
  const cardsForReview = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return flashcards.filter(card => {
      const cardProgress = progress.find(p => p.flashcardId === card.id);
      if (!cardProgress) return false;
      
      return cardProgress.status === 'revisar' || 
             (cardProgress.status === 'conhecido' && cardProgress.lastStudied < threeDaysAgo);
    });
  }, [flashcards, progress]);

  // Areas únicas
  const areas = useMemo(() => {
    const uniqueAreas = [...new Set(flashcards.map(card => card.area))].filter(Boolean).sort();
    console.log('Áreas únicas encontradas:', uniqueAreas);
    console.log('Total de flashcards:', flashcards.length);
    if (flashcards.length > 0) {
      console.log('Primeiros 3 flashcards áreas:', flashcards.slice(0, 3).map(f => f.area));
    }
    return uniqueAreas;
  }, [flashcards]);

  // Temas por área
  const getTemasByArea = (area: string) => {
    return [...new Set(flashcards
      .filter(card => card.area === area)
      .map(card => card.tema)
    )].filter(Boolean).sort();
  };

  return {
    flashcards,
    progress,
    sessions,
    studyPlans,
    loading,
    metrics,
    cardsForReview,
    areas,
    getTemasByArea,
    updateFlashcardProgress,
    saveStudySession,
    createStudyPlan,
    saveStudyPlans
  };
};