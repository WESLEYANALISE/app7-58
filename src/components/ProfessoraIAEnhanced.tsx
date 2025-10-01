import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, Paperclip, Download, Copy, Sparkles, 
  FileText, HelpCircle, BookOpen, Scale, Loader2,
  X, Image as ImageIcon, Check, Camera, FileUp, Zap, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '@/utils/clipboardUtils';
import { useProfessoraAIPDFExport } from '@/hooks/useProfessoraAIPDFExport';
import { Card, CardContent } from '@/components/ui/card';

interface Flashcard {
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface Questao {
  enunciado: string;
  alternativas: string[];
  resposta_correta: string;
  explicacao: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  file?: { name: string; type: string };
  suggestions?: string[];
  flashcards?: Flashcard[];
  questoes?: Questao[];
  area?: string;
}

interface ProfessoraIAEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  bookContext?: any;
  area?: string;
  initialMessage?: string;
}

export const ProfessoraIAEnhanced: React.FC<ProfessoraIAEnhancedProps> = ({
  isOpen,
  onClose,
  bookContext,
  area,
  initialMessage
}) => {
  const areaLabel = typeof area === 'string' ? area : (area ? String(area) : '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [viewingFlashcards, setViewingFlashcards] = useState<Flashcard[] | null>(null);
  const [viewingQuestoes, setViewingQuestoes] = useState<Questao[] | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [currentQuestaoIndex, setCurrentQuestaoIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showQuestaoExplanation, setShowQuestaoExplanation] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  
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
        content: initialMessage || `🎓 Olá! Sou sua **Professora de Direito IA Premium**!

${bookContext && typeof bookContext === 'object' && bookContext?.livro ? `📚 Estou aqui para ajudar com o livro **"${bookContext.livro}"**` : ''}
${areaLabel ? `📖 Especializada em **${areaLabel}**` : ''}

**Posso te ajudar de várias formas:**

📄 Analisar documentos (PDFs com imagens, textos jurídicos)
💡 Explicar conceitos de forma detalhada e prática  
📝 Gerar flashcards personalizados para estudos
❓ Criar questões objetivas e discursivas
📋 Resumir artigos e documentos complexos
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
        if (currentFile.type.startsWith('image/')) {
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
            conversationHistory: messages.slice(-20).map(m => ({
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

      // Detectar mudança de contexto/área se arquivo foi enviado
      let detectedArea = areaLabel;
      if (currentFile && assistantContent) {
        const areasJuridicas = [
          'Direito Penal', 'Direito Civil', 'Direito Constitucional',
          'Direito Administrativo', 'Direito Tributário', 'Direito do Trabalho',
          'Direito Empresarial', 'Direito Processual', 'Direito Eleitoral'
        ];
        
        for (const areaName of areasJuridicas) {
          if (assistantContent.toLowerCase().includes(areaName.toLowerCase())) {
            detectedArea = areaName;
            break;
          }
        }
      }

      // Flush final
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = assistantContent;
          lastMessage.area = detectedArea;
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

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "Tamanho máximo: 20MB",
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

  // Upload de imagem (com suporte a HEIC)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast({
        title: "Imagem muito grande",
        description: "Tamanho máximo: 20MB",
        variant: "destructive"
      });
      return;
    }

    // Converter HEIC para JPG
    if (/heic|heif/i.test(file.type) || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      toast({
        title: "Convertendo HEIC...",
        description: "Aguarde, convertendo imagem para JPG",
      });

      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        }) as Blob;

        const convertedFile = new File(
          [convertedBlob], 
          file.name.replace(/\.heic$/i, '.jpg'),
          { type: 'image/jpeg' }
        );

        setUploadedFile(convertedFile);
        toast({
          title: "Imagem convertida",
          description: `${convertedFile.name} pronta para envio`,
        });
      } catch (error) {
        console.error('Erro ao converter HEIC:', error);
        toast({
          title: "Erro na conversão",
          description: "Não foi possível converter a imagem. Tire outra foto em JPG/PNG.",
          variant: "destructive"
        });
      }
      return;
    }

    setUploadedFile(file);
    toast({
      title: "Imagem carregada",
      description: `${file.name} será comprimida automaticamente`,
    });
  };

  // Limpar conversa
  const clearConversation = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Olá! Sou a Professora Evelyn, sua assistente de Direito. 🎓
${areaLabel ? `📖 Especializada em **${areaLabel}**` : ''}

**Posso te ajudar de várias formas:**

📄 Analisar documentos (PDFs com imagens, textos jurídicos)
💡 Explicar conceitos de forma detalhada e prática  
📝 Gerar flashcards personalizados para estudos
❓ Criar questões objetivas e discursivas
📋 Resumir artigos e documentos complexos
📤 Exportar conversas em PDF

Como posso te ajudar hoje? 🚀`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setShowQuickActions(true);
    setUploadedFile(null);
    toast({
      title: "Conversa limpa",
      description: "Histórico de mensagens foi removido.",
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
        
        // Adicionar flashcards à última mensagem do assistente
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.flashcards = parsed.flashcards;
          }
          return newMessages;
        });

        toast({
          title: "✨ Flashcards Gerados!",
          description: `${parsed.flashcards.length} flashcards criados. Role para baixo para visualizar.`,
        });
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
        
        // Adicionar questões à última mensagem do assistente
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.questoes = parsed.questoes;
          }
          return newMessages;
        });

        toast({
          title: "✨ Questões Geradas!",
          description: `${parsed.questoes.length} questões criadas. Role para baixo para responder.`,
        });
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
      className="mt-4 p-3 md:p-4 bg-red-900/20 rounded-xl border border-red-800/30"
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

  // Visualizar flashcards
  const FlashcardViewer = ({ flashcards }: { flashcards: Flashcard[] }) => (
    <Card className="mt-4 bg-red-900/20 border-red-800/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-100">
            Flashcard {currentFlashcardIndex + 1} de {flashcards.length}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentFlashcardIndex(0);
              setIsFlashcardFlipped(false);
            }}
            className="text-red-300 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <motion.div
          className="relative min-h-[200px] cursor-pointer preserve-3d"
          onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
          animate={{ rotateY: isFlashcardFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`absolute inset-0 backface-hidden ${!isFlashcardFlipped ? '' : 'opacity-0'}`}>
            <div className="bg-red-800/30 border border-red-700/50 rounded-xl p-6 h-full flex flex-col justify-center">
              <p className="text-sm text-red-300 mb-2">Pergunta:</p>
              <p className="text-lg text-white">{flashcards[currentFlashcardIndex].pergunta}</p>
            </div>
          </div>
          <div className={`absolute inset-0 backface-hidden ${isFlashcardFlipped ? 'rotate-y-180' : 'opacity-0'}`}>
            <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-6 h-full flex flex-col justify-center">
              <p className="text-sm text-green-300 mb-2">Resposta:</p>
              <p className="text-base text-white mb-3">{flashcards[currentFlashcardIndex].resposta}</p>
              {flashcards[currentFlashcardIndex].exemplo && (
                <>
                  <p className="text-sm text-green-300 mb-2">Exemplo:</p>
                  <p className="text-sm text-white/80">{flashcards[currentFlashcardIndex].exemplo}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex justify-between mt-4">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentFlashcardIndex > 0) {
                setCurrentFlashcardIndex(prev => prev - 1);
                setIsFlashcardFlipped(false);
              }
            }}
            disabled={currentFlashcardIndex === 0}
            className="text-red-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (currentFlashcardIndex < flashcards.length - 1) {
                setCurrentFlashcardIndex(prev => prev + 1);
                setIsFlashcardFlipped(false);
              }
            }}
            disabled={currentFlashcardIndex === flashcards.length - 1}
            className="text-red-300 hover:text-white"
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Visualizar questões
  const QuestaoViewer = ({ questoes }: { questoes: Questao[] }) => {
    const questao = questoes[currentQuestaoIndex];
    
    return (
      <Card className="mt-4 bg-red-900/20 border-red-800/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-100">
              Questão {currentQuestaoIndex + 1} de {questoes.length}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentQuestaoIndex(0);
                setSelectedAnswer(null);
                setShowQuestaoExplanation(false);
              }}
              className="text-red-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-white mb-4">{questao.enunciado}</p>
            <div className="space-y-2">
              {questao.alternativas.map((alt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedAnswer(alt[0]);
                    setShowQuestaoExplanation(true);
                  }}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAnswer === null
                      ? 'border-red-700/50 bg-red-900/20 hover:bg-red-900/40 text-white'
                      : selectedAnswer === alt[0] && alt[0] === questao.resposta_correta
                      ? 'border-green-500 bg-green-900/30 text-green-100'
                      : selectedAnswer === alt[0]
                      ? 'border-red-500 bg-red-900/40 text-red-100'
                      : alt[0] === questao.resposta_correta
                      ? 'border-green-500 bg-green-900/20 text-green-100'
                      : 'border-red-700/30 bg-red-900/10 text-white/70'
                  }`}
                >
                  {alt}
                </button>
              ))}
            </div>
          </div>

          {showQuestaoExplanation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg"
            >
              <p className="text-sm text-blue-300 mb-2">Explicação:</p>
              <p className="text-sm text-white">{questao.explicacao}</p>
            </motion.div>
          )}

          <div className="flex justify-between mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (currentQuestaoIndex > 0) {
                  setCurrentQuestaoIndex(prev => prev - 1);
                  setSelectedAnswer(null);
                  setShowQuestaoExplanation(false);
                }
              }}
              disabled={currentQuestaoIndex === 0}
              className="text-red-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (currentQuestaoIndex < questoes.length - 1) {
                  setCurrentQuestaoIndex(prev => prev + 1);
                  setSelectedAnswer(null);
                  setShowQuestaoExplanation(false);
                }
              }}
              disabled={currentQuestaoIndex === questoes.length - 1}
              className="text-red-300 hover:text-white"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  // Contar quantas mensagens da assistente existem
  const assistantMessageCount = messages.filter(m => m.role === 'assistant').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-red-950 via-red-900 to-black flex flex-col"
        >
          {/* Header - mais compacto no mobile */}
          <div className="p-3 md:p-4 border-b border-red-800 shrink-0 bg-red-950/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-red-200 hover:text-white hover:bg-red-800/50 h-8 w-8 md:h-10 md:w-10"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                <div>
                  <h2 className="text-base md:text-xl font-bold text-white">Professora Evelyn</h2>
                  <p className="text-xs md:text-sm text-red-200">Assistente IA de Direito{areaLabel ? ` • ${areaLabel}` : ''}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="text-red-200 hover:text-white hover:bg-red-800/50 gap-1 md:gap-2 text-xs md:text-sm"
              >
                <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Messages - WhatsApp style */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 md:p-4">
            <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[85%] rounded-lg px-3 py-2 md:px-4 md:py-3 ${
                        message.role === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-950/80 text-red-50 border border-red-800/50'
                      }`}
                      style={{ 
                        fontSize: '15px', 
                        lineHeight: '1.4'
                      }}
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

                      {/* Flashcards gerados */}
                      {message.flashcards && message.flashcards.length > 0 && (
                        <FlashcardViewer flashcards={message.flashcards} />
                      )}

                      {/* Questões geradas */}
                      {message.questoes && message.questoes.length > 0 && (
                        <QuestaoViewer questoes={message.questoes} />
                      )}

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
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await exportConversationToPDF(
                                [message],
                                `Resposta - ${bookContext?.livro || areaLabel || 'Professora IA'}`
                              );
                            }}
                            disabled={exporting}
                            className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Exportar PDF
                          </Button>
                          
                          {/* Ações rápidas aparecem apenas a partir da segunda mensagem da assistente */}
                          {assistantMessageCount >= 2 && message.content.length > 200 && !message.flashcards && !message.questoes && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateFlashcards(message.content)}
                                disabled={isLoading}
                                className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                Gerar Flashcards
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateQuestions(message.content)}
                                disabled={isLoading}
                                className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                              >
                                <HelpCircle className="w-3 h-3 mr-1" />
                                Gerar Questões
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendMessage(`Resuma mais este conteúdo:\n\n${message.content.substring(0, 500)}`)}
                                disabled={isLoading}
                                className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Resumir mais
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendMessage(`Explique com mais detalhes e exemplos práticos:\n\n${message.content.substring(0, 500)}`)}
                                disabled={isLoading}
                                className="text-xs text-red-200 hover:text-white hover:bg-red-800/30"
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                Explicar mais
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
            </div>
          </ScrollArea>

          {/* Input Area - Botões acima do textarea */}
          <div className="p-4 border-t border-red-800 shrink-0 bg-red-950/50 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto space-y-3">
              {uploadedFile && (
                <div className="flex items-center gap-2 bg-red-900/30 p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-red-300" />
                  <span className="text-sm text-red-100 flex-1">{uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    className="text-red-300 hover:text-white hover:bg-red-800/50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Botões de anexo - ACIMA do textarea */}
              <div className="flex gap-3">
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
                  variant="outline"
                  size="lg"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-1 bg-red-900/30 border-red-700 hover:bg-red-800/50 text-white h-14 flex items-center justify-center gap-3"
                >
                  <FileUp className="w-5 h-5" />
                  <span className="font-medium">Documento</span>
                </Button>
                
                <div className="flex-1 relative">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowImageMenu(!showImageMenu)}
                    disabled={isLoading}
                    className="w-full bg-red-900/30 border-red-700 hover:bg-red-800/50 text-white h-14 flex items-center justify-center gap-3"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="font-medium">Imagem</span>
                  </Button>
                  
                  {showImageMenu && (
                    <div className="absolute bottom-16 left-0 right-0 bg-red-900/95 backdrop-blur-sm border border-red-700 rounded-lg shadow-xl overflow-hidden">
                      <button
                        onClick={() => {
                          imageInputRef.current?.click();
                          setShowImageMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-red-800/50 transition-colors flex items-center gap-3"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Câmera</span>
                      </button>
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handleImageUpload(e as any);
                          input.click();
                          setShowImageMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-red-800/50 transition-colors flex items-center gap-3 border-t border-red-800"
                      >
                        <FileUp className="w-4 h-4" />
                        <span>Enviar Imagem</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Textarea + Botão de enviar */}
              <div className="flex gap-2 items-end">
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
                  className="flex-1 min-h-[60px] max-h-[120px] bg-red-900/30 border-red-800 text-white placeholder:text-red-300/60 resize-none text-base"
                  disabled={isLoading}
                />
                
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || (!input.trim() && !uploadedFile)}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg px-6 h-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-red-300/70 text-center">
                {messages.length - 1} mensagens • Contexto inteligente com histórico completo
              </p>
            </div>
          </div>

          <style>{`
            .preserve-3d {
              transform-style: preserve-3d;
            }
            .backface-hidden {
              backface-visibility: hidden;
            }
            .rotate-y-180 {
              transform: rotateY(180deg);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
