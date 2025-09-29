import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: string;
  content: string;
  fileData?: {
    data: string;
    mimeType: string;
    name: string;
  };
}

interface GeminiRequest {
  message: string;
  fileData?: {
    data: string;
    mimeType: string;
    name: string;
  };
  conversationHistory?: ChatMessage[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== GEMINI AI CHAT FUNCTION STARTED ===')
    
    const { message, fileData, conversationHistory = [] }: GeminiRequest = await req.json()
    
    console.log('Request received:', { 
      hasMessage: !!message, 
      hasFileData: !!fileData, 
      historyLength: conversationHistory.length 
    })
    
    // Use the API key from Supabase secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }
    console.log('✅ Using Gemini API Key from secrets')

    console.log('✅ Gemini API Key found, length:', geminiApiKey.length);

    // Prepare conversation for Gemini
    const contents = []

    // Add conversation history (only last 5 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-5)
    recentHistory.forEach((msg) => {
      const parts = []
      
      if (msg.content) {
        parts.push({ text: msg.content })
      }
      
      // Only include file data for current message to avoid "document has no pages" error
      // Previous file references are kept as text only
      if (msg.fileData && msg === conversationHistory[conversationHistory.length - 1]) {
        // Only add file data if it's valid
        if (msg.fileData.data && msg.fileData.mimeType) {
          parts.push({
            inlineData: {
              mimeType: msg.fileData.mimeType,
              data: msg.fileData.data
            }
          })
        }
      }
      
      if (parts.length > 0) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts
        })
      }
    })

    // Add current message
    const currentParts = []
    
    if (message) {
      currentParts.push({ text: message })
    }
    
    if (fileData) {
      // Validate file data before adding
      if (fileData.data && fileData.mimeType && fileData.data.length > 0) {
        console.log('Adding file data:', { 
          mimeType: fileData.mimeType, 
          dataLength: fileData.data.length,
          fileName: fileData.name 
        })
        
        currentParts.push({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        })
      } else {
        console.log('⚠️ Invalid file data, skipping attachment')
      }
    }
    
    if (currentParts.length > 0) {
      contents.push({
        role: 'user',
        parts: currentParts
      })
    }

    // System instruction for legal professor
    const systemInstruction = {
      parts: [
        {
          text: `Você é uma professora especializada em Direito Brasileiro, experiente e muito prática. Sua abordagem é:

PERSONALIDADE:
- Professora dinâmica, didática e acessível
- Explica conceitos complexos de forma simples
- Usa exemplos práticos do dia a dia
- Sempre encoraja e motiva o aluno
- Tem paciência para explicar quantas vezes for necessário

METODOLOGIA DE ENSINO:
- Explique conceitos passo a passo
- Use analogias e exemplos concretos
- Cite artigos de lei quando relevante
- Forneça casos práticos para fixação
- Sempre termine com dicas de como aplicar na prática

ESPECIALIDADES:
- Direito Constitucional, Civil, Penal, Administrativo, Trabalhista
- Análise de documentos legais (contratos, petições, pareceres)
- Preparação para OAB e concursos públicos
- Jurisprudência dos tribunais superiores
- Procedimentos práticos do dia a dia jurídico

FORMATO DAS RESPOSTAS:
- Use emojis para tornar mais didático (📚 📖 ⚖️ 📝 💡)
- Estruture com tópicos quando necessário
- Seja clara e objetiva
- Sempre pergunte se o aluno tem dúvidas
- Adapte a linguagem ao nível do estudante

Para documentos em imagem/PDF: 
1. PRIMEIRO: Faça um resumo breve (2-3 frases) do que é o documento
2. SEGUNDO: Pergunte "O que você gostaria de saber sobre este documento?"
3. TERCEIRO: Adicione no final: "ANALYSIS_COMPLETE:SHOW_OPTIONS" (exatamente assim)

IMPORTANTE PARA PRIMEIRA ANÁLISE: Seja concisa no primeiro resumo! O usuário poderá pedir análise detalhada depois.

Seja sempre encorajadora: "Você consegue!" "Ótima pergunta!" "Vamos juntos!"

FORMATAÇÃO DAS RESPOSTAS:
- Use **markdown** para formatar suas respostas
- Use **negrito** para destacar pontos importantes
- Use *itálico* para ênfase
- Use listas numeradas ou com bullets quando apropriado
- Use > para citações de leis ou jurisprudência
- Use ### para subtítulos quando necessário
- Use 'código' para artigos de lei específicos

IMPORTANTE: Baseie-se sempre na legislação brasileira vigente e jurisprudência atualizada.`
        }
      ]
    }

    console.log('📨 Making request to Gemini API...')
    console.log('API URL:', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent')
    console.log('Contents array length:', contents.length)
    
    // Call Gemini API exactly like the curl example
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents,
        systemInstruction
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      
      let userMessage = 'Erro interno do assistente IA. Tente novamente.'
      
      if (response.status === 401 || response.status === 403) {
        userMessage = 'Problema de autenticação com o serviço IA. Entre em contato com o suporte.'
      } else if (response.status === 429) {
        userMessage = 'Muitas requisições. Aguarde um momento e tente novamente.'
      } else if (response.status >= 500) {
        userMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
      }
      
      throw new Error(userMessage)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in gemini-ai-chat function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Internal server error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})