import { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AssistenteIAChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistenteIAChat = ({ isOpen, onClose }: AssistenteIAChatProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '👋 Olá! Eu sou sua Assistente IA Jurídica. Posso ajudá-lo a:\n\n📖 Explicar conceitos jurídicos complexos\n📝 Resumir legislações e artigos\n🔍 Esclarecer dúvidas sobre direito\n📚 Orientar sobre estudos\n\nComo posso ajudá-lo hoje?'
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setMessages(prev => [
      ...prev,
      { type: 'user', content: message },
      { type: 'bot', content: 'Obrigada pela sua pergunta! Esta é uma versão demonstrativa. Em breve terei acesso completo para te ajudar com suas dúvidas jurídicas.' }
    ]);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Container */}
      <div className="relative w-full max-w-md h-[80vh] bg-gradient-to-br from-red-800 to-red-950 rounded-t-3xl shadow-2xl animate-slide-in-up overflow-hidden transform translate-y-full animate-[slide-up_0.6s_ease-out_forwards]">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center animate-pulse">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Assistente IA</h3>
              <p className="text-white/70 text-sm">Online agora</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto h-[calc(80vh-140px)] space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-white text-gray-800 rounded-br-md'
                    : 'bg-white/20 text-white rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua dúvida jurídica..."
              className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};