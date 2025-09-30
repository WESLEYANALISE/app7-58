import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, Paperclip, Download, Copy, Sparkles, 
  FileText, HelpCircle, BookOpen, Scale, Loader2,
  X, Image as ImageIcon, Check, Camera, FileUp, Zap
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '@/utils/clipboardUtils';
import { useProfessoraAIPDFExport } from '@/hooks/useProfessoraAIPDFExport';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  file?: { name: string; type: string };
  suggestions?: string[];
}

interface ProfessoraIAEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  bookContext?: any;
  area?: string;
}

export const ProfessoraIAEnhanced: React.FC<ProfessoraIAEnhancedProps> = ({
  isOpen,
  onClose,
  bookContext,
  area
}) => {
  const areaLabel = typeof area === 'string' ? area : (area ? String(area) : '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const { toast } = useToast();
  const { exporting, exportConversationToPDF } = useProfessoraAIPDFExport();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Comprimir imagens - otimizado para mobile
  const compressImage = (file: File, maxSize = 1280, quality = 0.75): Promise<{ data: string; mimeType: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas não suportado'));

          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ data: dataUrl.split(',')[1], mimeType: 'image/jpeg', name: file.name.replace(/\.[^.]+$/, '.jpg') });
        };
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  // Mensagem inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `🎓 Olá! Sou sua **Professora de Direito IA Premium**!

${bookContext && typeof bookContext === 'object' && bookContext?.livro ? `📚 Estou aqui para ajudar com o livro **"${bookContext.livro}"**` : ''}
${areaLabel ? `📖 Especializada em **${areaLabel}**` : ''}

**Posso te ajudar de várias formas:**

📄 Analisar documentos (PDFs com imagens, textos jurídicos)
💡 Explicar conceitos de forma detalhada e prática  
📝 Gerar flashcards personalizados para estudos
❓ Criar questões objetivas e discursivas
📋 Resumir artigos e documentos complexos
⚖️ Sugerir casos práticos e jurisprudências relevantes
📤 Exportar conversas em PDF

