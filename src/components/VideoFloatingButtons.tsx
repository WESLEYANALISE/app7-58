import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, MessageSquare, BookOpen, Loader2, X, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
interface VideoFloatingButtonsProps {
  videoTitle: string;
  videoId: string;
  channelTitle: string;
}
interface AIResponse {
  resumo?: string;
  mapaMental?: string;
  questoes?: Array<{
    pergunta: string;
    alternativas: string[];
    resposta_correta: number;
    explicacao: string;
  }>;
}
export const VideoFloatingButtons = ({
  videoTitle,
  videoId,
  channelTitle
}: VideoFloatingButtonsProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse>({});
  const {
    toast
  } = useToast();
  const generateAIContent = async (type: 'resumo' | 'mapaMental' | 'questoes') => {
    if (aiResponse[type]) {
      setActiveDialog(type);
      return;
    }
    setLoading(type);
    try {
      let prompt = '';
      switch (type) {
        case 'resumo':
          prompt = `Faça um resumo completo e estruturado do vídeo "${videoTitle}" do canal "${channelTitle}". 
                   Organize o resumo em tópicos principais, conceitos-chave e pontos importantes para estudo.`;
          break;
        case 'mapaMental':
          prompt = `Crie um mapa mental em formato markdown do vídeo "${videoTitle}" do canal "${channelTitle}".
                   Use estrutura hierárquica com tópicos principais, subtópicos e conceitos relacionados.
                   Formate como lista aninhada com markdown.`;
          break;
        case 'questoes':
          prompt = `Crie 5 questões de múltipla escolha (4 alternativas cada) sobre o conteúdo do vídeo "${videoTitle}" do canal "${channelTitle}".
                   Inclua questões de diferentes níveis de dificuldade e forneça explicações para as respostas corretas.
                   Responda no formato JSON: {
                     "questoes": [
                       {
                         "pergunta": "texto da pergunta",
                         "alternativas": ["a) opção 1", "b) opção 2", "c) opção 3", "d) opção 4"],
                         "resposta_correta": 0,
                         "explicacao": "explicação da resposta"
                       }
                     ]
                   }`;
          break;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          conversationHistory: []
        }
      });
      if (error) throw error;
      if (type === 'questoes') {
        try {
          const jsonResponse = JSON.parse(data.response);
          setAiResponse(prev => ({
            ...prev,
            [type]: jsonResponse.questoes
          }));
        } catch {
          // Se não conseguir fazer parse como JSON, trata como texto
          setAiResponse(prev => ({
            ...prev,
            [type]: data.response
          }));
        }
      } else {
        setAiResponse(prev => ({
          ...prev,
          [type]: data.response
        }));
      }
      setActiveDialog(type);
      toast({
        title: "Conteúdo gerado!",
        description: "O conteúdo foi gerado com sucesso pela IA."
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro ao gerar conteúdo",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };
  const renderQuestoes = () => {
    const questoes = aiResponse.questoes;
    if (!questoes || !Array.isArray(questoes)) {
      return <MarkdownRenderer content={String(aiResponse.questoes) || ''} />;
    }
    return <div className="space-y-6">
        {questoes.map((questao, index) => <Card key={index} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-white mb-3">
                {index + 1}. {questao.pergunta}
              </h4>
              <div className="space-y-2 mb-4">
                {questao.alternativas.map((alternativa, altIndex) => <div key={altIndex} className={`p-2 rounded ${altIndex === questao.resposta_correta ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-slate-700/50 text-slate-300'}`}>
                    {alternativa}
                  </div>)}
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded">
                <h5 className="font-medium text-blue-300 mb-1">Explicação:</h5>
                <p className="text-blue-200 text-sm">{questao.explicacao}</p>
              </div>
            </CardContent>
          </Card>)}
      </div>;
  };
  return <>
      {/* Botões Flutuantes */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        <Button onClick={() => generateAIContent('resumo')} disabled={loading === 'resumo'} className="w-12 h-12 rounded-full bg-blue-600/90 hover:bg-blue-500 backdrop-blur-sm border border-blue-400/30 shadow-lg" size="icon">
          {loading === 'resumo' ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
        </Button>

        

        
      </div>

      {/* Dialogs para cada tipo de conteúdo */}
      <Dialog open={activeDialog === 'resumo'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Resumo do Vídeo
            </DialogTitle>
          </DialogHeader>
          <div className="text-slate-200">
            <MarkdownRenderer content={aiResponse.resumo || ''} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'mapaMental'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Mapa Mental
            </DialogTitle>
          </DialogHeader>
          <div className="text-slate-200">
            <MarkdownRenderer content={aiResponse.mapaMental || ''} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'questoes'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-green-400" />
              Questões de Estudo
            </DialogTitle>
          </DialogHeader>
          <div className="text-slate-200">
            {renderQuestoes()}
          </div>
        </DialogContent>
      </Dialog>
    </>;
};