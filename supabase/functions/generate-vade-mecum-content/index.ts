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
      prompt = `
        Baseado no seguinte artigo jurídico, gere 5 flashcards de estudo variados:
        
        Artigo: ${articleNumber} - ${codeName}
        Conteúdo: ${articleContent}
        
        Para cada flashcard, crie:
        1. Uma pergunta clara e objetiva sobre diferentes aspectos do artigo
        2. Uma resposta completa e educativa
        3. Um exemplo prático de aplicação do artigo (situação real ou caso hipotético)
        
        Retorne APENAS um JSON válido com um array no formato:
        {
          "flashcards": [
            {
              "pergunta": "pergunta 1 aqui",
              "resposta": "resposta 1 aqui", 
              "exemplo": "exemplo prático 1 aqui"
            },
            {
              "pergunta": "pergunta 2 aqui",
              "resposta": "resposta 2 aqui", 
              "exemplo": "exemplo prático 2 aqui"
            },
            ...
          ]
        }
      `;

      const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Você é uma IA jurídica. Gere flashcards claros, objetivos e corretos. Responda APENAS com JSON válido.' },
            { role: 'user', content: prompt }
          ]
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
      
      // Extrair JSON do texto gerado
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Não foi possível extrair JSON válido da resposta');
      }

      generateResponse = JSON.parse(jsonMatch[0]);

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