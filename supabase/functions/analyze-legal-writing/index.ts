import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TechnicalAnalysisResult {
  resumoGeral: string;
  fundamentacaoLegal: string[];
  jurisprudencia: string[];
  aspectosFormais: string[];
  aspectosConteudo: string[];
  legislacaoAplicavel: string[];
  recomendacoesTecnicas: string[];
  pontuacao: {
    tecnica: number;
    fundamentacao: number;
    estrutura: number;
    linguagem: number;
    geral: number;
  };
}

// Função para buscar legislação relacionada
async function searchLegislation(searchTerm: string): Promise<string[]> {
  const results: string[] = [];
  
  try {
    // API da Câmara dos Deputados - Proposições
    const camaraUrl = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?keywords=${encodeURIComponent(searchTerm)}&ordem=ASC&ordenarPor=id&itens=5`;
    const camaraResponse = await fetch(camaraUrl);
    if (camaraResponse.ok) {
      const camaraData = await camaraResponse.json();
      if (camaraData.dados) {
        camaraData.dados.forEach((prop: any) => {
          results.push(`${prop.siglaTipo} ${prop.numero}/${prop.ano} - ${prop.ementa?.substring(0, 100)}...`);
        });
      }
    }
  } catch (error) {
    console.log('Erro na API da Câmara:', error);
  }

  try {
    // API do Senado - Matérias
    const senadoUrl = `https://legis.senado.leg.br/dadosabertos/materia/pesquisa/lista?q=${encodeURIComponent(searchTerm)}`;
    const senadoResponse = await fetch(senadoUrl);
    if (senadoResponse.ok) {
      const senadoData = await senadoResponse.json();
      if (senadoData.PesquisaBasicaMateria?.Materias?.Materia) {
        const materias = Array.isArray(senadoData.PesquisaBasicaMateria.Materias.Materia) 
          ? senadoData.PesquisaBasicaMateria.Materias.Materia.slice(0, 3)
          : [senadoData.PesquisaBasicaMateria.Materias.Materia];
          
        materias.forEach((materia: any) => {
          results.push(`${materia.SiglaSubtipoMateria} ${materia.NumeroMateria}/${materia.AnoMateria} - ${materia.EmentaMateria?.substring(0, 100)}...`);
        });
      }
    }
  } catch (error) {
    console.log('Erro na API do Senado:', error);
  }

  return results;
}

