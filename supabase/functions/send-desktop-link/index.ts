import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DesktopLinkRequest {
  name: string;
  email: string;
  platform?: string;
  ip?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, platform, ip }: DesktopLinkRequest = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: 'Nome e email são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Links de download das stores
    const playStoreLink = 'https://play.google.com/store/apps/details?id=br.com.app.gpu2675756.gpu0e7509bfb7bde52aef412888bb17a456';
    const appStoreLink = 'https://apps.apple.com/us/app/direito-conte%C3%BAdo-jur%C3%ADdico/id6450845861';

    // Determinar qual link exibir baseado na plataforma
    let storeLink = playStoreLink;
    let storeName = 'Google Play Store';
    
    if (platform === 'ios') {
      storeLink = appStoreLink;
      storeName = 'Apple App Store';
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #333333; margin-bottom: 20px; }
          .message { font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 30px; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
          .features { background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 30px 0; }
          .feature { display: flex; align-items: center; margin: 15px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
          .feature-text { font-size: 14px; color: #666666; }
          .footer { padding: 30px; text-align: center; color: #999999; font-size: 12px; background-color: #f5f5f5; }
          .divider { height: 1px; background-color: #e0e0e0; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📱 Plataforma Desktop Direito</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              Olá, <strong>${name}</strong>! 👋
            </div>
            
            <div class="message">
              Obrigado pelo seu interesse na <strong>Plataforma Desktop</strong>! 
            </div>

            <div class="message">
              Você pode acessar nossa plataforma completa através do aplicativo mobile disponível para download:
            </div>

            <div class="button-container">
              <a href="${storeLink}" class="button">
                📲 Baixar da ${storeName}
              </a>
            </div>

            ${platform !== 'ios' ? `
            <div class="button-container">
              <a href="${appStoreLink}" class="button" style="background: linear-gradient(135deg, #000000 0%, #434343 100%);">
                🍎 Também disponível na App Store
              </a>
            </div>
            ` : `
            <div class="button-container">
              <a href="${playStoreLink}" class="button" style="background: linear-gradient(135deg, #01875f 0%, #34a853 100%);">
                🤖 Também disponível no Google Play
              </a>
            </div>
            `}

            <div class="divider"></div>

            <div class="features">
              <h3 style="margin-top: 0; color: #333333;">✨ Recursos Premium</h3>
              
              <div class="feature">
                <div class="feature-icon">📚</div>
                <div class="feature-text">Biblioteca completa de livros jurídicos</div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">🎓</div>
                <div class="feature-text">Cursos e videoaulas especializadas</div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">🤖</div>
                <div class="feature-text">Assistente de IA para estudos</div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">📝</div>
                <div class="feature-text">Flashcards e questões interativas</div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">⚖️</div>
                <div class="feature-text">Vade Mecum com áudio narrado</div>
              </div>
            </div>

            <div class="message" style="margin-top: 30px; font-size: 14px; color: #999999;">
              💡 <strong>Dica:</strong> Após instalar o app, faça login com suas credenciais para acessar todos os recursos premium.
            </div>
          </div>

          <div class="footer">
            <p>📧 Precisa de ajuda? Responda este email ou entre em contato conosco.</p>
            <p style="margin-top: 15px;">© ${new Date().getFullYear()} Plataforma Direito. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Enviando email para ${email} (plataforma: ${platform || 'unknown'})`);

    const { data, error } = await resend.emails.send({
      from: 'Plataforma Direito <onboarding@resend.dev>',
      to: [email],
      subject: '📱 Link de Acesso - Plataforma Desktop Direito',
      html: emailHtml,
    });

    if (error) {
      console.error('Erro ao enviar email via Resend:', error);
      
      // Tratar erros específicos
      if (error.message?.includes('domain')) {
        return new Response(
          JSON.stringify({ 
            error: 'Configuração de domínio pendente',
            details: 'O domínio de envio precisa ser verificado no Resend. Verifique em https://resend.com/domains'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw error;
    }

    console.log('Email enviado com sucesso:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Link enviado com sucesso',
        emailId: data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro no envio do link:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: 'Não foi possível enviar o email. Tente novamente.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
