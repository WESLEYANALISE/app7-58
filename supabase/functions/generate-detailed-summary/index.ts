import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummaryResult {
  resumo: string;
  explicacao: string;
  pontosChave: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== GENERATE DETAILED SUMMARY FUNCTION STARTED ===");
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }

    console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    // Extrair texto do documento usando o extract-text function
    console.log("Extracting text from document...");
    const textFormData = new FormData();
    textFormData.append('file', file);

    const extractResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-text`, {
      method: 'POST',
      body: textFormData,
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      }
    });

    if (!extractResponse.ok) {
      throw new Error(`Erro na extração de texto: ${extractResponse.status}`);
    }

    const { extractedText } = await extractResponse.json();
    console.log(`Extracted text length: ${extractedText.length}`);

    // Preparar prompt para o Gemini
    const prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE JURÍDICA. Analise o seguinte documento e forneça um resumo super detalhado e explicativo.

DOCUMENTO:
${extractedText}

INSTRUÇÕES ESPECÍFICAS:
1. Crie um resumo abrangente e detalhado do documento
2. Forneça uma explicação clara e didática do conteúdo
3. Identifique os pontos-chave mais importantes
4. Use linguagem acessível mas técnica quando necessário
5. Seja preciso e objetivo

FORMATO DA RESPOSTA (OBRIGATÓRIO - RESPONDA APENAS EM JSON):
{
  "resumo": "Resumo super detalhado do documento em pelo menos 3 parágrafos extensos",
  "explicacao": "Explicação didática e clara sobre o conteúdo, contextualizando os conceitos principais",
  "pontosChave": ["Ponto 1 detalhado", "Ponto 2 detalhado", "Ponto 3 detalhado", "..."]
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional antes ou depois.`;

    // Chamar Gemini API
    console.log("Calling Gemini API for detailed summary...");
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Erro na API do Gemini: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini API response received");

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('Nenhuma resposta foi gerada pelo Gemini');
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log(`Generated text length: ${generatedText.length}`);

    // Parse do JSON da resposta do Gemini
    let analysisResult: SummaryResult;
    try {
      // Limpar o texto removendo possíveis caracteres extras
      const cleanText = generatedText.trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(cleanText);
      }

      // Validar estrutura
      if (!analysisResult.resumo || !analysisResult.explicacao || !Array.isArray(analysisResult.pontosChave)) {
        throw new Error('Estrutura de resposta inválida');
      }

    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Texto gerado:', generatedText);
      
      // Fallback: criar estrutura baseada no texto gerado
      analysisResult = {
        resumo: generatedText.substring(0, 1000) + '...',
        explicacao: 'O documento foi analisado, mas houve um problema na formatação da resposta. O conteúdo principal está no resumo acima.',
        pontosChave: [
          'Documento processado com sucesso',
          'Análise gerada pela IA',
          'Verifique o resumo para detalhes completos'
        ]
      };
    }

    console.log("Summary generation completed successfully");

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-detailed-summary function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: 'Erro ao processar o documento para resumo detalhado'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});