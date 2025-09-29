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

    // Use Supabase secret for the API key when available
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyAT8O3IQji1OuOl5PlE3m_ulIzz3BuHI0Q'
    console.log(`✅ Using Gemini TTS API Key source: ${Deno.env.get('GEMINI_API_KEY') ? 'secret' : 'fallback'}`)

    console.log('Generating article TTS for text:', text.substring(0, 100))

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
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
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
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

    // Convert PCM (inlineData) to WAV for browser playback
    const pcmToWavBase64 = (pcmBase64: string, sampleRate = 24000, bitsPerSample = 16, channels = 1): string => {
      const pcmBytes = Uint8Array.from(atob(pcmBase64), (c) => c.charCodeAt(0));
      const dataSize = pcmBytes.length;
      const blockAlign = (channels * bitsPerSample) >> 3; // channels * bytesPerSample
      const byteRate = sampleRate * blockAlign;

      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);
      let offset = 0;

      const writeString = (s: string) => {
        for (let i = 0; i < s.length; i++) {
          view.setUint8(offset++, s.charCodeAt(i));
        }
      };

      // RIFF header
      writeString('RIFF');
      view.setUint32(offset, 36 + dataSize, true); offset += 4; // ChunkSize
      writeString('WAVE');

      // fmt subchunk
      writeString('fmt ');
      view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size
      view.setUint16(offset, 1, true); offset += 2;  // AudioFormat = 1 (PCM)
      view.setUint16(offset, channels, true); offset += 2; // NumChannels
      view.setUint32(offset, sampleRate, true); offset += 4; // SampleRate
      view.setUint32(offset, byteRate, true); offset += 4; // ByteRate
      view.setUint16(offset, blockAlign, true); offset += 2; // BlockAlign
      view.setUint16(offset, bitsPerSample, true); offset += 2; // BitsPerSample

      // data subchunk
      writeString('data');
      view.setUint32(offset, dataSize, true); offset += 4; // Subchunk2Size

      new Uint8Array(buffer, 44).set(pcmBytes);

      const wavBytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < wavBytes.length; i++) binary += String.fromCharCode(wavBytes[i]);
      return btoa(binary);
    };

    const wavBase64 = pcmToWavBase64(audioData);

    return new Response(
      JSON.stringify({ 
        success: true,
        audioData: wavBase64,
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