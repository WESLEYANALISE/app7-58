import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsContentRequest {
  url: string;
}

// Função para extrair texto do HTML
function extractTextFromHTML(html: string): string {
  // Remove scripts e styles
  const noScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const noStyles = noScripts.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove tags HTML
  const noTags = noStyles.replace(/<[^>]*>/g, ' ');
  
  // Decodifica entidades HTML básicas
  const decoded = noTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove espaços extras e quebras de linha desnecessárias
  const cleaned = decoded
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== NEWS CONTENT PROXY FUNCTION STARTED ===');
    
    const { url }: NewsContentRequest = await req.json();
    
    if (!url) {
      throw new Error('URL é obrigatória');
    }

    console.log('Fetching content from URL:', url);

    // Fazer request para a URL da notícia
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar a notícia: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML content length:', html.length);

    // Extrair conteúdo específico para sites conhecidos
    let content = '';
    
    if (url.includes('conjur.com.br')) {
      // Conjur (WordPress): conteúdo fica dentro de .the_content
      const candidates: string[] = [];
      const patterns = [
        /<div[^>]*class=\"[^\"]*(?:the_content|entry-content|post-content|single-content|texto)[^\"]*\"[^>]*>([\s\S]*?)<\/div>/s,
        /<section[^>]*class=\"[^\"]*inner-content[^\"]*\"[^>]*>([\s\S]*?)<\/section>/s,
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m && m[1]) candidates.push(extractTextFromHTML(m[1]));
      }
      if (candidates.length) {
        // Escolhe o texto mais longo
        content = candidates.reduce((a, b) => (b.length > a.length ? b : a));
      }
    } else if (url.includes('migalhas.com.br')) {
      // Para Migalhas
      const articleMatch = html.match(/<div[^>]*class="[^"]*conteudo[^"]*"[^>]*>(.*?)<\/div>/s);
      if (articleMatch) {
        content = extractTextFromHTML(articleMatch[1]);
      }
    }

    // Fallback: tentar extrair conteúdo de article ou main
    if (!content) {
      let articleMatch = html.match(/<article[^>]*>(.*?)<\/article>/s);
      if (!articleMatch) {
        articleMatch = html.match(/<main[^>]*>(.*?)<\/main>/s);
      }
      if (!articleMatch) {
        // Último recurso: pegar tudo entre body
        articleMatch = html.match(/<body[^>]*>(.*?)<\/body>/s);
      }
      
      if (articleMatch) {
        content = extractTextFromHTML(articleMatch[1]);
      }
    }

    // Se ainda não temos conteúdo, extrair texto de todo o HTML
    if (!content) {
      content = extractTextFromHTML(html);
    }

    // Limitar o tamanho do conteúdo para evitar problemas
    if (content.length > 50000) {
      content = content.substring(0, 50000) + '... (conteúdo truncado)';
    }

    console.log('Extracted content length:', content.length);

    if (!content || content.length < 100) {
      throw new Error('Não foi possível extrair conteúdo suficiente da notícia');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        content: content,
        content_text: content,
        url: url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in news-content-proxy function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error?.message || 'Erro interno do servidor',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});