import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Loader2, Brain, Lightbulb, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';

interface LegalNewsChatProps {
  newsContent?: string;
  newsTitle?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Qual o impacto prático dessa decisão?",
  "Como isso afeta minha área de atuação?",
  "Existe algum precedente similar?",
  "Quais são os próximos passos esperados?",
  "Isso pode gerar recursos?"
];

export const LegalNewsChat = ({ newsContent, newsTitle }: LegalNewsChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    try {
      const context = `Você é um assistente jurídico especializado. Responda de forma didática e prática.

NOTÍCIA ANALISADA:
Título: ${newsTitle}
Conteúdo: ${newsContent}

PERGUNTA DO USUÁRIO: ${message}

Forneça uma resposta estruturada, prática e educativa.`;

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: { 
          message: context,
          conversationHistory: messages.slice(-6) // Últimas 6 mensagens para contexto
        }
      });

      if (error) throw error;

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Erro na IA');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: "Erro no chat",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Chat sobre a Notícia</h3>
        </div>

        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Faça perguntas sobre esta notícia jurídica. Nossa IA está pronta para esclarecer dúvidas e fornecer análises detalhadas.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Perguntas sugeridas:
              </p>
              <div className="grid gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => sendMessage(question)}
                    className="justify-start text-left h-auto p-2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analisando...</span>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex gap-2">
          <Input
            placeholder="Faça uma pergunta sobre esta notícia..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(currentMessage)}
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage(currentMessage)}
            disabled={loading || !currentMessage.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};