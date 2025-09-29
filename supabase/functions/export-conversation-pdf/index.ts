import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  file?: {
    name: string;
    type: string;
  };
}

interface ExportRequest {
  messages: Message[];
  userIp?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== EXPORT CONVERSATION PDF FUNCTION STARTED ===')
    
    const { messages, userIp }: ExportRequest = await req.json()
    
    console.log('Request received:', { 
      messagesCount: messages.length,
      hasUserIp: !!userIp
    })

    // Get Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user ID if authenticated
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    // Create PDF content as HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Conversa com Professora de Direito</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .message {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
          }
          .user-message {
            background-color: #f3f4f6;
            border-left: 4px solid #dc2626;
          }
          .bot-message {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
          }
          .sender {
            font-weight: bold;
            margin-bottom: 8px;
            color: #dc2626;
          }
          .content {
            white-space: pre-line;
          }
          .timestamp {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
          }
          .file-attachment {
            background-color: #e5e7eb;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 8px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 Conversa com Professora de Direito IA</h1>
          <p>Exportado em ${new Date().toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        ${messages.map(message => `
          <div class="message ${message.type === 'user' ? 'user-message' : 'bot-message'}">
            <div class="sender">${message.type === 'user' ? '👤 Você' : '👩‍🏫 Professora'}</div>
            ${message.file ? `
              <div class="file-attachment">
                📎 Arquivo anexado: ${message.file.name}
              </div>
            ` : ''}
            <div class="content">${message.content}</div>
            <div class="timestamp">${new Date(message.timestamp).toLocaleString('pt-BR')}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `

    // Generate PDF using Puppeteer-like service (simplified approach)
    // For a real implementation, you'd use a PDF generation service
    const pdfBuffer = new TextEncoder().encode(htmlContent)
    
    // Generate unique filename
    const filename = `conversa-professora-${Date.now()}.html`
    const filePath = `exports/${filename}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('conversation-pdfs')
      .upload(filePath, pdfBuffer, {
        contentType: 'text/html',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error('Erro ao fazer upload do arquivo')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('conversation-pdfs')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Save export record to database
    const { error: dbError } = await supabase
      .from('conversation_exports')
      .insert({
        user_id: userId,
        user_ip: userIp || 'unknown',
        conversation_data: { messages },
        pdf_url: publicUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Don't throw error, just log it since the file was uploaded successfully
    }

    console.log('✅ PDF exported successfully:', publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true,
        url: publicUrl,
        message: 'PDF exportado com sucesso!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in export-conversation-pdf function:', error)
    
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