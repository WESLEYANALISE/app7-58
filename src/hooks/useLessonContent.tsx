import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ContentType = 'summary' | 'flashcards' | 'quiz';

export interface LessonSummary {
  titulo: string;
  introducao: string;
  conceitos_principais: Array<{
    conceito: string;
    definicao: string;
    exemplo: string;
  }>;
  pontos_importantes: string[];
  legislacao_aplicavel: Array<{
    lei: string;
    artigos: string;
    relevancia: string;
  }>;
  jurisprudencia: Array<{
    tribunal: string;
    tema: string;
    importancia: string;
  }>;
  aplicacao_pratica: string;
  conclusao: string;
}

export interface LessonFlashcard {
  id: number;
  pergunta: string;
  resposta: string;
  dica: string;
  categoria: 'conceito' | 'legislacao' | 'jurisprudencia' | 'pratica';
}

export interface LessonFlashcards {
  titulo: string;
  total_cards: number;
  flashcards: LessonFlashcard[];
}

export interface QuizQuestion {
  id: number;
  pergunta: string;
  alternativas: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  resposta_correta: 'a' | 'b' | 'c' | 'd';
  explicacao: string;
  nivel: 'facil' | 'medio' | 'dificil';
}

export interface LessonQuiz {
  titulo: string;
  instrucoes: string;
  total_questoes: number;
  questoes: QuizQuestion[];
}

export interface LessonData {
  id: number;
  area: string;
  tema: string;
  assunto: string;
  conteudo?: string;
}

export const useLessonContent = () => {
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const generateContent = async (
    lesson: LessonData,
    contentType: ContentType
  ): Promise<LessonSummary | LessonFlashcards | LessonQuiz | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('generate-lesson-content', {
        body: {
          lessonId: lesson.id,
          lessonArea: lesson.area,
          lessonTema: lesson.tema,
          lessonAssunto: lesson.assunto,
          lessonConteudo: lesson.conteudo || '',
          contentType
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar conteúdo');
      }

      // sucesso silencioso - sem toast

      return data.content;

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro ao gerar conteúdo",
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (
    lesson: LessonData,
    content: LessonSummary | LessonFlashcards | LessonQuiz,
    contentType: ContentType
  ): Promise<string | null> => {
    try {
      setGeneratingPDF(true);

      // Por enquanto, apenas notificar que será implementado
      toast({
        title: "PDF será implementado",
        description: "Funcionalidade em desenvolvimento.",
      });

      return null;

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: "destructive",
      });
      return null;
    } finally {
      setGeneratingPDF(false);
    }
  };

  return {
    loading,
    generatingPDF,
    generateContent,
    exportToPDF,
  };
};