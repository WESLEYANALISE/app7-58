import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonContentRequest {
  lessonId: number;
  lessonArea: string;
  lessonTema: string;
  lessonAssunto: string;
  lessonConteudo: string;
  contentType: 'summary' | 'flashcards' | 'quiz';
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, lessonArea, lessonTema, lessonAssunto, lessonConteudo, contentType } = await req.json() as LessonContentRequest;
    
    if (!lessonId || !lessonArea || !lessonTema || !lessonAssunto || !contentType) {
      throw new Error('Dados da aula incompletos');
    }

    console.log(`🎓 Gerando ${contentType} para aula: ${lessonAssunto}`);

    // Verificar se já existe conteúdo gerado para esta aula
    const { data: existingContent } = await supabase
      .from('lesson_generated_content')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('content_type', contentType)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingContent) {
      console.log(`📚 Conteúdo ${contentType} já existe para aula ${lessonId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        content: existingContent.content,
        cached: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    let prompt = '';
    let systemPrompt = `Você é um professor especializado em Direito, criando material educacional de alta qualidade.

CONTEXTO DA AULA:
- Área: ${lessonArea}
- Tema/Módulo: ${lessonTema}
- Assunto: ${lessonAssunto}
- Conteúdo: ${lessonConteudo || 'Conteúdo base para análise'}

IMPORTANTE: Responda SEMPRE em formato JSON válido, sem markdown ou texto adicional.`;

    switch (contentType) {
      case 'summary':
        prompt = `${systemPrompt}

Crie um resumo completo e detalhado desta aula de Direito seguindo esta estrutura JSON EXATA:

{
  "titulo": "Resumo: [Assunto da Aula]",
  "introducao": "Parágrafo introdutório contextualizando o tema",
  "conceitos_principais": [
    {
      "conceito": "Nome do conceito",
      "definicao": "Definição clara e precisa",
      "exemplo": "Exemplo prático aplicado"
    }
  ],
  "pontos_importantes": [
    "Ponto relevante 1",
    "Ponto relevante 2",
    "Ponto relevante 3"
  ],
  "legislacao_aplicavel": [
    {
      "lei": "Nome da lei/código",
      "artigos": "Artigos específicos",
      "relevancia": "Por que é importante"
    }
  ],
  "jurisprudencia": [
    {
      "tribunal": "Tribunal",
      "tema": "Tema do julgamento",
      "importancia": "Relevância para o assunto"
    }
  ],
  "aplicacao_pratica": "Como aplicar este conhecimento na prática jurídica",
  "conclusao": "Síntese final dos pontos mais importantes"
}`;
        break;

      case 'flashcards':
        prompt = `${systemPrompt}

Crie 8-12 flashcards educativos sobre esta aula seguindo esta estrutura JSON EXATA:

{
  "titulo": "Flashcards: [Assunto da Aula]",
  "total_cards": 10,
  "flashcards": [
    {
      "id": 1,
      "pergunta": "Pergunta clara e objetiva",
      "resposta": "Resposta completa e didática",
      "dica": "Dica para memorização",
      "categoria": "conceito|legislacao|jurisprudencia|pratica"
    }
  ]
}

DIRETRIZES:
- Perguntas variadas: conceitos, definições, aplicações práticas
- Respostas completas mas concisas
- Dicas de memorização úteis
- Misture diferentes tipos de conhecimento jurídico`;
        break;

      case 'quiz':
        prompt = `${systemPrompt}

Crie um quiz com 10 questões de múltipla escolha sobre esta aula seguindo esta estrutura JSON EXATA:

{
  "titulo": "Quiz: [Assunto da Aula]",
  "instrucoes": "Responda às questões sobre os conceitos apresentados na aula",
  "total_questoes": 10,
  "questoes": [
    {
      "id": 1,
      "pergunta": "Pergunta clara sobre o conteúdo",
      "alternativas": {
        "a": "Alternativa A",
        "b": "Alternativa B", 
        "c": "Alternativa C",
        "d": "Alternativa D"
      },
      "resposta_correta": "a",
      "explicacao": "Explicação detalhada da resposta correta",
      "nivel": "facil|medio|dificil"
    }
  ]
}

DIRETRIZES:
- Questões de diferentes níveis de dificuldade
- Alternativas plausíveis e bem elaboradas
- Explicações educativas para as respostas
- Foco nos conceitos mais importantes da aula`;
        break;

      default:
        throw new Error(`Tipo de conteúdo não suportado: ${contentType}`);
    }

    console.log(`🤖 Enviando prompt para Gemini...`);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Gemini:', errorText);
      throw new Error(`Erro da API Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API Gemini');
    }

    let generatedText = data.candidates[0].content.parts[0].text;
    
    // Limpar markdown se houver
    if (generatedText.includes('```json')) {
      generatedText = generatedText.replace(/```json\n?/, '').replace(/\n?```/, '');
    }
    
    // Validar JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      throw new Error('Conteúdo gerado não é um JSON válido');
    }

    // Salvar no Supabase
    const { error: insertError } = await supabase
      .from('lesson_generated_content')
      .insert({
        lesson_id: lessonId,
        lesson_area: lessonArea,
        lesson_tema: lessonTema,
        lesson_assunto: lessonAssunto,
        content_type: contentType,
        content: parsedContent,
        user_id: null // Conteúdo público
      });

    if (insertError) {
      console.error('Erro ao salvar conteúdo:', insertError);
      // Não falhar se não conseguir salvar, apenas retornar o conteúdo
    }

    console.log(`✅ ${contentType} gerado com sucesso para aula ${lessonId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      content: parsedContent,
      cached: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar conteúdo da aula:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});