Como posso te ajudar hoje? 🚀`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setShowQuickActions(true);
      
      // Foco automático no textarea
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen, bookContext, area]);

  // Auto-scroll suave e debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Enviar mensagem com streaming e buffer
  const sendMessage = async (macroPrompt?: string) => {
    const finalInput = macroPrompt || input;
    if ((!finalInput.trim() && !uploadedFile) || isLoading) return;

    setShowQuickActions(false);

    const userMessage: Message = {
      role: 'user',
      content: uploadedFile ? `Documento: ${uploadedFile.name}` : finalInput,
      timestamp: new Date(),
      file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = finalInput;
    const currentFile = uploadedFile;
    
    setInput('');
    setUploadedFile(null);
    setIsLoading(true);

    try {
      let fileData = null;
      
      if (currentFile) {
        if (/heic|heif/i.test(currentFile.type)) {
          toast({
            title: 'Formato não suportado',
            description: 'Por favor, tire a foto em JPG/PNG ou converta a imagem.',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        } else if (currentFile.type.startsWith('image/')) {
          try {
            const compressed = await compressImage(currentFile);
            fileData = compressed;
          } catch (e) {
            const buffer = await currentFile.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            fileData = { data: base64, mimeType: currentFile.type, name: currentFile.name };
          }
        } else {
          // PDF ou outros
          const buffer = await currentFile.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          fileData = {
            data: base64,
            mimeType: currentFile.type,
            name: currentFile.name
          };
        }
      }

      let contextType = '';
      if (bookContext) {
        contextType = `Usuário estudando: "${bookContext.livro}" ${bookContext.autor ? `por ${bookContext.autor}` : ''}`;
      }

      // Streaming com fetch
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/professora-ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: currentInput || 'Analise e explique',
            fileData,
            conversationHistory: messages.slice(-6).map(m => ({
              role: m.role,
              content: m.content
            })),
            area: areaLabel,
            contextType
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Limite atingido",
            description: "Muitas requisições. Aguarde alguns instantes.",
            variant: "destructive"
          });
          setMessages(prev => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Créditos insuficientes",
            description: "Adicione créditos em Settings → Workspace → Usage.",
            variant: "destructive"
          });
          setMessages(prev => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }
        throw new Error(`Erro ${response.status}`);
      }

      // Processar stream com buffer (coalescência)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      let pendingContent = '';

      // Adicionar mensagem vazia do assistente
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Buffer para reduzir re-renders no mobile (atualiza a cada ~30ms)
      const flushInterval = setInterval(() => {
        if (pendingContent) {
          const toFlush = pendingContent;
          pendingContent = '';
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = toFlush;
            }
            return newMessages;
          });
        }
      }, 30);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              pendingContent = assistantContent;
            }
          } catch (e) {
            // Ignorar erros de parse
          }
        }
      }

      clearInterval(flushInterval);

      // Flush final
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = assistantContent;
        }
        return newMessages;
      });

      // Adicionar sugestões inteligentes
      const suggestions = generateSmartSuggestions(assistantContent);
      if (suggestions.length > 0) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.suggestions = suggestions;
          }
          return newMessages;
        });
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar sugestões inteligentes
  const generateSmartSuggestions = (content: string): string[] => {
    const suggestions: string[] = [];
    
    if (content.toLowerCase().includes('artigo') || content.toLowerCase().includes('código')) {
      suggestions.push('Explique com exemplo prático');
    }
    if (content.toLowerCase().includes('jurisprudência')) {
      suggestions.push('Mostre casos semelhantes');
    }
    if (content.length > 500) {
      suggestions.push('Resuma os pontos principais');
      suggestions.push('Gere flashcards sobre isso');
    }
    if (content.toLowerCase().includes('contrato') || content.toLowerCase().includes('processo')) {
      suggestions.push('Quais os pontos de atenção?');
    }
    
    suggestions.push('Crie questões de prova');
    
    return suggestions.slice(0, 3);
  };

  // Copiar mensagem
  const copyMessage = async (content: string, messageId: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para área de transferência",
      });
    }
  };

  // Copiar última resposta
  const copyLastResponse = () => {
    const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistant) {
      copyMessage(lastAssistant.content, 'last');
    }
  };

  // Exportar conversa
  const handleExport = async () => {
    await exportConversationToPDF(
      messages,
      `Conversa - ${bookContext?.livro || areaLabel || 'Professora IA'}`
    );
  };

  // Upload de arquivo PDF
  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "Tamanho máximo: 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: "PDF carregado",
      description: `${file.name} pronto para envio`,
    });
  };

  // Upload de imagem
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Imagem muito grande",
        description: "Tamanho máximo: 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: "Imagem carregada",
      description: `${file.name} será comprimida automaticamente`,
    });
  };

  // Gerar flashcards
  const generateFlashcards = async (content: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: `Com base neste conteúdo, crie 5 flashcards no formato JSON:
          
${content}

Responda APENAS com JSON válido neste formato:
{
  "flashcards": [
    {
      "pergunta": "string",
      "resposta": "string",
      "exemplo": "string"
    }
  ]
}`,
          conversationHistory: []
        }
      });

      if (error) throw error;

      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        toast({
          title: "✨ Flashcards Gerados!",
          description: `${parsed.flashcards.length} flashcards criados com sucesso`,
        });
        console.log('Flashcards:', parsed.flashcards);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar flashcards",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar questões
  const generateQuestions = async (content: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: `Com base neste conteúdo, crie 3 questões objetivas (múltipla escolha) no formato JSON:

${content}

