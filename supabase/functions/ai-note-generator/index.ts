import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NoteGenerationRequest {
  content: string;
  generationType: 'summary' | 'expand' | 'questions' | 'outline' | 'flashcards';
  context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== AI NOTE GENERATOR FUNCTION STARTED ===');
    
    const { content, generationType, context }: NoteGenerationRequest = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare prompts based on generation type
    let systemPrompt = '';
    let userPrompt = '';

    switch (generationType) {
      case 'summary':
        systemPrompt = `Você é um especialista em direito brasileiro que cria resumos concisos e precisos.
        Crie um resumo estruturado do conteúdo fornecido, destacando:
        - Pontos principais
        - Conceitos jurídicos importantes
        - Aplicações práticas`;
        userPrompt = `Crie um resumo estruturado deste conteúdo: "${content}"`;
        break;
        
      case 'expand':
        systemPrompt = `Você é um professor de direito que expande ideias de forma didática.
        Expanda o conteúdo fornecido com:
        - Explicações detalhadas
        - Exemplos práticos
        - Conexões com outros temas jurídicos
        - Jurisprudência relevante quando aplicável`;
        userPrompt = `Expanda este conteúdo de forma didática: "${content}"`;
        break;
        
      case 'questions':
        systemPrompt = `Você é um especialista em preparação para concursos jurídicos.
        Crie 5-8 perguntas importantes sobre o conteúdo fornecido:
        - Perguntas conceituais
        - Casos práticos
        - Questões de aplicação
        Format: **Pergunta:** seguido da pergunta`;
        userPrompt = `Crie perguntas relevantes sobre: "${content}"`;
        break;
        
      case 'outline':
        systemPrompt = `Você é um organizador de conteúdo jurídico especializado.
        Crie um outline estruturado do conteúdo:
        - Hierarquia clara (1, 1.1, 1.1.1)
        - Pontos principais e subpontos
        - Organização lógica`;
        userPrompt = `Crie um outline estruturado para: "${content}"`;
        break;
        
      case 'flashcards':
        systemPrompt = `Você é um criador de flashcards para estudos jurídicos.
        Crie 5-7 flashcards no formato:
        **Frente:** pergunta ou conceito
        **Verso:** resposta ou explicação
        
        Foque em conceitos-chave, definições e aplicações práticas.`;
        userPrompt = `Crie flashcards para: "${content}"`;
        break;
    }

    if (context) {
      userPrompt += `\n\nContexto adicional: ${context}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        result,
        generationType,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in ai-note-generator function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Internal server error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});