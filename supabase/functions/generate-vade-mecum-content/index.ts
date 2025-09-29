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

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let prompt: string;
    let generateResponse: any;

    if (type === 'flashcard') {
      prompt = `
        Baseado no seguinte artigo jurídico, gere um flashcard de estudo:
        
        Artigo: ${articleNumber} - ${codeName}
        Conteúdo: ${articleContent}
        
        Crie:
        1. Uma pergunta clara e objetiva sobre o artigo
        2. Uma resposta completa e educativa
        3. Uma dica útil para memorização
        
        Retorne APENAS um JSON válido no formato:
        {
          "pergunta": "pergunta aqui",
          "resposta": "resposta aqui", 
          "dica": "dica aqui"
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extrair JSON do texto gerado
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Não foi possível extrair JSON válido da resposta');
      }

      generateResponse = JSON.parse(jsonMatch[0]);

      // Salvar flashcard no banco
      const { data: flashcardData, error: flashcardError } = await supabase
        .from('vade_mecum_flashcards')
        .insert({
          user_id: userId,
          article_number: articleNumber,
          code_name: codeName,
          article_content: articleContent,
          pergunta: generateResponse.pergunta,
          resposta: generateResponse.resposta,
          dica: generateResponse.dica
        })
        .select()
        .single();

      if (flashcardError) throw flashcardError;

      return new Response(JSON.stringify({ 
        success: true, 
        flashcard: flashcardData,
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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      });

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
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