Responda APENAS com JSON válido:
{
  "questoes": [
    {
      "enunciado": "string",
      "alternativas": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "resposta_correta": "A",
      "explicacao": "string"
    }
  ]
}`,
          conversationHistory: []
        }
      });

      if (error) throw error;

      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        toast({
          title: "✨ Questões Geradas!",
          description: `${parsed.questoes.length} questões criadas com sucesso`,
        });
        console.log('Questões:', parsed.questoes);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar questões",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Actions
  const QuickActions = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-red-900/20 rounded-xl border border-red-800/30"
    >
      <p className="text-xs text-red-300 mb-3 font-medium">⚡ Ações Rápidas:</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sendMessage('Resuma em tópicos práticos o que discutimos')}
          disabled={isLoading || messages.length <= 1}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <Zap className="w-4 h-4" />
          Resumir
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sendMessage('Explique passo a passo com exemplos práticos')}
          disabled={isLoading}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <BookOpen className="w-4 h-4" />
          Explicar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sendMessage('Sugira casos práticos relacionados ao tema')}
          disabled={isLoading}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <Scale className="w-4 h-4" />
          Casos
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sendMessage('Indique jurisprudências relevantes (se existirem)')}
          disabled={isLoading}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <FileText className="w-4 h-4" />
          Jurisprudências
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyLastResponse}
          disabled={messages.length <= 1}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <Copy className="w-4 h-4" />
          Copiar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          disabled={exporting || messages.length <= 1}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <Download className="w-4 h-4" />
          Exportar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
            if (lastAssistant) generateFlashcards(lastAssistant.content);
          }}
          disabled={isLoading || messages.length <= 1}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <Sparkles className="w-4 h-4" />
          Flashcards
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
            if (lastAssistant) generateQuestions(lastAssistant.content);
          }}
          disabled={isLoading || messages.length <= 1}
          className="text-xs text-red-100 hover:text-white hover:bg-red-800/40 h-auto py-2 flex-col gap-1"
        >
          <HelpCircle className="w-4 h-4" />
          Questões
        </Button>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <DialogContent 
          className="max-w-4xl h-[90vh] p-0 flex flex-col bg-gradient-to-br from-red-950 via-red-900 to-black border-red-800"
          asChild
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* Header */}
            <DialogHeader className="p-4 border-b border-red-800 shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-white text-xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-red-400" />
                  Professora IA Premium
                  {areaLabel && <span className="text-sm text-red-300">• {areaLabel}</span>}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-red-100 hover:text-white hover:bg-red-800/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-950/80 text-red-50 border border-red-800/50'
                      }`}
                    >
                      {message.file && (
                        <div className="mb-2 flex items-center gap-2 text-sm opacity-70">
                          <FileText className="w-4 h-4" />
                          {message.file.name}
                        </div>
                      )}
                      
                      <MarkdownRenderer content={message.content} />

                      {/* Quick Actions após primeira mensagem */}
                      {index === 0 && showQuickActions && <QuickActions />}

                      {message.role === 'assistant' && message.content && index > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-red-800/30">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content, String(index))}
                            className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                          >
                            {copiedMessageId === String(index) ? (
                              <Check className="w-3 h-3 mr-1" />
                            ) : (
                              <Copy className="w-3 h-3 mr-1" />
                            )}
                            Copiar
                          </Button>
                          
                          {message.content.length > 200 && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateFlashcards(message.content)}
                                disabled={isLoading}
                                className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                Flashcards
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateQuestions(message.content)}
                                disabled={isLoading}
                                className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                              >
                                <HelpCircle className="w-3 h-3 mr-1" />
                                Questões
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Sugestões */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-800/30">
                          <p className="text-xs text-red-300 mb-2">Sugestões:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setInput(suggestion);
                                  textareaRef.current?.focus();
                                }}
                                className="text-xs bg-red-800/30 hover:bg-red-800/50 text-red-100 px-3 py-1.5 rounded-full transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-red-950/80 border border-red-800/50 rounded-2xl p-4">
                    <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-red-800 shrink-0 bg-red-950/50">
              {uploadedFile && (
                <div className="mb-2 flex items-center gap-2 bg-red-900/30 p-2 rounded">
                  <FileText className="w-4 h-4 text-red-300" />
                  <span className="text-sm text-red-100">{uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    className="ml-auto text-red-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                {/* Input PDF separado */}
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePDFUpload}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                
                {/* Input Imagem separado com capture */}
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isLoading}
                  title="Anexar PDF"
                  className="text-red-100 hover:text-white hover:bg-red-800/50"
                >
                  <FileUp className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isLoading}
                  title="Anexar Imagem / Tirar Foto"
                  className="text-red-100 hover:text-white hover:bg-red-800/50"
                >
                  <Camera className="w-5 h-5" />
                </Button>
                
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Digite sua pergunta jurídica..."
                  className="flex-1 min-h-[60px] max-h-[120px] bg-red-900/30 border-red-800 text-white placeholder:text-red-300/50 resize-none"
                  disabled={isLoading}
                />
                
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || (!input.trim() && !uploadedFile)}
                  className="bg-red-600 hover:bg-red-700 text-white self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-red-300/70 mt-2 text-center">
                {messages.length - 1} mensagens • Ultra-rápida com IA Premium
              </p>
            </div>
          </motion.div>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};
