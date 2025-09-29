import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeminiRequest {
  action: 'explicar' | 'exemplo' | 'apresentar';
  article: string;
  articleNumber: string;
  codeName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== GEMINI VADEMECUM FUNCTION STARTED ===');
    
    const { action, article, articleNumber, codeName }: GeminiRequest = await req.json();
    
    console.log('Request received:', { 
      action, 
      articleNumber,
      codeName,
      hasArticle: !!article
    });
    
    // Use the API key provided by user
    const geminiApiKey = 'AIzaSyARKbLg6juoX5gOnDdsZgAt217z20s08GA';
    console.log('✅ Using Gemini API Key');

    let prompt = '';
    
    switch (action) {
      case 'explicar':
        prompt = `Explique de forma didática e detalhada o seguinte artigo de lei:

${codeName} - Art. ${articleNumber}
${article}

Por favor, forneça uma explicação completa que inclua:
1. **O que o artigo significa** em linguagem simples
2. **Situações práticas** onde ele se aplica
3. **Termos técnicos** explicados de forma clara
4. **Importância jurídica** no ordenamento brasileiro

Use formatação markdown limpa e seja didático. Não use slides ou apresentações.`;
        break;
        
      case 'exemplo':
        prompt = `Forneça exemplos práticos e casos concretos para o seguinte artigo de lei:

${codeName} - Art. ${articleNumber}
${article}

Por favor, inclua:

## **Exemplos Práticos**
1. **Exemplo 1**: [situação do dia a dia]
2. **Exemplo 2**: [caso hipotético realista]
3. **Exemplo 3**: [aplicação prática]

## **Casos Ilustrativos**
- Situações onde o artigo protege direitos
- Contextos de aplicação no cotidiano
- Consequências jurídicas práticas

Use formatação markdown limpa e seja específico nos exemplos. Não use slides.`;
        break;
        
      case 'apresentar':
        prompt = `Crie um resumo estruturado sobre o seguinte artigo de lei:

${codeName} - Art. ${articleNumber}
${article}

Estruture o conteúdo em markdown da seguinte forma:

# **${codeName} - Art. ${articleNumber}**

## **Texto do Artigo**
[reproduza o artigo na íntegra]

## **Explicação Simplificada**
[o que significa em linguagem clara]

## **Aplicação Prática**
[quando e onde se aplica]

## **Exemplos Concretos**
[2-3 exemplos práticos do cotidiano]

## **Importância Jurídica**
[por que é importante e como protege direitos]

Use formatação markdown limpa e organizada. Seja didático e prático.`;
        break;
    }

    console.log('📨 Making request to Gemini API...');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: `Você é um professor de Direito especializado em ensino didático. 

Sempre responda de forma:
- Clara e didática
- Com exemplos práticos quando solicitado
- Usando formatação markdown limpa
- Adequada para estudantes e profissionais
- Em português brasileiro
- SEM usar slides ou apresentações
- Com conteúdo copiável e bem estruturado

NUNCA use formatação de slides. Use apenas markdown padrão com títulos, listas e texto corrido.`
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API Gemini');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    console.log('✅ Gemini response received');

    return new Response(
      JSON.stringify({ 
        content: aiResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in gemini-vademecum function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Erro interno do servidor',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});