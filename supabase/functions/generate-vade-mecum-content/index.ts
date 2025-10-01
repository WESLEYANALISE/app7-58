import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleContent, articleNumber, codeName, userId, type } = await req.json();

    if (!articleContent || !userId) {
      throw new Error('Conteúdo do artigo e userId são obrigatórios');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let prompt: string;
    let generateResponse: any;

    if (type === 'flashcard') {
      prompt = `Você é um especialista em criar flashcards educativos de Direito.

TAREFA: Analise o artigo jurídico abaixo e crie EXATAMENTE 10 flashcards detalhados.

ARTIGO: ${articleNumber} do ${codeName}
CONTEÚDO: ${articleContent}

INSTRUÇÕES OBRIGATÓRIAS:
1. Gere EXATAMENTE 10 flashcards (não menos, não mais)
2. Cada flashcard deve cobrir um aspecto diferente do artigo
3. Desmembre o artigo completamente: conceito, elementos, exceções, aplicações, consequências, procedimentos, prazos, jurisprudência, dicas e pegadinhas

FORMATO JSON OBRIGATÓRIO (copie exatamente esta estrutura):
{
  "flashcards": [
    {
      "pergunta": "texto da pergunta 1",
      "resposta": "texto da resposta 1",
      "exemplo": "texto do exemplo 1"
    },
    {
      "pergunta": "texto da pergunta 2",
      "resposta": "texto da resposta 2",
      "exemplo": "texto do exemplo 2"
    },
    {
      "pergunta": "texto da pergunta 3",
      "resposta": "texto da resposta 3",
      "exemplo": "texto do exemplo 3"
    },
    {
      "pergunta": "texto da pergunta 4",
      "resposta": "texto da resposta 4",
      "exemplo": "texto do exemplo 4"
    },
    {
      "pergunta": "texto da pergunta 5",
      "resposta": "texto da resposta 5",
      "exemplo": "texto do exemplo 5"
    },
    {
      "pergunta": "texto da pergunta 6",
      "resposta": "texto da resposta 6",
      "exemplo": "texto do exemplo 6"
    },
    {
      "pergunta": "texto da pergunta 7",
      "resposta": "texto da resposta 7",
      "exemplo": "texto do exemplo 7"
    },
    {
      "pergunta": "texto da pergunta 8",
      "resposta": "texto da resposta 8",
      "exemplo": "texto do exemplo 8"
    },
    {
      "pergunta": "texto da pergunta 9",
      "resposta": "texto da resposta 9",
      "exemplo": "texto do exemplo 9"
    },
    {
      "pergunta": "texto da pergunta 10",
      "resposta": "texto da resposta 10",
      "exemplo": "texto do exemplo 10"
    }
  ]
}

ATENÇÃO: Retorne APENAS o JSON válido, sem texto adicional antes ou depois.`;

      const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Você é uma IA jurídica especializada em criar flashcards. Gere SEMPRE exatamente 10 flashcards. Responda APENAS com JSON válido, sem texto adicional.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!aiResp.ok) {
        const errorText = await aiResp.text();
        if (aiResp.status === 429) {
          throw new Error('Limite de taxa excedido. Tente novamente em instantes.');
        }
        if (aiResp.status === 402) {
          throw new Error('Créditos de IA esgotados. Adicione saldo ao workspace.');
        }
        console.error('AI gateway error response:', errorText);
        throw new Error(`AI gateway error: ${aiResp.status}`);
      }

      const aiJson = await aiResp.json();
      const generatedText = aiJson?.choices?.[0]?.message?.content as string | undefined;
      if (!generatedText) {
        throw new Error('Resposta vazia do modelo');
      }
      
      console.log('Resposta bruta do modelo:', generatedText.substring(0, 500));
      
      // Extrair JSON do texto gerado (limpar markdown se houver)
      let cleanedText = generatedText.trim();
      
      // Remover markdown code blocks se existirem
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
      }
      
      // Encontrar o JSON
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Texto completo da resposta:', generatedText);
        throw new Error('Não foi possível extrair JSON válido da resposta');
      }

      try {
        generateResponse = JSON.parse(jsonMatch[0]);
        
        // Validar que temos exatamente 10 flashcards
        if (!generateResponse.flashcards || !Array.isArray(generateResponse.flashcards)) {
          throw new Error('JSON não contém array de flashcards');
        }
        
        console.log(`Total de flashcards gerados: ${generateResponse.flashcards.length}`);
        
        if (generateResponse.flashcards.length < 10) {
          console.warn(`Aviso: Apenas ${generateResponse.flashcards.length} flashcards foram gerados (esperado: 10)`);
        }
        
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        console.error('JSON problemático:', jsonMatch[0].substring(0, 1000));
        const errorMessage = parseError instanceof Error ? parseError.message : 'Erro desconhecido';
        throw new Error(`Erro ao processar JSON: ${errorMessage}`);
      }

      // Salvar múltiplos flashcards no banco
      const flashcardsToInsert = generateResponse.flashcards.map((card: any) => ({
        user_id: userId,
        article_number: articleNumber,
        code_name: codeName,
        article_content: articleContent,
        pergunta: card.pergunta,
        resposta: card.resposta,
        dica: card.exemplo || card.dica // Aceita tanto exemplo quanto dica para retrocompatibilidade
      }));

      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from('vade_mecum_flashcards')
        .insert(flashcardsToInsert)
        .select();

      if (flashcardsError) throw flashcardsError;

      return new Response(JSON.stringify({ 
        success: true, 
        flashcards: flashcardsData,
        type: 'flashcard'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === 'questao') {
      prompt = `
        Baseado no seguinte artigo jurídico, gere uma questão de múltipla escolha:
        
        Artigo: ${articleNumber} - ${codeName}
        Conteúdo: ${articleContent}
        
        Crie:
        1. Uma questão clara sobre o artigo
        2. 4 alternativas (A, B, C, D)
        3. Indique qual é a resposta correta (A, B, C ou D)
        4. Uma explicação detalhada da resposta
        
        Retorne APENAS um JSON válido no formato:
        {
          "questao": "questão aqui",
          "alternativa_a": "alternativa A",
          "alternativa_b": "alternativa B", 
          "alternativa_c": "alternativa C",
          "alternativa_d": "alternativa D",
          "resposta_correta": "A",
          "explicacao": "explicação aqui"
        }
      `;

      const aiResp2 = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Você é uma IA jurídica. Gere questão objetiva com 4 alternativas e resposta. Responda APENAS com JSON válido.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!aiResp2.ok) {
        const errorText = await aiResp2.text();
        if (aiResp2.status === 429) {
          throw new Error('Limite de taxa excedido. Tente novamente em instantes.');
        }
        if (aiResp2.status === 402) {
          throw new Error('Créditos de IA esgotados. Adicione saldo ao workspace.');
        }
        console.error('AI gateway error response:', errorText);
        throw new Error(`AI gateway error: ${aiResp2.status}`);
      }

      const aiJson2 = await aiResp2.json();
      const generatedText = aiJson2?.choices?.[0]?.message?.content as string | undefined;
      if (!generatedText) {
        throw new Error('Resposta vazia do modelo');
      }
      
      // Extrair JSON do texto gerado
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Não foi possível extrair JSON válido da resposta');
      }

      generateResponse = JSON.parse(jsonMatch[0]);

      // Salvar questão no banco
      const { data: questaoData, error: questaoError } = await supabase
        .from('vade_mecum_questoes')
        .insert({
          user_id: userId,
          article_number: articleNumber,
          code_name: codeName,
          article_content: articleContent,
          questao: generateResponse.questao,
          alternativa_a: generateResponse.alternativa_a,
          alternativa_b: generateResponse.alternativa_b,
          alternativa_c: generateResponse.alternativa_c,
          alternativa_d: generateResponse.alternativa_d,
          resposta_correta: generateResponse.resposta_correta,
          explicacao: generateResponse.explicacao
        })
        .select()
        .single();

      if (questaoError) throw questaoError;

      return new Response(JSON.stringify({ 
        success: true, 
        questao: questaoData,
        type: 'questao'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Tipo inválido. Use "flashcard" ou "questao"');

  } catch (error: any) {
    console.error('Erro na função generate-vade-mecum-content:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});