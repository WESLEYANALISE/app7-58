import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RedacaoHistoricoItem {
  id: string;
  titulo: string;
  tipo_redacao: string;
  texto_original: string;
  analise: any;
  arquivo_url?: string | null;
  nome_arquivo?: string | null;
  pontos_fortes: string[];
  pontos_melhoria: string[];
  nota: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useRedacaoHistory = () => {
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<RedacaoHistoricoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const buscarHistorico = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('redacao_historico')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setHistorico(data as RedacaoHistoricoItem[] || []);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const salvarAnalise = async (analiseData: {
    titulo: string;
    tipo_redacao: 'dissertativa' | 'parecer' | 'peca';
    texto_original: string;
    analise: any;
    arquivo_url?: string;
    nome_arquivo?: string;
    pontos_fortes: string[];
    pontos_melhoria: string[];
    nota: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('redacao_historico')
        .insert({
          ...analiseData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar histórico local
      setHistorico(prev => [data as RedacaoHistoricoItem, ...prev]);
      
      toast({
        title: "Análise salva!",
        description: "Sua análise foi salva no histórico.",
      });
      
      return data;
    } catch (err) {
      console.error('Erro ao salvar análise:', err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a análise.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const excluirAnalise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('redacao_historico')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setHistorico(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Análise excluída",
        description: "A análise foi removida do histórico.",
      });
    } catch (err) {
      console.error('Erro ao excluir análise:', err);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a análise.",
        variant: "destructive",
      });
    }
  };

  const buscarPorTipo = async (tipo: 'dissertativa' | 'parecer' | 'peca') => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('redacao_historico')
        .select('*')
        .eq('tipo_redacao', tipo)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setHistorico(data as RedacaoHistoricoItem[] || []);
    } catch (err) {
      console.error('Erro ao buscar por tipo:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarHistorico();
  }, []);

  return {
    loading,
    historico,
    error,
    buscarHistorico,
    salvarAnalise,
    excluirAnalise,
    buscarPorTipo
  };
};