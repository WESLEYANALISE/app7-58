import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TTSRequest {
  text: string;
  voice?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, voice = "Zephyr" }: TTSRequest = await req.json()
    
    if (!text) {
      throw new Error('Text is required')
    }

    // Use a chave API fornecida pelo usuário
    const geminiApiKey = 'AIzaSyAT8O3IQji1OuOl5PlE3m_ulIzz3BuHI0Q'
    console.log('✅ Using provided Gemini TTS API Key')

    console.log('Generating article TTS for text:', text.substring(0, 100))

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 1,
          responseModalities: ['audio']
        },
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice
            }
          }
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini TTS API error:', response.status, errorText)
      
      let userMessage = 'Erro no serviço de áudio. Tente novamente.'
      
      if (response.status === 401 || response.status === 403) {
        userMessage = 'Problema de autenticação com o serviço de áudio.'
      } else if (response.status === 429) {
        userMessage = 'Muitas requisições de áudio. Aguarde um momento.'
      }
      
      throw new Error(userMessage)
    }

    const data = await response.json()
    console.log('Article TTS response received')

    // Extract audio data from response
    let audioData = null
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          audioData = part.inlineData.data
          break
        }
      }
    }

    if (!audioData) {
      console.log('No audio data found in response')
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Audio generation not available'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        audioData: audioData,
        mimeType: 'audio/wav'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in gemini-article-tts function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error?.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})