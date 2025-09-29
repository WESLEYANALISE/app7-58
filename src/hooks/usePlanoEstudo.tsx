import { useState } from 'react';
import { FormularioPlanoData, PlanoEstudoGerado, AnaliseArquivo } from '@/components/PlanoEstudo/types';
import { supabase } from '@/integrations/supabase/client';
import { usePlanoEstudoHistory } from './usePlanoEstudoHistory';

export const usePlanoEstudo = () => {
  const [loading, setLoading] = useState(false);
  const [loadingAnalise, setLoadingAnalise] = useState(false);
  const [planoGerado, setPlanoGerado] = useState<PlanoEstudoGerado | null>(null);
  const [analiseArquivo, setAnaliseArquivo] = useState<AnaliseArquivo | null>(null);
  const [dadosFormulario, setDadosFormulario] = useState<FormularioPlanoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToHistory } = usePlanoEstudoHistory();

  const analisarArquivo = async (dados: FormularioPlanoData) => {
    if (!dados.arquivo) return;
    
    setLoadingAnalise(true);
    setError(null);
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove o prefixo data:...;base64,
        };
        reader.onerror = reject;
        reader.readAsDataURL(dados.arquivo!);
      });

      const prompt = `Analise este material e me forneça:
1. Um resumo detalhado do conteúdo (máximo 300 palavras)
2. O assunto principal que está sendo abordado
3. Um nível de confiança (0-100%) sobre a precisão da análise

Responda APENAS no formato JSON:
{
  "resumo": "string",
  "assunto": "string", 
  "confianca": number
}`;

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          fileData: {
            data: base64,
            mimeType: dados.arquivo.type,
            name: dados.arquivo.name
          },
          conversationHistory: []
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao analisar arquivo');
      }

      if (!data || !data.success) {
        throw new Error((data && data.error) || 'Erro ao processar resposta da IA');
      }

      // Tentar parsear JSON da resposta
      let analise: AnaliseArquivo;
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : data.response;
        analise = JSON.parse(jsonStr);
      } catch (parseError) {
        // Fallback se não conseguir parsear
        analise = {
          resumo: 'Não foi possível analisar completamente o conteúdo do arquivo.',
          assunto: dados.materia || 'Material de estudo',
          confianca: 50
        };
      }

      setAnaliseArquivo(analise);
      setDadosFormulario(dados);
    } catch (err) {
      console.error('Erro ao analisar arquivo:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingAnalise(false);
    }
  };

  const gerarPlano = async (dados: FormularioPlanoData) => {
    if (dados.arquivo && !analiseArquivo) {
      // Se tem arquivo mas não foi analisado ainda, analisa primeiro
      await analisarArquivo(dados);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const totalHorasDisponiveis = dados.dias * dados.horasPorDia;
      
      let basePrompt = `
- Duração: ${dados.dias} dias
- Tempo diário disponível: ${dados.horasPorDia} horas/dia
- Total de horas: ${totalHorasDisponiveis} horas
- Área: Direito Brasileiro

IMPORTANTE sobre distribuição de tempo:
- Distribua as ${dados.horasPorDia} horas EXATAMENTE por dia
- As atividades de cada dia devem somar EXATAMENTE ${dados.horasPorDia} horas
- Use incrementos de 0.5h (30min), 1h, 1.5h, 2h, etc.
- Inclua pequenos intervalos de descanso (15-30min) entre estudos longos
- Varie os tipos de atividade para manter o engajamento

Estruture o plano da seguinte forma:

1. TÍTULO do plano de estudos
2. RESUMO (3-4 linhas explicando a estratégia)
3. CRONOGRAMA DETALHADO dia a dia:
   - Para cada dia, especifique atividades que somem EXATAMENTE ${dados.horasPorDia}h:
     * Atividades de estudo (1-2h por bloco)
     * Revisões (30min-1h)
     * Exercícios práticos (1-1.5h)
     * Intervalos de descanso (15-30min)
     * Tópicos específicos a serem estudados
4. DICAS importantes para o sucesso
5. MATERIAIS recomendados (livros, artigos, jurisprudência)

Foque na legislação brasileira, jurisprudência atual e aplicação prática. O plano deve ser progressivo, com revisões periódicas e simulados.

FORMATO: Responda APENAS o JSON válido seguindo esta estrutura:
{
  "titulo": "string",
  "resumo": "string", 
  "cronograma": [
    {
      "dia": number,
      "atividades": [
        {
          "titulo": "string",
          "descricao": "string", 
          "tempo": number,
          "tipo": "estudo|revisao|exercicio|descanso"
        }
      ],
      "tempoTotal": ${dados.horasPorDia}
    }
  ],
  "dicas": ["string"],
  "materiais": ["string"]
}`;

      let prompt: string;
      if (analiseArquivo) {
        prompt = `Com base no material analisado: "${analiseArquivo.assunto}" (${analiseArquivo.resumo}), crie um plano de estudos detalhado para "${dados.materia}" com as seguintes especificações:`;
      } else {
        prompt = `Crie um plano de estudos detalhado para "${dados.materia}" com as seguintes especificações:`;
      }

      prompt += `
- Duração: ${dados.dias} dias
- Tempo diário disponível: ${dados.horasPorDia} horas/dia
- Total de horas: ${totalHorasDisponiveis} horas
- Área: Direito Brasileiro

IMPORTANTE sobre distribuição de tempo:
- Distribua as ${dados.horasPorDia} horas EXATAMENTE por dia
- As atividades de cada dia devem somar EXATAMENTE ${dados.horasPorDia} horas
- Use incrementos de 0.5h (30min), 1h, 1.5h, 2h, etc.
- Inclua pequenos intervalos de descanso (15-30min) entre estudos longos
- Varie os tipos de atividade para manter o engajamento

Estruture o plano da seguinte forma:

1. TÍTULO do plano de estudos
2. RESUMO (3-4 linhas explicando a estratégia)
3. CRONOGRAMA DETALHADO dia a dia:
   - Para cada dia, especifique atividades que somem EXATAMENTE ${dados.horasPorDia}h:
     * Atividades de estudo (1-2h por bloco)
     * Revisões (30min-1h)
     * Exercícios práticos (1-1.5h)
     * Intervalos de descanso (15-30min)
     * Tópicos específicos a serem estudados
4. DICAS importantes para o sucesso
5. MATERIAIS recomendados (livros, artigos, jurisprudência)

Foque na legislação brasileira, jurisprudência atual e aplicação prática. O plano deve ser progressivo, com revisões periódicas e simulados.

FORMATO: Responda APENAS o JSON válido seguindo esta estrutura:
{
  "titulo": "string",
  "resumo": "string", 
  "cronograma": [
    {
      "dia": number,
      "atividades": [
        {
          "titulo": "string",
          "descricao": "string", 
          "tempo": number,
          "tipo": "estudo|revisao|exercicio|descanso"
        }
      ],
      "tempoTotal": ${dados.horasPorDia}
    }
  ],
  "dicas": ["string"],
  "materiais": ["string"]
}`;

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao gerar plano de estudos');
      }

      if (!data || !data.success) {
        throw new Error((data && data.error) || 'Erro ao processar resposta da IA');
      }

      // Tentar parsear JSON da resposta
      let planoData: PlanoEstudoGerado;
      try {
        // Extrair JSON da resposta se vier com texto adicional
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : data.response;
        planoData = JSON.parse(jsonStr);
      } catch (parseError) {
        // Se não conseguir parsear, criar estrutura manualmente
        planoData = {
          titulo: `Plano de Estudos - ${dados.materia}`,
          resumo: data.response.substring(0, 200) + '...',
          cronograma: [],
          dicas: ['Revise diariamente', 'Faça exercícios práticos', 'Organize seu tempo'],
          materiais: ['Código Civil', 'Constituição Federal', 'Jurisprudência STF/STJ']
        };
      }

      setPlanoGerado(planoData);
      
      // Adicionar ao histórico
      addToHistory(planoData);
      
      // Limpar dados de análise após gerar o plano
      setAnaliseArquivo(null);
      setDadosFormulario(null);
    } catch (err) {
      console.error('Erro ao gerar plano:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const confirmarAnalise = () => {
    if (dadosFormulario) {
      gerarPlano(dadosFormulario);
    }
  };

  const recusarAnalise = () => {
    setAnaliseArquivo(null);
    setDadosFormulario(null);
  };

  const resetPlano = () => {
    setPlanoGerado(null);
    setAnaliseArquivo(null);
    setDadosFormulario(null);
    setError(null);
  };

  const loadPlano = (plano: PlanoEstudoGerado) => {
    setPlanoGerado(plano);
    setAnaliseArquivo(null);
    setDadosFormulario(null);
    setError(null);
  };

  return {
    loading,
    loadingAnalise,
    planoGerado,
    analiseArquivo,
    dadosFormulario,
    error,
    gerarPlano,
    confirmarAnalise,
    recusarAnalise,
    resetPlano,
    loadPlano
  };
};