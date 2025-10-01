import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, fileData, conversationHistory, area, contextType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Construir contexto baseado no tipo
    let systemPrompt = `Você é uma Professora de Direito extremamente experiente e didática, especializada em ensinar Direito Brasileiro.

INSTRUÇÕES IMPORTANTES:
- Seja DIRETA, CLARA e OBJETIVA nas explicações
- Use exemplos práticos REAIS do cotidiano jurídico brasileiro
- Cite legislação específica (artigos, leis, códigos) quando relevante
- Organize suas respostas com markdown: use **negrito**, *itálico*, listas, subtítulos
- Seja acessível mas mantenha precisão técnica jurídica
- NÃO mencione "jurisprudências" ou "casos" a menos que o usuário peça explicitamente

${area ? `ÁREA DE ESPECIALIZAÇÃO: ${area}` : ''}
${contextType ? `CONTEXTO: ${contextType}` : ''}

IMPORTANTE - QUANDO RECEBER UM ARQUIVO (PDF, IMAGEM, DOCUMENTO):
1. Primeiro, faça um resumo CURTO de 2-3 linhas do que o documento contém
2. Em seguida, pergunte: "O que você gostaria que eu fizesse com isso?"
3. Aguarde a escolha do usuário antes de aprofundar
4. Depois que o usuário responder, aí sim faça a análise detalhada que ele pediu

RESPONDA SEMPRE EM PORTUGUÊS BRASILEIRO com formatação markdown rica.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Adicionar histórico
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: ChatMessage) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Adicionar mensagem atual
    const userMessage: any = { role: 'user', content: [] };

    // Processar arquivo anexado
    if (fileData) {
      console.log('Processing file:', { mimeType: fileData.mimeType, size: fileData.data?.length });
      
      // Se for PDF, extrair texto via edge function
      if (fileData.mimeType === 'application/pdf') {
        try {
          console.log('Extracting text from PDF...');
          const extractResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': req.headers.get('Authorization') || '',
            },
            body: JSON.stringify({
              fileUrl: `data:${fileData.mimeType};base64,${fileData.data}`,
              fileType: fileData.mimeType,
              fileName: fileData.name
            })
          });

          if (extractResponse.ok) {
            const extractData = await extractResponse.json();
            const extractedText = extractData.text || '';
            console.log('PDF text extracted, length:', extractedText.length);
            
            // Aumentar limite para PDFs grandes - até 50k caracteres
            const maxLength = 50000;
            const truncatedText = extractedText.substring(0, maxLength);
            userMessage.content.push({
              type: 'text',
              text: `[Conteúdo do PDF "${fileData.name}" - ${extractedText.length} caracteres]\n\n${truncatedText}${extractedText.length > maxLength ? '\n\n[... documento possui mais conteúdo, peça para continuar se necessário]' : ''}`
            });
          } else {
            console.error('Failed to extract PDF text:', extractResponse.status);
            userMessage.content.push({
              type: 'text',
              text: `[Documento PDF anexado: ${fileData.name}]\nNão foi possível extrair o texto automaticamente.`
            });
          }
        } catch (extractError) {
          console.error('Error extracting PDF:', extractError);
          userMessage.content.push({
            type: 'text',
            text: `[Documento PDF anexado: ${fileData.name}]\nErro na extração de texto.`
          });
        }
      } else {
        // Para imagens, enviar como image_url
        userMessage.content.push({
          type: 'image_url',
          image_url: {
            url: `data:${fileData.mimeType};base64,${fileData.data}`
          }
        });
      }
    }

    userMessage.content.push({
      type: 'text',
      text: message
    });

    messages.push(userMessage);

    // Chamar Lovable AI com streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de uso atingido. Aguarde alguns instantes e tente novamente.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Créditos insuficientes. Adicione créditos em Settings -> Workspace -> Usage.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Erro na API Lovable:', response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    // Retornar stream diretamente
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });

  } catch (error) {
    console.error('Erro no chat da professora:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
