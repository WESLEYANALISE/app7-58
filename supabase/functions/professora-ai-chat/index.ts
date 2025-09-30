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
    let systemPrompt = `Você é uma professora de Direito especializada. Seja DIRETA e OBJETIVA.

REGRAS IMPORTANTES:
- NÃO se apresente nem fale seu nome
- Responda de forma natural e conversacional
- Se a pessoa disser "oi", responda "Oi!" de volta
- Só explique conceitos se a pessoa pedir explicitamente
- Seja breve, a não ser que peçam detalhes

ANÁLISE DE ARQUIVOS (CRÍTICO):
- Se receber uma IMAGEM: descreva TODOS os detalhes visuais, textos, elementos presentes
- Se receber um DOCUMENTO: extraia e explique TODO o conteúdo, identifique o tipo de documento
- Após analisar, ofereça gerar resumo, explicar pontos específicos, etc.

QUANDO EXPLICAR:
- Use exemplos práticos do Direito brasileiro
- Cite legislação quando relevante (artigos, leis, códigos)
- Organize com markdown: **negrito**, listas, subtítulos
- Linguagem clara e precisa

${area ? `CONTEXTO: Área de ${area}` : ''}
${contextType ? `INFO: ${contextType}` : ''}

RESPONDA SEMPRE EM PORTUGUÊS BRASILEIRO.`;

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
      console.log('Processing file:', { 
        mimeType: fileData.mimeType, 
        hasData: !!fileData.data,
        dataLength: fileData.data?.length,
        name: fileData.name 
      });
      
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
            
            // Limitar texto extraído a ~15k caracteres
            const truncatedText = extractedText.substring(0, 15000);
            userMessage.content.push({
              type: 'text',
              text: `[Conteúdo do PDF "${fileData.name}"]\n\n${truncatedText}${extractedText.length > 15000 ? '\n\n[... texto truncado por tamanho]' : ''}`
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
      } else if (fileData.mimeType?.startsWith('image/')) {
        // Para imagens, enviar como image_url
        console.log('Sending image to AI');
        if (!fileData.data) {
          console.error('Image data is missing');
          throw new Error('Dados da imagem não disponíveis');
        }
        userMessage.content.push({
          type: 'image_url',
          image_url: {
            url: `data:${fileData.mimeType};base64,${fileData.data}`
          }
        });
      } else {
        // Outros tipos de arquivo
        console.log('Unsupported file type, adding as text reference');
        userMessage.content.push({
          type: 'text',
          text: `[Arquivo anexado: ${fileData.name}]\nTipo: ${fileData.mimeType}`
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
        max_tokens: 3000,
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
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
