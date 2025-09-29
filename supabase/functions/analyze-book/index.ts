import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookTitle, author, area, description, benefits } = await req.json();

    if (!openAIApiKey && !geminiApiKey) {
      throw new Error('AI API key not configured');
    }

    const prompt = `Você é um assistente especializado em análise de livros jurídicos. Analise detalhadamente o seguinte livro:

**Título:** ${bookTitle}
**Autor:** ${author || 'Não especificado'}
**Área:** ${area}
**Descrição:** ${description || 'Não disponível'}
**Benefícios:** ${benefits || 'Não especificado'}

Faça uma análise COMPLETA e DETALHADA do livro seguindo exatamente esta estrutura em Markdown:

# 📚 Análise Detalhada: ${bookTitle}

## 🎯 **Resumo Executivo**
[Faça um resumo do que o livro aborda, sua importância no cenário jurídico brasileiro]

## 📖 **Análise do Conteúdo**
[Analise detalhadamente o conteúdo do livro, suas principais teses, metodologia, abordagem]

## ⚖️ **Relevância Jurídica**
[Explique a importância desta obra no Direito ${area}, como ela influencia a prática jurídica]

## 🎓 **Benefícios para Estudantes de Direito**
### **Para Estudantes Iniciantes:**
- [Benefício específico 1]
- [Benefício específico 2]
- [Benefício específico 3]

### **Para Estudantes Avançados:**
- [Benefício específico 1]
- [Benefício específico 2]
- [Benefício específico 3]

### **Para Profissionais:**
- [Benefício específico 1]
- [Benefício específico 2]
- [Benefício específico 3]

## 💼 **Aplicação Prática**
### **Casos Práticos onde o livro é relevante:**
1. **Caso 1:** [Descreva um caso prático específico]
2. **Caso 2:** [Descreva outro caso prático]
3. **Caso 3:** [Descreva um terceiro caso]

### **Peças Processuais que se beneficiam desta leitura:**
- [Tipo de peça 1 e por quê]
- [Tipo de peça 2 e por quê]
- [Tipo de peça 3 e por quê]

## 🏛️ **Conexões com Outras Áreas do Direito**
[Explique como este livro se conecta com outras áreas jurídicas]

## 📊 **Metodologia de Estudo Recomendada**
### **Como estudar este livro efetivamente:**
1. **Primeira leitura:** [Orientação específica]
2. **Segunda leitura:** [Orientação específica]
3. **Revisão:** [Orientação específica]
4. **Aplicação prática:** [Orientação específica]

## 🎯 **Tópicos-Chave para Memorização**
- [Conceito fundamental 1]
- [Conceito fundamental 2]
- [Conceito fundamental 3]
- [Conceito fundamental 4]
- [Conceito fundamental 5]

## 📚 **Leituras Complementares Recomendadas**
1. [Livro complementar 1 e por quê]
2. [Livro complementar 2 e por quê]
3. [Livro complementar 3 e por quê]

## ⭐ **Avaliação Final**
### **Pontos Fortes:**
- [Ponto forte 1]
- [Ponto forte 2]
- [Ponto forte 3]

### **Considerações:**
- [Consideração 1]
- [Consideração 2]

### **Recomendação:**
[Recomendação final sobre quando e como usar este livro]

---
*Análise gerada pela IA especializada em educação jurídica*

IMPORTANTE: Use Markdown adequadamente, seja específico sobre o Direito ${area}, use exemplos práticos reais do sistema jurídico brasileiro, e forneça orientações concretas para estudantes.`;

    const markdownToHtml = (markdown: string) => {
      return markdown
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
        .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
        .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
        .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p class="mb-3">')
        .replace(/^(?!<[h|l])/gm, '<p class="mb-3">')
        .replace(/<p class="mb-3"><\/p>/g, '');
    };

    // Prefer Gemini if available (key is present), fallback to OpenAI
    let analysisMarkdown = '';

    const tryGemini = async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: 'Você é um especialista em educação jurídica e análise de livros de Direito. Suas análises são detalhadas, práticas e focadas em ajudar estudantes e profissionais.' }] },
            { role: 'user', parts: [{ text: prompt }] }
          ]
        })
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error: ${err}`);
      }
      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      return parts.map((p: { text?: string }) => p.text || '').join('\n');
    };

    const tryOpenAI = async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { 
              role: 'system', 
              content: 'Você é um especialista em educação jurídica e análise de livros de Direito. Suas análises são detalhadas, práticas e focadas em ajudar estudantes e profissionais do Direito a maximizar o aprendizado.' 
            },
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: 3000,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        throw new Error(error.error?.message || 'Failed to analyze book');
      }
      const data = await response.json();
      return data.choices[0].message.content as string;
    };

    try {
      if (geminiApiKey) {
        analysisMarkdown = await tryGemini();
      } else if (openAIApiKey) {
        analysisMarkdown = await tryOpenAI();
      }
    } catch (e) {
      // Fallback: if preferred provider failed and the other is available, try it
      if (geminiApiKey && openAIApiKey) {
        try {
          analysisMarkdown = analysisMarkdown || (openAIApiKey ? await tryOpenAI() : '');
        } catch (_) {
          analysisMarkdown = await tryGemini();
        }
      } else {
        throw e;
      }
    }

    const htmlAnalysis = markdownToHtml(analysisMarkdown);

    return new Response(JSON.stringify({ analysis: htmlAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-book function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});