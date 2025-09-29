import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cacheManager } from '@/utils/cacheManager';
import { useToast } from '@/hooks/use-toast';

export interface GeminiResponse {
  content: string;
  slides?: Array<{
    title: string;
    content: string;
    bulletPoints?: string[];
  }>;
}

export const useGeminiAI = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, GeminiResponse>>({});
  const { toast } = useToast();

  const callGeminiAPI = useCallback(async (
    action: 'explicar' | 'exemplo' | 'apresentar',
    article: string,
    articleNumber: string,
    codeName: string
  ): Promise<GeminiResponse | null> => {
    const cacheKey = `gemini-${action}-${codeName}-${articleNumber}`;
    
    // Check cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      setResponses(prev => ({ ...prev, [action]: cached }));
      return cached;
    }

    const loadingKey = `${action}-${articleNumber}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
        body: {
          action,
          article,
          articleNumber,
          codeName,
          hasArticle: Boolean(article)
        }
      });

      if (error) throw error;

      let response: GeminiResponse;
      
      if (action === 'apresentar' && data.content) {
        // Parse slides for presentation
        const slides = parseSlides(data.content);
        response = { content: data.content, slides };
      } else {
        response = { content: data.content || 'Resposta não disponível.' };
      }

      setResponses(prev => ({ ...prev, [action]: response }));
      
      // Cache for 1 hour
      cacheManager.set(cacheKey, response, 60 * 60 * 1000);
      
      toast({
        title: "Sucesso!",
        description: `${action === 'explicar' ? 'Explicação' : action === 'exemplo' ? 'Exemplo' : 'Apresentação'} gerada com sucesso.`,
      });

      return response;
    } catch (error: any) {
      console.error('Erro na API Gemini:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [toast]);

  const parseSlides = useCallback((content: string) => {
    const slides = [];
    const slideBlocks = content.split(/Slide \d+:/);
    
    for (let i = 1; i < slideBlocks.length; i++) {
      const slideContent = slideBlocks[i].trim();
      const lines = slideContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length > 0) {
        const title = lines[0].replace(/^\*\*|\*\*$/g, '').trim();
        const bulletPoints = lines.slice(1)
          .filter(line => line.startsWith('- '))
          .map(line => line.substring(2).trim());
        
        const contentText = lines.slice(1)
          .filter(line => !line.startsWith('- '))
          .join(' ')
          .trim();

        slides.push({
          title,
          content: contentText,
          bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined
        });
      }
    }
    
    return slides.length > 0 ? slides : [{ title: 'Apresentação', content }];
  }, []);

  const clearResponse = useCallback((action: string) => {
    setResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[action];
      return newResponses;
    });
  }, []);

  return {
    loading,
    responses,
    callGeminiAPI,
    clearResponse
  };
};