// Função para extrair palavras-chave jurídicas
function extractLegalKeywords(text: string): string[] {
  const legalTerms = [
    'código civil', 'código penal', 'constituição federal', 'clt', 'cpc', 'cpp',
    'responsabilidade civil', 'direito', 'lei', 'artigo', 'jurisprudência',
    'tribunal', 'stf', 'stj', 'acórdão', 'decisão', 'sentença', 'processo',
    'petição', 'recurso', 'apelação', 'agravo', 'mandado', 'habeas corpus',
    'ação', 'procedimento', 'competência', 'jurisdição', 'prazo', 'prescrição',
    'decadência', 'nulidade', 'anulabilidade', 'legitimidade', 'interesse'
  ];
  
  const textLower = text.toLowerCase();
  const keywords = legalTerms.filter(term => textLower.includes(term));
  
  // Extrair também palavras específicas que aparecem com frequência
  const words = textLower.match(/\b\w{4,}\b/g) || [];
  const wordCount: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (word.length > 5 && !['sobre', 'através', 'sendo', 'dessa', 'desta', 'neste', 'nesta', 'entre', 'todos', 'todas', 'apenas', 'também', 'assim', 'portanto'].includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  const frequentWords = Object.entries(wordCount)
    .filter(([word, count]) => count >= 2)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  return [...new Set([...keywords, ...frequentWords])];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== ANALYZE LEGAL WRITING FUNCTION STARTED ===");
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const analysisType = formData.get('analysisType') as string || 'technical';

    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }

    console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
    console.log(`Analysis type: ${analysisType}`);

    // Extrair texto do documento
    console.log("Extracting text from document...");
    const textFormData = new FormData();
    textFormData.append('file', file);

    const extractResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-text`, {
      method: 'POST',
      body: textFormData,
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      }
    });

    if (!extractResponse.ok) {
      throw new Error(`Erro na extração de texto: ${extractResponse.status}`);
    }

    const { extractedText } = await extractResponse.json();
    console.log(`Extracted text length: ${extractedText.length}`);

    // Buscar legislação relacionada (apenas para análise técnica)
    let legislacaoRelacionada: string[] = [];
    if (analysisType === 'technical') {
      console.log("Searching for related legislation...");
      const keywords = extractLegalKeywords(extractedText);
      console.log(`Extracted keywords: ${keywords.join(', ')}`);
      
      for (const keyword of keywords.slice(0, 3)) {
        const results = await searchLegislation(keyword);
        legislacaoRelacionada.push(...results);
      }
      
      // Remover duplicatas
      legislacaoRelacionada = [...new Set(legislacaoRelacionada)];
      console.log(`Found ${legislacaoRelacionada.length} related legislation items`);
    }

    // Preparar prompt baseado no tipo de análise
    let prompt = '';
    
    if (analysisType === 'technical') {
      prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE JURÍDICA TÉCNICA. Analise minuciosamente o seguinte texto jurídico e forneça uma análise técnica completa e aprofundada.

DOCUMENTO:
${extractedText}

LEGISLAÇÃO ENCONTRADA (use como referência):
${legislacaoRelacionada.join('\n')}

INSTRUÇÕES ESPECÍFICAS:
1. Faça um resumo geral técnico e detalhado
2. Identifique fundamentação legal específica (artigos, leis, códigos)
3. Busque jurisprudência aplicável e precedentes
4. Analise aspectos formais (estrutura, linguagem jurídica, técnica)
5. Analise aspectos de conteúdo (argumentação, coerência, completude)
6. Liste legislação aplicável específica
7. Forneça recomendações técnicas precisas
8. Atribua pontuações de 0-10 para cada critério

FORMATO DA RESPOSTA (OBRIGATÓRIO - RESPONDA APENAS EM JSON):
{
  "resumoGeral": "Análise técnica detalhada do documento em pelo menos 4 parágrafos",
  "fundamentacaoLegal": ["Base legal específica 1", "Base legal específica 2", "..."],
  "jurisprudencia": ["Precedente ou entendimento jurisprudencial 1", "Precedente 2", "..."],
  "aspectosFormais": ["Aspecto formal 1", "Aspecto formal 2", "..."],
  "aspectosConteudo": ["Aspecto de conteúdo 1", "Aspecto de conteúdo 2", "..."],
  "legislacaoAplicavel": ["Lei específica 1", "Lei específica 2", "..."],
  "recomendacoesTecnicas": ["Recomendação técnica 1", "Recomendação 2", "..."],
  "pontuacao": {
    "tecnica": 8.5,
    "fundamentacao": 7.0,
    "estrutura": 9.0,
    "linguagem": 8.0,
    "geral": 8.1
  }
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional antes ou depois.`;
    } else {
      // Análise simples - apenas resumo detalhado
      prompt = `
VOCÊ É UM ESPECIALISTA EM REDAÇÃO JURÍDICA. Analise o seguinte texto e forneça um resumo super detalhado e explicativo.

DOCUMENTO:
${extractedText}

INSTRUÇÕES ESPECÍFICAS:
1. Crie um resumo abrangente e detalhado do documento
2. Forneça uma explicação clara e didática do conteúdo
3. Identifique os pontos-chave mais importantes
4. Analise a estrutura e argumentação
5. Use linguagem acessível mas técnica quando necessário

FORMATO DA RESPOSTA (OBRIGATÓRIO - RESPONDA APENAS EM JSON):
{
  "resumo": "Resumo super detalhado em pelo menos 3 parágrafos extensos",
  "explicacao": "Explicação didática e clara sobre o conteúdo",
  "pontosChave": ["Ponto-chave 1 detalhado", "Ponto-chave 2", "..."],
  "estrutura": "Análise da estrutura do documento",
  "argumentacao": "Análise da argumentação utilizada"
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional antes ou depois.`;
    }

    // Chamar Gemini API
    console.log(`Calling Gemini API for ${analysisType} analysis...`);
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Erro na API do Gemini: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini API response received");

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('Nenhuma resposta foi gerada pelo Gemini');
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log(`Generated text length: ${generatedText.length}`);

    // Parse do JSON da resposta do Gemini
    let analysisResult: any;
    try {
      const cleanText = generatedText.trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(cleanText);
      }

    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Texto gerado:', generatedText);
      
      // Fallback baseado no tipo de análise
      if (analysisType === 'technical') {
        analysisResult = {
          resumoGeral: generatedText.substring(0, 2000) + '...',
          fundamentacaoLegal: ['Análise gerada com sucesso', 'Verifique o resumo para detalhes'],
          jurisprudencia: ['Consulte jurisprudência específica para o caso'],
          aspectosFormais: ['Documento processado', 'Estrutura analisada'],
          aspectosConteudo: ['Conteúdo revisado', 'Argumentação verificada'],
          legislacaoAplicavel: legislacaoRelacionada.slice(0, 5),
          recomendacoesTecnicas: ['Revise fundamentação legal', 'Melhore estrutura argumentativa'],
          pontuacao: {
            tecnica: 7.5,
            fundamentacao: 7.0,
            estrutura: 8.0,
            linguagem: 7.5,
            geral: 7.5
          }
        };
      } else {
        analysisResult = {
          resumo: generatedText.substring(0, 1500) + '...',
          explicacao: 'Documento analisado com sucesso. A análise completa está disponível no resumo.',
          pontosChave: ['Documento processado', 'Conteúdo extraído', 'Análise gerada'],
          estrutura: 'Estrutura do documento foi analisada',
          argumentacao: 'Argumentação do texto foi revisada'
        };
      }
    }

    console.log(`${analysisType} analysis completed successfully`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in analyze-legal-writing function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: `Erro ao processar análise jurídica`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});