import { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import professoraAvatar from '@/assets/professora-avatar.png';
import { supabase } from '@/integrations/supabase/client';

interface ProfessoraChatProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    titulo: string;
    area: string;
    sobre?: string;
  };
}

export const ProfessoraChat = ({ isOpen, onClose, context }: ProfessoraChatProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: `👩‍🏫 Olá! Sou sua Professora de Direito IA especializada!\n\n${context ? `📚 Vamos estudar "${context.titulo}" na área de ${context.area}.\n\n` : ''}✨ Posso ajudá-lo com:\n\n📖 Explicações detalhadas sobre a aula\n💡 Esclarecimento de conceitos jurídicos\n📝 Exemplos práticos e casos reais\n🎯 Preparação para OAB e concursos\n❓ Qualquer dúvida sobre o conteúdo\n\nComo posso te ajudar hoje?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    const userMsg = { type: 'user' as const, content: message };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);
    try {
      const history = [...messages, userMsg].map((m: any) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: userMsg.content,
          history,
          context,
        },
      });

      if (error) throw error;
      const botContent = data?.response || data?.generatedText || data?.message || 'Não consegui gerar uma resposta agora.';
      setMessages(prev => [...prev, { type: 'bot', content: botContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', content: 'Desculpe, houve um erro ao consultar a IA. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Container - Full screen on mobile, centered on desktop */}
      <div className="relative w-full h-full bg-gradient-to-br from-background to-background/95 rounded-none shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-primary/10 backdrop-blur-sm p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <img src={professoraAvatar} alt="Professora" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">Professora de Direito IA</h3>
              <p className="text-muted-foreground text-sm">
                {context ? `Especialista em ${context.area}` : 'Especialista em Direito'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-foreground hover:bg-muted rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 h-[calc(100vh-180px)]">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 pb-8 bg-muted/30 backdrop-blur-sm border-t border-border">
          <div className="flex space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua dúvida sobre a aula..."
              className="flex-1 bg-background/50 border-border text-foreground placeholder:text-muted-foreground min-h-12 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
              disabled={isLoading}
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};