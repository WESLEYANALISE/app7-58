import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, GraduationCap, X, Camera, FileText, Upload, Paperclip, Image as ImageIcon, Eye, AlertCircle, BookOpen, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { ExplainThisPartModal } from './ExplainThisPartModal';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageData?: string;
  file?: {
    name: string;
    type: string;
    url: string;
  };
  showAnalysisOptions?: boolean;
}

interface ProfessoraIAProps {
  video?: any;
  livro?: any;
  area?: string;
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const ProfessoraIA = ({ video, livro, area, isOpen, onClose }: ProfessoraIAProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Mensagem inicial da professora baseada no contexto
  useEffect(() => {
    if (isOpen) {
      let content = '';
      
      if (video) {
        content = `👋 Olá! Sou a Professora IA e estou aqui para ajudar você com a videoaula "${video.title}"${video.area ? ` da área de ${video.area}` : ''}.

📖 Posso explicar conceitos jurídicos desta videoaula
📝 Esclarecer dúvidas sobre o conteúdo apresentado
🔍 Dar exemplos práticos dos temas abordados
📚 Criar exercícios para fixar o aprendizado
💡 Conectar este conteúdo com outras matérias

O que você gostaria de saber sobre esta videoaula?`;
      } else if (livro) {
        content = `👋 Olá! Sou a Professora IA e já sei que você está estudando o livro "${livro.livro}"${livro.area ? ` da área de ${livro.area}` : ''}${livro.autor ? ` do autor ${livro.autor}` : ''}.

📖 Posso explicar conceitos e capítulos específicos
📝 Esclarecer dúvidas sobre qualquer parte da obra  
🔍 Dar exemplos práticos dos temas abordados
📚 Criar exercícios baseados no conteúdo
💡 Relacionar com jurisprudência e casos práticos

Pode me perguntar qualquer coisa sobre este livro que estou aqui para ajudar!`;
      } else {
        content = `🎓 Olá! Eu sou sua Professora de Direito!

Estou aqui para te ensinar de forma prática e didática${area ? ` na área de **${area}**` : ''}.

**Exemplos reais**

📄 **Analisar documentos e casos práticos**
👩‍🎓 **Preparar você para OAB e concursos**  
🔍 **Tirar todas as suas dúvidas**
📝 **Revisar seus documentos (PDFs e imagens)**

💡 **Dica**: Pode me mandar qualquer dúvida ou documento que vou te explicar tudo passo a passo!

Vamos começar? O que você gostaria de aprender hoje? 🚀`;
      }

      const initialMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [video, livro, area, isOpen]);

  // Auto scroll quando mensagens mudarem
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const sendMessage = async (imageData?: string, autoAnalyze?: boolean) => {
    if ((!inputMessage.trim() && !imageData && !uploadedFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: imageData ? 'Pode explicar esta parte?' : (uploadedFile ? (inputMessage || 'Documento enviado para análise') : inputMessage),
      timestamp: new Date(),
      imageData,
      file: uploadedFile ? {
        name: uploadedFile.name,
        type: uploadedFile.type,
        url: URL.createObjectURL(uploadedFile)
      } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentFile = uploadedFile;
    const currentMessage = inputMessage;
    setInputMessage('');
    setUploadedFile(null);
    setIsLoading(true);

    try {
      let contextMessage = '';
      
      if (video) {
        contextMessage = `Contexto: O usuário está assistindo à videoaula "${video.title}"${video.area ? ` da área de ${video.area}` : ''}${video.channelTitle ? ` do canal ${video.channelTitle}` : ''}.`;
      } else if (livro) {
        contextMessage = `Contexto: O usuário está lendo o livro "${livro.livro}"${livro.area ? ` da área de ${livro.area}` : ''}${livro.autor ? ` do autor ${livro.autor}` : ''}.`;
      } else {
        contextMessage = `Contexto: O usuário está estudando${area ? ` na área de ${area}` : ' Direito'}.`;
      }

      let messageToSend = currentMessage || inputMessage || '';
      let fileDataToSend = null;

      if (imageData) {
        messageToSend = `${contextMessage}

Como Professora IA especializada em Direito, analise a imagem anexada e explique de forma didática, clara e amigável o conteúdo mostrado. Se for parte de um livro ou documento jurídico, contextualize com a obra que o usuário está estudando.

Foque especificamente na área selecionada da imagem e forneça uma explicação detalhada dos conceitos apresentados.`;

        // Convert data URL to base64 without prefix
        const base64Data = imageData.split(',')[1];
        fileDataToSend = {
          data: base64Data,
          mimeType: 'image/png',
          name: 'screenshot.png'
        };
      } else if (currentFile) {
        // Handle PDF/document upload with auto-analysis
        if (autoAnalyze || !currentMessage) {
          messageToSend = `${contextMessage}

Como Professora IA especializada em Direito, analise o documento anexado automaticamente e forneça:

1. **Resumo do conteúdo**: O que o documento aborda
2. **Conceitos jurídicos identificados**: Principais temas jurídicos
3. **Legislação aplicável**: Leis e normas relacionadas
4. **Pontos importantes**: Destaques para estudo
5. **Conexões**: Como se relaciona com outras matérias

Após a análise, pergunte ao usuário o que ele gostaria de saber mais sobre o documento e adicione: ANALYSIS_COMPLETE:SHOW_OPTIONS`;
        } else {
          messageToSend = `${contextMessage}

Como Professora IA especializada em Direito, considerando o documento anexado, responda a seguinte pergunta de forma didática e clara:

${currentMessage}`;
        }

        // Convert file to base64
        const fileBuffer = await currentFile.arrayBuffer();
        const base64String = btoa(
          new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        fileDataToSend = {
          data: base64String,
          mimeType: currentFile.type,
          name: currentFile.name
        };
      } else {
        messageToSend = `${contextMessage}
          
Como Professora IA especializada em Direito, responda em formato MARKDOWN de forma didática, clara e amigável. Use formatação markdown para destacar conceitos importantes, criar listas quando apropriado, e organizar o conteúdo de forma visual. Use exemplos práticos quando possível e conecte com o conteúdo específico que o usuário está estudando.

Pergunta do usuário: ${currentMessage || inputMessage || ''}`;
      }

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: messageToSend,
          fileData: fileDataToSend,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.type === 'user' ? 'user' : 'model',
            content: String(m.content || '')
          }))
        }
      });

      if (error) throw error;

      // Check if response includes analysis options trigger
      const responseContent = typeof data.response === 'string' 
        ? data.response 
        : (data.content || 'Desculpe, não consegui processar sua solicitação.');
      
      const showOptions = responseContent.includes('ANALYSIS_COMPLETE:SHOW_OPTIONS');
      const cleanContent = responseContent.replace('ANALYSIS_COMPLETE:SHOW_OPTIONS', '').trim();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
        showAnalysisOptions: showOptions,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Desculpe, houve um erro temporário na API. A professora IA está funcionando normalmente. Tente novamente em alguns segundos.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainImageSelected = (imageData: string) => {
    sendMessage(imageData);
    setShowExplainModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, envie apenas arquivos PDF",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, envie arquivos de até 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      setTimeout(() => {
        sendMessage(undefined, true);
      }, 100);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, envie apenas imagens (JPG, PNG)",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, envie arquivos de até 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      setTimeout(() => {
        sendMessage(undefined, true);
      }, 100);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const handleAnalysisOption = async (option: string, lastMessage: Message) => {
    let prompt = '';
    
    switch (option) {
      case 'detailed':
        prompt = 'Faça uma análise detalhada e completa deste documento, incluindo todos os aspectos jurídicos relevantes.';
        break;
      case 'problems':
        prompt = 'Identifique possíveis problemas, inconsistências ou pontos de atenção neste documento.';
        break;
      case 'summary':
        prompt = 'Faça um resumo executivo deste documento destacando os pontos principais.';
        break;
      case 'legal':
        prompt = 'Analise os aspectos legais deste documento e cite a legislação aplicável.';
        break;
      default:
        prompt = option;
    }
    
    setInputMessage(prompt);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const showExplainButton = livro || area === 'Biblioteca Jurídica';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={`fixed z-50 ${isMobile ? 'inset-0' : 'bottom-4 right-4 w-96 h-[600px]'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Chat Container - Red Theme with Premium Design */}
          <motion.div 
            className="fixed inset-0 bg-gradient-to-br from-red-950 via-red-900 to-black shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {/* Header - Red Theme */}
            <div className="bg-red-950/95 backdrop-blur-sm p-4 flex items-center justify-between border-b border-red-800/50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-red-400/30">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Professora de Direito</h3>
                  <p className="text-red-100 text-sm">IA Online agora {area ? `• ${area}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showExplainButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExplainModal(true)}
                    className="text-red-100 hover:text-white hover:bg-red-800/50 rounded-full p-2 transition-colors"
                    title="Explicar esta parte"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-red-100 hover:text-white hover:bg-red-800/50 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area with Enhanced Auto-scroll */}
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4 pb-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div
                          className={`max-w-[90%] p-4 rounded-2xl break-words shadow-lg ${
                            message.type === 'user'
                              ? 'bg-red-600 text-white rounded-br-md shadow-red-500/20'
                              : 'bg-red-950/80 text-red-50 rounded-bl-md border border-red-800/50 backdrop-blur-sm'
                          }`}
                        >
                          {message.imageData && (
                            <div className="mb-2">
                              <img 
                                src={message.imageData} 
                                alt="Imagem enviada" 
                                className="max-w-32 h-auto rounded border"
                              />
                            </div>
                          )}
                          {message.file && (
                            <div className="mb-2 flex items-center gap-2 p-2 bg-red-800/30 rounded border border-red-700/50">
                              {message.file.type.includes('pdf') ? 
                                <FileText className="h-4 w-4 text-red-300" /> : 
                                <ImageIcon className="h-4 w-4 text-red-300" />
                              }
                              <span className="text-xs text-red-100">{message.file.name}</span>
                            </div>
                          )}
                          <div className="space-y-2">
                            {message.type === 'assistant' && message.content ? (
                              <MarkdownRenderer content={String(message.content || '')} />
                            ) : (
                              <p className="text-sm whitespace-pre-line">{String(message.content || '')}</p>
                            )}
                          </div>
                          <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-red-200' : 'text-red-300'}`}>
                            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div 
                      className="flex justify-start mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="max-w-[80%] p-4 rounded-2xl bg-red-950/80 text-red-50 rounded-bl-md border border-red-800/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin text-red-400" />
                          <span className="text-sm">Professora IA está pensando...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area - Red Theme with Enhanced UX */}
            <div className="p-4 bg-red-950/95 backdrop-blur-sm border-t border-red-800/50 shrink-0">
              {/* Upload File Preview */}
              {uploadedFile && (
                <motion.div 
                  className="mb-3 p-3 bg-red-900/50 rounded-xl border border-red-700/50 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {uploadedFile.type.includes('pdf') ? 
                        <FileText className="h-4 w-4 text-red-400" /> : 
                        <ImageIcon className="h-4 w-4 text-red-300" />
                      }
                      <span className="text-red-50 text-sm font-medium">{uploadedFile.name}</span>
                      <span className="text-red-200 text-xs bg-red-800/50 px-2 py-1 rounded-full">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeUploadedFile}
                      className="text-red-300 hover:text-red-100 hover:bg-red-800/50 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Enhanced Analysis Buttons - Red Theme */}
              <div className="mb-4 flex gap-3">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-red-900/50 backdrop-blur-sm border border-red-700/50 text-red-50 hover:bg-red-800/50 transition-all duration-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Anexar PDF</span>
                </motion.button>
                <motion.button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 bg-red-900/50 backdrop-blur-sm border border-red-700/50 text-red-50 hover:bg-red-800/50 transition-all duration-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImageIcon className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Anexar Imagem</span>
                </motion.button>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua dúvida jurídica ou anexe um documento..."
                    className="bg-red-900/50 border-red-700/50 text-red-50 placeholder:text-red-200 rounded-2xl h-12 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 backdrop-blur-sm"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isLoading}
                  />
                </div>
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={(!inputMessage.trim() && !uploadedFile) || isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 rounded-2xl w-12 h-12 p-0 flex items-center justify-center shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              
              {/* Hidden File Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept=".jpg,.jpeg,.png"
                className="hidden"
              />
              
              <div className="flex items-center gap-2 text-xs text-red-200/80 mt-2">
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  Anexar
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Explicar
                </span>
              </div>
            </div>

            <ExplainThisPartModal
              isOpen={showExplainModal}
              onClose={() => setShowExplainModal(false)}
              onImageSelected={handleExplainImageSelected}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfessoraIA;