import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentAnalysisRequest {
  imageData: string;
  analysisType: 'nsfw' | 'text-extraction' | 'general';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CONTENT ANALYSIS FUNCTION STARTED ===');
    
    const { imageData, analysisType }: ContentAnalysisRequest = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare prompt based on analysis type
    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'nsfw':
        systemPrompt = `Você é um moderador de conteúdo especializado em detectar conteúdo inadequado. 
        Analise a imagem e responda apenas com "APROVADO" ou "REJEITADO".
        
        REJEITE se a imagem contém:
        - Nudez ou conteúdo sexual explícito
        - Violência gráfica
        - Conteúdo ofensivo ou discriminatório
        - Drogas ou substâncias ilegais
        
        APROVE se a imagem contém:
        - Documentos legais, textos, estudos
        - Imagens educacionais apropriadas
        - Conteúdo acadêmico ou profissional`;
        userPrompt = 'Analise esta imagem e responda apenas "APROVADO" ou "REJEITADO":';
        break;
        
      case 'text-extraction':
        systemPrompt = `Você é um especialista em extração de texto de imagens. 
        Extraia todo o texto visível na imagem com precisão, mantendo a formatação quando possível.
        Se não houver texto, responda "NENHUM_TEXTO_ENCONTRADO".`;
        userPrompt = 'Extraia todo o texto desta imagem:';
        break;
        
      case 'general':
        systemPrompt = `Você é um assistente de análise de conteúdo para estudantes de direito.
        Analise a imagem e forneça um resumo detalhado do conteúdo, identificando:
        - Tipo de documento (se aplicável)
        - Temas jurídicos principais
        - Informações relevantes para estudos`;
        userPrompt = 'Analise esta imagem e forneça um resumo detalhado:';
        break;
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
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
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
        analysisType,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in content-analysis function:', error);
    
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