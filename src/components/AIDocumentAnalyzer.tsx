import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Image, Upload, Send, Bot, User, X, ArrowLeft, Copy, Download, Share, Search, FileSearch, Eye, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { supabase } from '@/integrations/supabase/client';

// Add dotlottie-wc script to document head
if (typeof window !== 'undefined' && !document.querySelector('script[src*="dotlottie-wc"]')) {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js';
  script.type = 'module';
  document.head.appendChild(script);
}

// Declare the dotlottie-wc web component for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': any;
    }
  }
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  showAnalysisOptions?: boolean;
  file?: {
    name: string;
    type: string;
    url: string;
  };
}

interface AIDocumentAnalyzerProps {
  onBack: () => void;
}

export const AIDocumentAnalyzer = ({ onBack }: AIDocumentAnalyzerProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '👩‍🏫 Olá! Eu sou sua Professora de Direito! 📚\n\nEstou aqui para te ensinar de forma prática e didática:\n\n📖 Explicar conceitos jurídicos com exemplos reais\n📝 Analisar documentos e casos práticos\n⚖️ Preparar você para OAB e concursos\n🎓 Tirar todas as suas dúvidas\n📎 Revisar seus documentos (PDFs e imagens)\n\n💡 Dica: Pode me mandar qualquer dúvida ou documento que vou te explicar tudo passo a passo!\n\nVamos começar? O que você gostaria de aprender hoje? 🚀',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAnalyzingAnimation, setShowAnalyzingAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const copyConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.type === 'user' ? 'Você' : 'Professora'}: ${msg.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(conversationText);
    toast({
      title: "Conversa copiada!",
      description: "O conteúdo foi copiado para a área de transferência",
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Resposta copiada!",
      description: "A resposta foi copiada para a área de transferência",
    });
  };

  const exportToPDF = async () => {
    if (!messages.length) {
      toast({
        title: "Nenhuma conversa encontrada",
        description: "Não há mensagens para exportar.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Gerar PDF localmente usando jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Função para adicionar quebra de página se necessário
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Função para texto com quebra de linha
      const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(fontSize * 0.35);
          pdf.text(line, x, yPosition);
          yPosition += fontSize * 0.35;
        });
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONVERSA COM ASSISTENTE IA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Data
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Exportado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Linha separadora
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Mensagens
      messages.forEach((msg, index) => {
        checkPageBreak(30);
        
        // Timestamp
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const timestamp = msg.timestamp ? msg.timestamp.toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
        pdf.text(timestamp, 20, yPosition);
        yPosition += 8;

        // Tipo de mensagem
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const tipoMsg = msg.type === 'user' ? 'USUÁRIO:' : 'ASSISTENTE:';
        pdf.text(tipoMsg, 20, yPosition);
        yPosition += 8;
        
        // Conteúdo
        pdf.setFont('helvetica', 'normal');
        addWrappedText(msg.content, 20, pageWidth - 40, 11);
        yPosition += 10;
      });

      // Footer em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Direito Premium - Conversa IA - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Exportar PDF
      const nomeArquivo = `conversa-ia-${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfBlob = pdf.output('blob');
      const timestamp = Date.now();
      const filePath = `conversas/${timestamp}-${nomeArquivo}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('conversation-pdfs')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        // Fallback para download local
        pdf.save(nomeArquivo);
        return;
      }

      // Obter URL público
      const { data: urlData } = supabase.storage
        .from('conversation-pdfs')
        .getPublicUrl(filePath);

      // Abrir PDF em nova aba
      if (urlData.publicUrl) {
        window.open(urlData.publicUrl, '_blank');
        toast({
          title: "Conversa exportada!",
          description: "O PDF foi gerado e aberto em uma nova aba."
        });
      } else {
        // Fallback para download local
        pdf.save(nomeArquivo);
        toast({
          title: "PDF exportado localmente",
          description: "O arquivo foi baixado para seu dispositivo."
        });
      }
    } catch (error) {
      console.error('Erro ao exportar conversa:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a conversa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, envie apenas PDFs ou imagens (JPG, PNG)",
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
      toast({
        title: "Arquivo carregado",
        description: `${file.name} está pronto para análise`,
      });
    }
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

    // Set the input and send the message
    setInputMessage(prompt);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !uploadedFile) || isTyping) return;

    setIsUploading(true);
    
    // Show analyzing animation if uploading file
    if (uploadedFile) {
      setShowAnalyzingAnimation(true);
    }
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage || 'Documento enviado para análise',
      timestamp: new Date(),
      file: uploadedFile ? {
        name: uploadedFile.name,
        type: uploadedFile.type,
        url: URL.createObjectURL(uploadedFile)
      } : undefined,
    };

    setMessages(prev => [...prev, newUserMessage]);
    const currentMessage = inputMessage;
    const currentFile = uploadedFile;
    setInputMessage('');
    setUploadedFile(null);
    setIsTyping(true);
    setIsUploading(false);

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      let fileData = null;
      
      if (currentFile) {
        // Convert file to base64
        const fileBuffer = await currentFile.arrayBuffer();
        const base64String = btoa(
          new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        fileData = {
          data: base64String,
          mimeType: currentFile.type,
          name: currentFile.name
        };
      }

      // Call Gemini through Edge Function
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log('Enviando mensagem para Gemini API:', { 
        message: currentMessage,
        hasFile: !!fileData,
        fileName: fileData?.name,
        conversationLength: messages.length
      });
      
      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: currentMessage,
          fileData,
          conversationHistory: messages.slice(-3).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
            fileData: undefined // Don't send previous files to avoid errors
          }))
        }
      });
      
      console.log('Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro ao processar sua solicitação');
      }

      if (!data.success) {
        console.error('AI function returned error:', data.error);
        throw new Error(data.error || 'Erro ao processar sua solicitação');
      }

      const responseContent = data.response || 'Desculpe, não consegui processar sua solicitação.';
      const showOptions = responseContent.includes('ANALYSIS_COMPLETE:SHOW_OPTIONS');
      const cleanContent = responseContent.replace('ANALYSIS_COMPLETE:SHOW_OPTIONS', '').trim();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: cleanContent,
        timestamp: new Date(),
        showAnalysisOptions: showOptions,
      };

      setMessages(prev => [...prev, botMessage]);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Verifique se você tem conexão com a internet e tente novamente.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível conectar com o assistente IA. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setShowAnalyzingAnimation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-semibold">Professora de Direito IA</h1>
                <p className="text-sm opacity-75">Online agora</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-white/10"
                  disabled={messages.length <= 1}
                >
                  <Share className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={copyConversation}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar conversa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Analyzing Animation */}
          {showAnalyzingAnimation && (
            <div className="flex justify-center items-center py-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-4">
                <dotlottie-wc 
                  src="https://lottie.host/9acab870-5fb4-4c6a-8fd7-b37027eb7e9d/dJrMMz3wJd.lottie" 
                  style={{width: '96px', height: '96px'}} 
                  speed="1" 
                  autoplay 
                  loop
                ></dotlottie-wc>
                <div className="text-center text-white">
                  <p className="text-sm font-medium">🔍 Analisando documento...</p>
                  <p className="text-xs opacity-75 mt-1">A professora está examinando seu arquivo</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-white text-gray-900'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  {message.file && (
                    <div className="mb-2 p-2 bg-black/10 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        {message.file.type.includes('pdf') ? 
                          <FileText className="h-4 w-4" /> : 
                          <Image className="h-4 w-4" />
                        }
                        <span className="truncate">{message.file.name}</span>
                      </div>
                    </div>
                  )}
                  
                   <div className="flex items-start justify-between gap-2">
                     <div className="flex-1">
                       <MarkdownRenderer 
                         content={message.content} 
                         className="text-sm whitespace-pre-line" 
                       />
                     </div>
                     {message.type === 'bot' && (
                       <button
                         onClick={() => copyMessage(message.content)}
                         className="flex-shrink-0 p-1 text-white/60 hover:text-white transition-colors"
                         title="Copiar resposta"
                       >
                         <Copy size={14} />
                       </button>
                     )}
                   </div>
                  
                  <p className={`text-xs mt-1 opacity-60 ${
                    message.type === 'user' ? 'text-gray-600' : 'text-white/60'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {/* Analysis Options */}
              {message.showAnalysisOptions && (
                <div className="flex justify-start mt-3">
                  <div className="max-w-xs lg:max-w-md">
                    <p className="text-sm text-white/80 mb-3 px-4">💡 Escolha uma opção de análise:</p>
                    <div className="grid grid-cols-2 gap-2 px-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-auto py-2 px-3"
                        onClick={() => handleAnalysisOption('detailed', message)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Análise Detalhada
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-auto py-2 px-3"
                        onClick={() => handleAnalysisOption('problems', message)}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Identificar Problemas
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-auto py-2 px-3"
                        onClick={() => handleAnalysisOption('summary', message)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Resumo Executivo
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-auto py-2 px-3"
                        onClick={() => handleAnalysisOption('legal', message)}
                      >
                        <FileSearch className="h-3 w-3 mr-1" />
                        Aspectos Legais
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/20 text-white backdrop-blur-sm px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          {uploadedFile && (
            <div className="mb-3 p-3 bg-white/10 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {uploadedFile.type.includes('pdf') ? 
                  <FileText className="h-4 w-4" /> : 
                  <Image className="h-4 w-4" />
                }
                <div className="flex flex-col">
                  <span className="text-sm truncate">{uploadedFile.name}</span>
                  <span className="text-xs opacity-60">
                    {(uploadedFile.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setUploadedFile(null)}
                className="text-white hover:bg-white/10 h-auto p-1"
                disabled={isUploading || isTyping}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {isUploading && (
            <div className="mb-3 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Processando arquivo...</span>
              </div>
            </div>
          )}
          
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
          />

          <div className="flex flex-col gap-3">
            {/* File Upload Buttons */}
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-4 py-2"
                disabled={isUploading || isTyping}
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">Anexar PDF</span>
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-4 py-2"
                disabled={isUploading || isTyping}
              >
                <Image className="h-4 w-4" />
                <span className="text-sm">Anexar Imagem</span>
              </Button>
            </div>

            {/* Message Input */}
            <div className="flex items-end gap-2">
              <div className="flex items-center w-full bg-white/10 border border-white/20 rounded-full px-4">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua dúvida jurídica ou anexe um documento..."
                  className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/60 resize-none flex-1 min-h-[44px] max-h-32 py-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>

              <Button
                type="button"
                onClick={sendMessage}
                disabled={(!inputMessage.trim() && !uploadedFile) || isTyping || isUploading}
                className="bg-white/20 hover:bg-white/30 text-white shrink-0 rounded-full disabled:opacity-50"
                size="icon"
                aria-label="Enviar mensagem"
              >
                {isTyping || isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};