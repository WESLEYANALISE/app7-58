import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, fileData, format } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let prompt = '';
    let parts: any[] = [];
    const supabaseClient = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    if (type === 'subtema') {
      // O conteúdo recebido já deve ser o texto do campo "Conteúdo" da tabela
      prompt = `Organize o conteúdo abaixo em um MAPA MENTAL claramente estruturado.\n\nBase de conteúdo:\n${content}\n\nRegras:\n- Um nó central com o tema principal (use um título claro)\n- 3-5 nós principais conectados ao centro\n- 2-3 subnós por nó principal com resumos objetivos\n- Distribua as posições em estrutura radial bem espaçada\n- Retorne SOMENTE JSON válido, sem markdown. IDs como strings.\n\nEstrutura JSON esperada: { "title": string, "nodes": Node[], "edges": Edge[] }`;
      parts = [{ text: prompt }];
    } else if (type === 'custom' || type === 'file') {
      if (format === 'text') {
        // Gerar mapa mental em formato texto estruturado
        let baseText = '';
        try {
          const term = String(content || '').trim();
          if (supabaseClient && term.length > 0) {
            const { data: rows, error: qErr } = await supabaseClient
              .from('MAPAS MENTAIS')
              .select('Tema, Subtema, Conteúdo, Área')
              .or(`Subtema.ilike.%${term}%,Tema.ilike.%${term}%,Área.ilike.%${term}%`)
              .limit(20);
            if (!qErr && rows && rows.length) {
              baseText = rows
                .map((r: any) => `Área: ${r['Área'] || ''}\nTema: ${r['Tema'] || ''}\nSubtema: ${r['Subtema'] || ''}\nConteúdo: ${r['Conteúdo'] || ''}`)
                .join('\n---\n');
            }
          }
        } catch (e) {
          console.warn('DB enrichment failed:', e);
        }

        if (baseText) {
          prompt = `Crie um mapa mental estruturado em texto baseado no conteúdo fornecido.\n\nConsulta: "${content}"\n\nBASE DE DADOS:\n${baseText}\n\nRetorne um JSON com esta estrutura exata:\n{\n  "title": "Título do Mapa Mental",\n  "centralTopic": "Tópico central principal",\n  "branches": [\n    {\n      "title": "Nome do ramo",\n      "icon": "emoji apropriado",\n      "subtopics": [\n        {"title": "Subtópico", "content": "Descrição detalhada"}\n      ]\n    }\n  ]\n}\n\nUse 3-5 ramos principais, cada um com 2-4 subtópicos. Inclua emojis relevantes para cada ramo.`;
        } else {
          prompt = `Crie um mapa mental estruturado sobre: "${content}".\n\nRetorne um JSON com esta estrutura:\n{\n  "title": "Título do Mapa Mental",\n  "centralTopic": "Tópico central principal",\n  "branches": [\n    {\n      "title": "Nome do ramo",\n      "icon": "emoji apropriado",\n      "subtopics": [\n        {"title": "Subtópico", "content": "Descrição detalhada"}\n      ]\n    }\n  ]\n}\n\nUse 3-5 ramos principais, cada um com 2-4 subtópicos. Inclua emojis relevantes.`;
        }
        
        if (fileData) {
          parts = [
            { text: prompt },
            {
              inline_data: {
                mime_type: fileData.mimeType,
                data: fileData.data
              }
            }
          ];
        } else {
          parts = [{ text: prompt }];
        }
      } else {
        // Formato original para canvas
        let baseText = '';
        try {
          const term = String(content || '').trim();
          if (supabaseClient && term.length > 0) {
            const { data: rows, error: qErr } = await supabaseClient
              .from('MAPAS MENTAIS')
              .select('Tema, Subtema, Conteúdo, Área')
              .or(`Subtema.ilike.%${term}%,Tema.ilike.%${term}%,Área.ilike.%${term}%`)
              .limit(20);
            if (!qErr && rows && rows.length) {
              baseText = rows
                .map((r: any) => `Área: ${r['Área'] || ''}\nTema: ${r['Tema'] || ''}\nSubtema: ${r['Subtema'] || ''}\nConteúdo: ${r['Conteúdo'] || ''}`)
                .join('\n---\n');
            }
          }
        } catch (e) {
          console.warn('DB enrichment failed:', e);
        }

        if (baseText) {
          prompt = `Use a base de conteúdos abaixo para criar um mapa mental completo e coerente.\nConsulta: "${content}"\n\nBASE:\n${baseText}\n\nRegras:\n- Centralize no tema predominante\n- 3-5 ramos principais, 2-3 subnós cada, com resumos práticos\n- Posições distribuídas radialmente (evite sobreposição)\n- Devolva SOMENTE JSON válido, sem markdown, seguindo a estrutura solicitada.`;
        } else {
          prompt = `Crie um mapa mental didático sobre: "${content}".\n- 3-5 ramos principais, 2-3 subnós cada\n- Retorne APENAS JSON válido conforme a estrutura exigida.`;
        }
        
        if (fileData) {
          parts = [
            { text: prompt },
            {
              inline_data: {
                mime_type: fileData.mimeType,
                data: fileData.data
              }
            }
          ];
        } else {
          parts = [{ text: prompt }];
        }
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        systemInstruction: {
          parts: [{
            text: format === 'text' 
              ? `Você é um especialista em mapas mentais. Retorne APENAS JSON válido com a estrutura solicitada, sem markdown. Para formato texto, use a estrutura com title, centralTopic e branches com ícones emoji apropriados.`
              : `Você é um especialista em mapas mentais e organização de informações.\n- Retorne APENAS JSON válido, sem markdown.\n- IDs devem ser strings.\n- As posições devem formar uma estrutura radial centrada, sem sobreposição.\n- Cada nó deve conter data.label e opcionalmente data.content com texto curto.\n- Os edges devem conectar nós por id e usar type "smoothstep".`
          }]
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Gemini API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // Extrair JSON da resposta de forma robusta
    let mindMapData;
    try {
      let extracted = null as string | null;
      // Primeiro, tente capturar bloco de código ```json
      const fence = generatedContent.match(/```json\s*([\s\S]*?)```/i);
      if (fence && fence[1]) extracted = fence[1];
      // Depois, tente bloco ``` sem linguagem
      if (!extracted) {
        const fenceAny = generatedContent.match(/```\s*([\s\S]*?)```/);
        if (fenceAny && fenceAny[1]) extracted = fenceAny[1];
      }
      // Por fim, tente pelo primeiro objeto { }
      if (!extracted) {
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) extracted = jsonMatch[0];
      }
      if (!extracted) throw new Error('JSON not found in response');
      mindMapData = JSON.parse(extracted);
    } catch (parseError) {
      console.warn('Parse failed, using fallback:', parseError);
      // Fallback: criar estrutura básica
      if (format === 'text') {
        mindMapData = {
          title: content || 'Mapa Mental',
          centralTopic: content || 'Tópico Central',
          branches: [
            {
              title: 'Conceitos Principais',
              icon: '💡',
              subtopics: [
                { 
                  title: 'Definição', 
                  content: (generatedContent || '').substring(0, 160) + '...' 
                }
              ]
            }
          ]
        };
      } else {
        mindMapData = {
          title: content || 'Mapa Mental',
          nodes: [
            {
              id: '1',
              data: { label: content || 'Tópico Central', content: (generatedContent || '').substring(0, 160) },
              position: { x: 400, y: 200 },
              type: 'mindmap'
            }
          ],
          edges: []
        };
      }
    }

    return new Response(JSON.stringify({ success: true, mindMap: mindMapData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error generating mind map:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});