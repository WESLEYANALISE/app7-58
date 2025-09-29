import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== EXTRACT TEXT FUNCTION STARTED ===');
    
    let fileData: Uint8Array;
    let fileName = '';
    let fileType = '';

    // Verificar se é FormData (upload de arquivo) ou JSON (URL de arquivo)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Upload de arquivo via FormData
      console.log('Processing FormData upload...');
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        throw new Error('Nenhum arquivo encontrado no FormData');
      }
      
      fileName = file.name;
      fileType = file.type;
      fileData = new Uint8Array(await file.arrayBuffer());
      
      console.log(`File: ${fileName}, Type: ${fileType}, Size: ${fileData.length} bytes`);
    } else {
      // URL de arquivo via JSON
      console.log('Processing file URL...');
      const { fileUrl, fileType: type, fileName: name } = await req.json();
      
      fileName = name || 'arquivo';
      fileType = type || 'application/octet-stream';
      
      const response = await fetch(fileUrl);
      fileData = new Uint8Array(await response.arrayBuffer());
      
      console.log(`File URL: ${fileUrl}, Type: ${fileType}, Size: ${fileData.length} bytes`);
    }

    let extractedText = '';

    if (fileType === 'application/pdf') {
      console.log('Processing PDF file...');
      
      try {
        // Para PDFs, usar Gemini para extrair texto via vision
        if (!GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY not configured');
        }

        // Converter PDF para base64
        const base64Data = btoa(String.fromCharCode.apply(null, Array.from(fileData)));
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: 'Extraia todo o texto deste documento PDF. Retorne apenas o texto extraído, sem formatação adicional.' },
                {
                  inline_data: {
                    mime_type: fileType,
                    data: base64Data
                  }
                }
              ]
            }],
            systemInstruction: {
              parts: [{
                text: 'Você é um extrator de texto especializado. Extraia todo o texto legível do documento fornecido, mantendo a estrutura e parágrafos quando possível.'
              }]
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      `[PDF processado: ${fileName}]\nTexto extraído automaticamente do arquivo PDF.`;
        
        console.log('PDF processed successfully with Gemini');
      } catch (pdfError) {
        console.error('Error processing PDF:', pdfError);
        const errorMessage = pdfError instanceof Error ? pdfError.message : String(pdfError);
        extractedText = `[Erro ao processar PDF: ${fileName}]\nNão foi possível extrair o texto automaticamente. Erro: ${errorMessage}`;
      }
    } else if (fileType.startsWith('image/')) {
      console.log('Processing image file...');
      
      try {
        if (!GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY not configured');
        }

        // Converter imagem para base64
        const base64Data = btoa(String.fromCharCode.apply(null, Array.from(fileData)));
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: 'Extraia todo o texto visível desta imagem. Se houver texto, transcreva-o fielmente. Se não houver texto, descreva o conteúdo da imagem de forma detalhada para que possa ser usado em um mapa mental.' },
                {
                  inline_data: {
                    mime_type: fileType,
                    data: base64Data
                  }
                }
              ]
            }],
            systemInstruction: {
              parts: [{
                text: 'Você é um extrator de texto e analisador de imagens. Extraia qualquer texto visível ou forneça uma descrição detalhada do conteúdo visual.'
              }]
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      `[Imagem processada: ${fileName}]\nConteúdo extraído automaticamente da imagem.`;
        
        console.log('Image processed successfully with Gemini');
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        const errorMessage = imageError instanceof Error ? imageError.message : String(imageError);
        extractedText = `[Erro ao processar imagem: ${fileName}]\nNão foi possível extrair o texto automaticamente. Erro: ${errorMessage}`;
      }
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
    }

    console.log('Text extraction completed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        text: extractedText,
        fileName: fileName,
        fileType: fileType
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in extract-text function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error?.message,
        text: '[Erro na extração de texto]\nNão foi possível processar o arquivo automaticamente. Por favor, digite ou cole o texto manualmente para continuar com a análise.'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});