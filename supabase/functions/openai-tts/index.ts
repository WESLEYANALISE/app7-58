import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text, voice = "nova" }: TTSRequest = await req.json()
    
    if (!text) {
      throw new Error('Text is required')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('TTS: Available env vars:', Object.keys(Deno.env.toObject()))
    console.log('TTS: OPENAI_API_KEY exists:', !!openaiApiKey)
    
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not found in environment variables')
      console.error('TTS: Available environment variables:', Object.keys(Deno.env.toObject()))
      throw new Error('Configuração do serviço de áudio não encontrada.')
    }

    console.log('TTS: OpenAI API Key found:', openaiApiKey.substring(0, 10) + '...');
    console.log('Generating TTS for text:', text.substring(0, 100))

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice, // nova has a pleasant Brazilian-friendly sound
        response_format: 'mp3',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI TTS API error:', response.status, errorText)
      
      let userMessage = 'Erro no serviço de áudio. Tente novamente.'
      
      if (response.status === 401 || response.status === 403) {
        userMessage = 'Problema de autenticação com o serviço de áudio.'
      } else if (response.status === 429) {
        userMessage = 'Muitas requisições de áudio. Aguarde um momento.'
      }
      
      throw new Error(userMessage)
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    console.log('TTS response generated successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        audioData: base64Audio,
        mimeType: 'audio/mpeg'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in openai-tts function:', error)
    
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