import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  resumo: string;
  legislacaoRelacionada: string[];
  impactosPraticos: string[];
  jurisprudencia: string[];
  recomendacoes: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ANALYZE LEGAL DOCUMENT FUNCTION STARTED ===');
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Extrair texto do documento usando a função extract-text
    let extractedText = '';
    let fileName = '';
    
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // Upload direto de arquivo
      console.log('Processing file upload...');
      
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        throw new Error('Nenhum arquivo foi enviado');
      }

      fileName = file.name;
      console.log(`File: ${fileName}, Type: ${file.type}, Size: ${file.size} bytes`);

      // Chamar extract-text para processar o arquivo
      const extractFormData = new FormData();
      extractFormData.append('file', file);

      const extractResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-text`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
        },
        body: extractFormData,
      });

      if (!extractResponse.ok) {
        throw new Error('Erro ao extrair texto do documento');
      }

      const extractResult = await extractResponse.json();
      extractedText = extractResult.text || '';
      
      if (!extractedText || extractedText.length < 50) {
        throw new Error('Não foi possível extrair texto suficiente do documento');
      }
    } else {
      throw new Error('Formato de requisição não suportado');
    }

    console.log(`Extracted text length: ${extractedText.length}`);

    // Buscar legislação relacionada via APIs governamentais
    const searchLegislation = async (searchTerm: string): Promise<string[]> => {
      const results: string[] = [];
      
      try {
        // API da Câmara dos Deputados - Proposições
        const camaraResponse = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/proposicoes?keywords=${encodeURIComponent(searchTerm)}&ordem=DESC&ordenarPor=id&itens=5`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (camaraResponse.ok) {
          const camaraData = await camaraResponse.json();
          if (camaraData.dados && camaraData.dados.length > 0) {
            camaraData.dados.forEach((prop: any) => {
              results.push(`${prop.siglaTipo} ${prop.numero}/${prop.ano} - ${prop.ementa}`);
            });
          }
        }
      } catch (error) {
        console.log('Erro ao buscar na API da Câmara:', error);
      }

      try {
        // API do Senado Federal - Matérias
        const senadoResponse = await fetch(
          `https://legis.senado.leg.br/dadosabertos/materia/pesquisa/lista?v=5&texto=${encodeURIComponent(searchTerm)}&formato=json`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (senadoResponse.ok) {
          const senadoData = await senadoResponse.json();
          if (senadoData.ListaMateriaResult?.Materias?.Materia) {
            const materias = Array.isArray(senadoData.ListaMateriaResult.Materias.Materia) 
              ? senadoData.ListaMateriaResult.Materias.Materia 
              : [senadoData.ListaMateriaResult.Materias.Materia];
            
            materias.slice(0, 3).forEach((materia: any) => {
              results.push(`${materia.SiglaSubtipoMateria} ${materia.NumeroMateria}/${materia.AnoMateria} - ${materia.EmentaMateria}`);
            });
          }
        }
      } catch (error) {
        console.log('Erro ao buscar na API do Senado:', error);
      }

      return results;
    };

    // Extrair palavras-chave do texto para busca
    const extractKeywords = (text: string): string[] => {
      const legalTerms = [
        'direito civil', 'direito penal', 'direito constitucional', 'direito administrativo',
        'direito tributário', 'direito do trabalho', 'processo civil', 'processo penal',
        'contratos', 'responsabilidade civil', 'família', 'sucessões', 'propriedade',
        'crimes', 'penas', 'licitação', 'servidor público', 'tributos', 'impostos'
      ];
      
      const keywords = legalTerms.filter(term => 
        text.toLowerCase().includes(term)
      );
      
      return keywords.length > 0 ? keywords.slice(0, 3) : ['legislação brasileira'];
    };

    // Buscar legislação relacionada
    const keywords = extractKeywords(extractedText);
    const legislacaoResults = await Promise.all(
      keywords.map(keyword => searchLegislation(keyword))
    );
    const legislacaoRelacionada = legislacaoResults.flat().slice(0, 8);

    // Prompt detalhado para o Gemini
    const prompt = `
Você é um especialista em direito brasileiro. Analise o seguinte documento jurídico e forneça um resumo super detalhado seguindo exatamente esta estrutura JSON:

DOCUMENTO:
${extractedText}

LEGISLAÇÃO ENCONTRADA:
${legislacaoRelacionada.join('\n')}

Responda APENAS com um JSON válido seguindo esta estrutura exata:
{
  "resumo": "Resumo super detalhado do documento, com análise completa dos aspectos jurídicos, contextualizando dentro do ordenamento jurídico brasileiro. Mínimo 500 palavras.",
  "legislacaoRelacionada": ["Lei específica relacionada", "Decreto relacionado", "Jurisprudência aplicável"],
  "impactosPraticos": ["Impacto prático 1", "Impacto prático 2", "Consequências jurídicas"],
  "jurisprudencia": ["STF: decisão relevante", "STJ: precedente aplicável", "Tribunal: caso similar"],
  "recomendacoes": ["Recomendação prática 1", "Cuidado jurídico necessário", "Próximos passos sugeridos"]
}

IMPORTANTE:
- Seja extremamente detalhado no resumo (mínimo 500 palavras)
- Cite legislação específica e atual
- Inclua jurisprudência dos tribunais superiores quando aplicável
- Forneça recomendações práticas e aplicáveis
- Use linguagem técnica jurídica apropriada
- Responda APENAS com o JSON, sem texto adicional
`;

    console.log('Calling Gemini API for legal analysis...');

    // Chamar Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.3,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API do Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated text length:', generatedText.length);

    // Tentar fazer parse do JSON
    let analysisResult: AnalysisResult;
    try {
      // Limpar texto antes do parse
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*/, '')
        .replace(/\s*$/, '');
      
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Texto gerado:', generatedText);
      
      // Fallback: criar estrutura básica
      analysisResult = {
        resumo: generatedText.slice(0, 2000) + '...',
        legislacaoRelacionada: legislacaoRelacionada.slice(0, 5),
        impactosPraticos: [
          'Análise detalhada do documento jurídico',
          'Identificação de aspectos relevantes para a prática jurídica',
          'Avaliação de conformidade com a legislação vigente'
        ],
        jurisprudencia: [
          'Pesquisa de precedentes nos tribunais superiores recomendada',
          'Análise de jurisprudência específica do tema identificado',
          'Consulta a decisões recentes sobre matéria similar'
        ],
        recomendacoes: [
          'Consultar advogado especializado na área específica',
          'Verificar atualizações legislativas recentes',
          'Acompanhar jurisprudência atual dos tribunais superiores'
        ]
      };
    }

    // Garantir que todos os campos existam e não estejam vazios
    if (!analysisResult.legislacaoRelacionada || analysisResult.legislacaoRelacionada.length === 0) {
      analysisResult.legislacaoRelacionada = legislacaoRelacionada.slice(0, 5);
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in analyze-legal-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});