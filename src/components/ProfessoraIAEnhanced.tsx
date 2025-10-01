import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Upload, Mic, Brain, FileText, Image, Camera, Sparkles, BookOpen, Scale, Eye, Lightbulb, MessageCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageData?: string;
  file?: {
    name: string;
    type: string;
    url: string;
  };
  suggestions?: string[];
}

interface ProfessoraIAEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  bookContext?: {
    titulo: string;
    autor?: string;
    area: string;
    sobre?: string;
  };
}

export const ProfessoraIAEnhanced = ({ isOpen, onClose, bookContext }: ProfessoraIAEnhancedProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [canCaptureScreen, setCanCaptureScreen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isMobile, isTablet } = useDeviceDetection();

  // Detectar se está em iframe e funcionalidades disponíveis
  useEffect(() => {
    const checkEnvironment = () => {
      setIsInIframe(window !== window.top);
      setCanCaptureScreen('getDisplayMedia' in navigator.mediaDevices || isMobile);
    };
    
    checkEnvironment();
  }, [isMobile]);

  useEffect(() => {
    if (isOpen && bookContext) {
      // Mensagem inicial com contexto do livro
      const suggestions = [
        "Explique o conceito principal deste capítulo",
        "Dê exemplos práticos sobre este tema",
        "Como isso se aplica na OAB?",
        "Quais são os pontos mais importantes?",
        "Tire uma dúvida específica"
      ];

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎓 **Olá! Sou sua Professora de Direito IA!**

📚 Vejo que você está estudando **"${bookContext.titulo}"**${bookContext.autor ? ` de **${bookContext.autor}**` : ''} na área de **${bookContext.area}**.

## 🚀 Como posso te ajudar hoje?

### 🔥 **Funcionalidades Premium:**
- 📖 **Análise Completa**: Explico qualquer conceito do livro
- 🔍 **Análise de Documentos**: ${canCaptureScreen ? 'Tire prints ou envie' : 'Envie'} PDFs/imagens
- ⚖️ **Casos Práticos**: Relaciono teoria com jurisprudência real
- 📝 **Preparação OAB**: Exercícios e simulações
- 🧠 **Mapas Mentais**: Organizo conceitos visualmente
- ⚡ **Respostas Instantâneas**: IA de última geração

${isInIframe ? '📱 **Modo Mobile Otimizado**: Interface adaptada para estudo mobile' : ''}
${canCaptureScreen ? '📸 **Captura de Tela**: Tire prints para análise instantânea' : ''}

💡 **Dica Pro**: Seja específico nas suas perguntas para respostas mais precisas!`,
        timestamp: new Date(),
        suggestions
      };
      setMessages([welcomeMessage]);
    } else if (isOpen) {
      // Mensagem inicial sem contexto específico
      const suggestions = [
        "Tire uma dúvida sobre Direito Civil",
        "Explique conceitos de Direito Penal", 
        "Dúvidas sobre OAB e concursos",
        "Analise este documento",
        "Exemplos práticos jurídicos"
      ];

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎓 **Professora de Direito IA - Versão Premium**

## 🔥 **Sua assistente jurídica mais avançada!**

### ⚡ **Recursos Ultra-Modernos:**

🧠 **IA Gemini Avançada**
- Análise jurídica em tempo real
- Respostas contextualizadas e precisas
- Memória conversacional inteligente

📄 **Análise Completa de Documentos**
- ${canCaptureScreen ? '📸 Screenshots instantâneos' : '📁 Upload de arquivos'}
- PDFs, imagens, contratos, petições
- OCR avançado para texto manuscrito

⚖️ **Especialidades Jurídicas**
- 📚 Todas as áreas do Direito brasileiro
- 🏛️ Jurisprudência atualizada
- 📖 Doutrina e legislação vigente

🎯 **Preparação para Carreira**
- 👨‍💼 OAB (1ª e 2ª fase)
- 🏛️ Concursos públicos
- 📝 Prática profissional

${isInIframe ? '\n🌟 **Interface Mobile Premium**: Otimizada para seu dispositivo!' : ''}

**Como posso revolucionar seus estudos hoje?** 🚀`,
        timestamp: new Date(),
        suggestions
      };
      setMessages([welcomeMessage]);
    }
    setShowSuggestions(true);
  }, [isOpen, bookContext, canCaptureScreen, isInIframe]);

  useEffect(() => {
    if (messages.length > 0) {
      // Scroll mais rápido e responsivo
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 50); // Reduzido de 100ms para 50ms
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Captura de tela (mobile/iframe otimizado)
  const captureScreen = useCallback(async () => {
    try {
      if (isMobile || isInIframe) {
        // Solicitar ao usuário que tire screenshot manualmente
        toast({
          title: "📸 Tire um screenshot",
          description: "Use seu dispositivo para tirar uma captura de tela e envie como imagem",
          duration: 4000,
        });
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');
        sendMessage('Analise esta captura de tela:', undefined, imageData);
        
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Erro ao capturar tela:', error);
      toast({
        title: "Erro na captura",
        description: "Tente enviar uma imagem manualmente",
        variant: "destructive",
      });
    }
  }, [isMobile, isInIframe]);

  const sendMessage = async (content?: string, files?: File[], imageData?: string) => {
    const message = content || inputMessage;
    if (!message.trim() && !files?.length && !imageData) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message || 'Documento/imagem enviada',
      timestamp: new Date(),
      imageData,
      file: files?.length ? {
        name: files[0].name,
        type: files[0].type,
        url: URL.createObjectURL(files[0])
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      let prompt = message;
      let fileDataToSend = null;
      
      // Contexto mais rico baseado no livro
      if (bookContext) {
        const livreTitulo = typeof bookContext.titulo === 'string' ? bookContext.titulo : 'livro';
        const livroAutor = typeof bookContext.autor === 'string' ? bookContext.autor : '';
        const livroArea = typeof bookContext.area === 'string' ? bookContext.area : '';
        const livroSobre = typeof bookContext.sobre === 'string' ? bookContext.sobre : '';
        
        prompt = `**CONTEXTO ACADÊMICO ESPECÍFICO:**
📚 **Livro em estudo:** "${livreTitulo}"${livroAutor ? ` - ${livroAutor}` : ''}
🎯 **Área jurídica:** ${livroArea}${livroSobre ? `\n📖 **Sobre a obra:** ${livroSobre}` : ''}

**INSTRUÇÃO PEDAGÓGICA AVANÇADA:**
Como Professora de Direito IA especializada e com conhecimento profundo da obra "${livreTitulo}", responda de forma:

1. **📚 CONTEXTUALIZADA**: Relacione diretamente com conceitos específicos do livro
2. **🎯 DIDÁTICA**: Use linguagem clara e exemplos práticos
3. **⚖️ JURISPRUDENCIAL**: Inclua precedentes e casos reais quando relevante  
4. **🔍 DETALHADA**: Forneça explicações completas e precisas
5. **💡 APLICADA**: Mostre aplicação prática no mundo jurídico
6. **📖 BIBLIOGRÁFICA**: Referencie capítulos/seções relevantes do livro quando possível

**Pergunta/Solicitação do estudante:** ${message}

**Responda em formato MARKDOWN rico, use formatação visual (negrito, listas, títulos) para facilitar o aprendizado.**`;
      } else {
        prompt = `**CONTEXTO:** Estudante de Direito solicitando assistência jurídica avançada.

**INSTRUÇÃO PARA IA JURÍDICA ESPECIALIZADA:**
Como Professora de Direito IA com expertise em todas as áreas jurídicas brasileiras, responda de forma:

1. **🎯 PRECISA**: Informações juridicamente corretas e atualizadas
2. **📚 DIDÁTICA**: Linguagem acessível mas tecnicamente precisa
3. **⚖️ FUNDAMENTADA**: Base legal, doutrinária e jurisprudencial
4. **💡 PRÁTICA**: Exemplos reais e aplicação no mundo jurídico
5. **🔍 COMPLETA**: Aborde todos os aspectos relevantes da questão
6. **📖 ORGANIZADA**: Use estrutura clara e visual

**Pergunta/Solicitação:** ${message}

**Use formatação MARKDOWN rica (títulos, listas, negrito, itálico) para maximizar a clareza pedagógica.**`;
      }

      // Processar arquivos ou imagens
      if (files?.length) {
        const file = files[0];
        
        try {
          const fileBuffer = await file.arrayBuffer();
          const base64String = btoa(
            new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          fileDataToSend = {
            data: base64String,
            mimeType: file.type,
            name: file.name
          };
          
          prompt += `\n\n**ANÁLISE DE DOCUMENTO SOLICITADA:**
📄 **Arquivo enviado:** "${file.name}" (${file.type})
🔍 **Tarefa:** Análise jurídica completa e detalhada do documento
📚 **Abordagem:** ${bookContext ? 'Relacione com o contexto do livro estudado quando aplicável' : 'Análise jurídica geral abrangente'}

**INSTRUÇÕES PARA ANÁLISE:**
1. Identifique o tipo e natureza do documento
2. Analise aspectos jurídicos relevantes
3. Destaque pontos importantes para estudo
4. Sugira legislação aplicável
5. Forneça insights práticos e pedagógicos`;
        } catch (fileError) {
          console.error('Erro ao processar arquivo:', fileError);
          throw new Error('Erro ao processar o arquivo enviado.');
        }
      } else if (imageData) {
        const base64Data = imageData.split(',')[1];
        fileDataToSend = {
          data: base64Data,
          mimeType: 'image/png',
          name: 'captura_tela.png'
        };
        
        prompt += `\n\n**ANÁLISE DE IMAGEM SOLICITADA:**
📸 **Imagem enviada:** Captura de tela ou documento visual
🔍 **Tarefa:** Análise detalhada do conteúdo visual
📚 **Foco:** ${bookContext ? 'Relacionar com o contexto do livro em estudo' : 'Análise jurídica educativa'}

**INSTRUÇÕES PARA ANÁLISE VISUAL:**
1. Descreva o que vê na imagem
2. Identifique conceitos jurídicos presentes
3. Explique termos técnicos encontrados
4. Forneça contexto jurídico relevante
5. Dê dicas de estudo baseadas no conteúdo`;
      }

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          fileData: fileDataToSend,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content
          }))
        }
      });

      if (error) throw error;

      // Gerar sugestões inteligentes baseadas na resposta
      const generateSuggestions = (responseContent: string, hasContext: boolean) => {
        const suggestions = [];
        
        if (hasContext && bookContext) {
          suggestions.push(
            `Explique mais sobre ${bookContext.area}`,
            "Dê exemplos práticos deste conceito",
            "Como isso cai na OAB?",
            "Cite jurisprudência relevante"
          );
        } else {
          if (responseContent.toLowerCase().includes('civil')) {
            suggestions.push("Dúvidas sobre Direito Civil", "Contratos e obrigações");
          }
          if (responseContent.toLowerCase().includes('penal')) {
            suggestions.push("Questões de Direito Penal", "Tipos penais");
          }
          if (responseContent.toLowerCase().includes('constitucional')) {
            suggestions.push("Direitos fundamentais", "Controle de constitucionalidade");
          }
          suggestions.push("Analise outro documento", "Tire mais dúvidas");
        }
        
        return suggestions.slice(0, 4);
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
        suggestions: generateSuggestions(data.response || '', !!bookContext)
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowSuggestions(true);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, houve um erro temporário na API. A professora IA está funcionando normalmente. Tente novamente em alguns segundos.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro temporário na API",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      sendMessage(suggestion);
    }, 100);
  }, []);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') || 
      file.type === 'application/pdf' ||
      file.size <= 20 * 1024 * 1024 // 20MB - aumentado para documentos maiores
    );

    if (validFiles.length > 0) {
      const fileType = validFiles[0].type.startsWith('image/') ? 'imagem' : 'documento';
      sendMessage(`Análise de ${fileType} solicitada`, validFiles);
    } else {
      toast({
        title: "📁 Arquivo inválido",
        description: "Envie imagens (JPG, PNG) ou PDFs de até 20MB",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-gradient-to-br from-background to-background/95">
        <DialogHeader className="border-b border-red-800/30 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg ring-2 ring-red-400/30 animate-pulse">
              👩‍🏫
            </div>
            <div className="flex flex-col">
              <span className="text-red-50">Professora de Direito IA</span>
              {bookContext && (
                <span className="text-sm font-normal text-red-200 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {bookContext.titulo}
                </span>
              )}
              <span className="text-xs text-red-300 flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3" />
                {isInIframe ? 'Modo Mobile' : 'Versão Premium'} • {canCaptureScreen ? 'Captura Ativa' : 'Upload Ativo'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Área de mensagens */}
          <ScrollArea 
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ 
                      opacity: 0, 
                      y: 15, 
                      scale: 0.98 
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1 
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -10, 
                      scale: 0.98 
                    }}
                    transition={{
                      duration: index === 0 ? 0.3 : 0.15,
                      ease: "easeOut",
                      delay: index === 0 ? 0 : 0.05
                    }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`max-w-[80%] shadow-lg ${
                      message.role === 'user' 
                        ? 'bg-red-600 text-white border-red-500/20' 
                        : 'bg-red-950/50 text-red-50 border-red-800/50 backdrop-blur-sm'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                              👩‍🏫
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="prose prose-invert prose-red max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <p className="text-xs opacity-70 mt-3 flex items-center gap-2">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.role === 'assistant' && (
                                <span className="flex items-center gap-1 text-red-300">
                                  <Sparkles className="h-3 w-3" />
                                  IA Premium
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {/* Arquivo anexado */}
                        {message.file && (
                          <div className="mt-3 p-3 bg-red-800/20 rounded-lg border border-red-700/30 flex items-center gap-3">
                            {message.file.type.startsWith('image/') ? (
                              <Image className="h-5 w-5 text-red-300" />
                            ) : (
                              <FileText className="h-5 w-5 text-red-300" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-red-100">{message.file.name}</p>
                              <p className="text-xs text-red-300">Arquivo analisado</p>
                            </div>
                          </div>
                        )}

                        {/* Imagem capturada */}
                        {message.imageData && (
                          <div className="mt-3">
                            <img 
                              src={message.imageData} 
                              alt="Captura analisada" 
                              className="max-w-48 h-auto rounded-lg border border-red-700/50 shadow-lg"
                            />
                          </div>
                        )}

                        {/* Sugestões inteligentes */}
                        {message.role === 'assistant' && message.suggestions && showSuggestions && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs text-red-300 font-semibold flex items-center gap-2">
                              <Lightbulb className="h-3 w-3" />
                              Continue explorando:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="px-3 py-1.5 text-xs bg-red-800/40 hover:bg-red-700/60 text-red-100 rounded-full border border-red-600/30 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex justify-start"
                >
                  <Card className="bg-red-950/50 text-red-50 border-red-800/50 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                          <Brain className="h-4 w-4 text-white animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-center py-12 border-2 border-dashed border-red-500 rounded-lg bg-red-950/20 backdrop-blur-sm"
                >
                  <Upload className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-300 font-semibold">
                    Solte aqui para enviar à professora
                  </p>
                  <p className="text-sm text-red-200 mt-2">
                    Imagens, PDFs ou documentos (máx. 20MB)
                  </p>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Área de input - Interface Premium */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-red-950/40 to-red-900/40 rounded-t-xl border-t border-red-800/50 backdrop-blur-sm">
            {/* Barra de ferramentas */}
            <div className="flex items-center gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="border-red-600/50 text-red-300 hover:bg-red-800/50 hover:text-red-100 transition-all duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                PDF/Imagem
              </Button>
              
              {canCaptureScreen && !isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={captureScreen}
                  disabled={isLoading}
                  className="border-red-600/50 text-red-300 hover:bg-red-800/50 hover:text-red-100 transition-all duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
              )}
              
              {(isMobile || isInIframe) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fileInputRef.current?.click();
                    toast({
                      title: "📱 Modo Mobile",
                      description: "Tire uma foto ou selecione da galeria",
                      duration: 3000,
                    });
                  }}
                  disabled={isLoading}
                  className="border-red-600/50 text-red-300 hover:bg-red-800/50 hover:text-red-100 transition-all duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Foto/Galeria
                </Button>
              )}
            </div>

            {/* Input principal */}
            <div className="flex items-center gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={bookContext ? `Pergunte sobre "${bookContext.titulo}"...` : "Sua dúvida jurídica ou comando..."}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 bg-red-900/30 border-red-700/50 text-red-50 placeholder:text-red-200 focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                disabled={isLoading}
              />
              
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-600/30 transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <Brain className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Dicas contextuais */}
            <div className="flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                <span>IA jurídica premium • Respostas contextualizadas</span>
              </div>
              <div className="flex items-center gap-1 text-red-300">
                <MessageCircle className="h-3 w-3" />
                <span>{messages.length} mensagens</span>
              </div>
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          accept="image/*,application/pdf"
          multiple
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};