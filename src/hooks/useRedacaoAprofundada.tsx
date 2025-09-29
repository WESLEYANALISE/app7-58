import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnaliseRedacaoAprofundada {
  resumo: string;
  nota: string;
  pontos_fortes: string[];
  melhorias: string[];
  analise_tecnica: {
    legislacaoRelacionada: string[];
    jurisprudenciaRelevante: string[];
    impactosPraticos: string[];
    recomendacoesTecnicas: string[];
  };
}

export type TipoRedacaoAprofundada = 'dissertativa' | 'parecer' | 'peca';

export const useRedacaoAprofundada = () => {
  const [loading, setLoading] = useState(false);
  const [analiseAprofundada, setAnaliseAprofundada] = useState<AnaliseRedacaoAprofundada | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analisarRedacaoAprofundada = async (texto: string, tipo: TipoRedacaoAprofundada) => {
    setLoading(true);
    setError(null);
    
    try {
      // Chamar edge function de análise aprofundada de redação
      const { data, error } = await supabase.functions.invoke('analyze-legal-writing', {
        body: {
          texto: texto,
          tipo: tipo
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao analisar redação');
      }

      if (!data) {
        throw new Error('Nenhuma resposta recebida da análise');
      }

      setAnaliseAprofundada(data);
    } catch (err) {
      console.error('Erro ao analisar redação aprofundada:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido na análise');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalise = () => {
    setAnaliseAprofundada(null);
    setError(null);
  };

  return {
    loading,
    analiseAprofundada,
    error,
    analisarRedacaoAprofundada,
    resetAnalise
  };
};