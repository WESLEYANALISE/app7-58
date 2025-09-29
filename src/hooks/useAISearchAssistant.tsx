import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AISearchSuggestion {
  type: 'material' | 'suggestion' | 'study_plan';
  content: string;
  materials: {
    title: string;
    type: 'video' | 'livro' | 'artigo' | 'resumo' | 'flashcard';
    source: string;
    description: string;
  }[];
}

export const useAISearchAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISearchSuggestion | null>(null);
  const { toast } = useToast();

  const askAI = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Preparar contexto com materiais disponíveis
      const materialContext = `
      Você é uma professora especialista em Direito e tem acesso aos seguintes materiais educacionais:
      
      VÍDEO-AULAS: Aulas em vídeo sobre diferentes áreas do direito
      LIVROS: Biblioteca com livros jurídicos e de outras áreas
      ARTIGOS: Artigos comentados sobre legislação
      RESUMOS: Resumos jurídicos organizados por área e tema
      FLASHCARDS: Cards para estudo e memorização
      NOTÍCIAS: Notícias jurídicas atualizadas
      
      Quando o usuário perguntar sobre algo, sugira materiais específicos que temos disponíveis
      e explique como eles podem ajudar no estudo do tópico solicitado.
      
      Pergunta do usuário: "${query}"
      
      Responda de forma didática e sugira materiais relevantes que temos na plataforma.
      `;

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: materialContext,
          history: []
        }
      });

      if (error) throw error;

      // Processar resposta da IA para extrair sugestões
      const aiResponse = data.content || data.response || '';
      
      // Simular categorização de materiais (em um cenário real, a IA retornaria estruturado)
      const suggestion: AISearchSuggestion = {
        type: 'suggestion',
        content: aiResponse,
        materials: [
          // Aqui você poderia implementar lógica para buscar materiais reais baseados na resposta da IA
          {
            title: 'Material sugerido pela IA',
            type: 'video',
            source: 'Sugestão automática',
            description: 'Material relacionado ao seu interesse de estudo'
          }
        ]
      };

      setSuggestions(suggestion);
      
      toast({
        title: "IA Professora respondeu!",
        description: "Confira as sugestões de materiais para seu estudo.",
      });

    } catch (error) {
      console.error('Erro ao consultar IA:', error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível obter sugestões da IA no momento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions(null);
  };

  return {
    isLoading,
    suggestions,
    askAI,
    clearSuggestions
  };
};