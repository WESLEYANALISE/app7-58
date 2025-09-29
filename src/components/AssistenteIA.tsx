import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Play, ArrowLeft, Copy, Check, ExternalLink, User, Sparkles } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useToast } from '@/components/ui/use-toast';

export const AssistenteIA = () => {
  const { setCurrentFunction } = useNavigation();
  const { toast } = useToast();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  
  const whatsappNumber = "11940432865";

  const prompts = [
    {
      title: "Direitos Trabalhistas",
      prompt: "Olá Evelyn! Tenho dúvidas sobre meus direitos trabalhistas. Posso fazer perguntas sobre horas extras, férias, demissão e direitos do funcionário?",
      icon: "👔"
    },
    {
      title: "Direito Civil",
      prompt: "Oi Evelyn! Preciso esclarecer questões sobre contratos, responsabilidade civil, danos morais e obrigações. Pode me orientar?",
      icon: "📋"
    },
    {
      title: "Direito de Família",
      prompt: "Evelyn, tenho dúvidas sobre divórcio, pensão alimentícia, guarda de filhos e partilha de bens. Pode me ajudar com essas questões?",
      icon: "👨‍👩‍👧‍👦"
    },
    {
      title: "Direito do Consumidor",
      prompt: "Olá Evelyn! Tive problemas com compras, serviços defeituosos, cobrança indevida ou propaganda enganosa. Quais são meus direitos?",
      icon: "🛒"
    },
    {
      title: "Processo Civil",
      prompt: "Evelyn, preciso entender sobre prazos processuais, recursos, execução de sentença e procedimentos judiciais. Pode me explicar?",
      icon: "⚖️"
    },
    {
      title: "Direito Penal",
      prompt: "Oi Evelyn! Tenho dúvidas sobre crimes, procedimentos policiais, direitos do acusado e processo penal. Pode me orientar?",
      icon: "🚔"
    },
    {
      title: "Direito Previdenciário",
      prompt: "Evelyn, preciso entender sobre aposentadoria, auxílio-doença, INSS, BPC e outros benefícios previdenciários. Pode me ajudar?",
      icon: "💰"
    },
    {
      title: "Questões Jurídicas Gerais",
      prompt: "Olá Evelyn! Tenho dúvidas jurídicas gerais e preciso de orientação sobre qual caminho tomar. Pode me dar algumas direções?",
      icon: "💬"
    }
  ];

  const handleCopyPrompt = async (prompt: string, title: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(title);
      toast({
        title: "Prompt copiado!",
        description: "Agora é só enviar no WhatsApp da Evelyn.",
      });
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppRedirect = (prompt?: string) => {
    const message = prompt ? encodeURIComponent(prompt) : "";
    // Using direct WhatsApp URL without API to avoid blocking
    const whatsappUrl = `whatsapp://send?phone=55${whatsappNumber}&text=${message}`;
    // Fallback to web WhatsApp if app is not installed
    const webWhatsappUrl = `https://web.whatsapp.com/send?phone=55${whatsappNumber}&text=${message}`;
    
    // Try to open WhatsApp app first, then fallback to web
    try {
      // First try the app URL
      window.location.href = whatsappUrl;
    } catch (error) {
      // If that fails, try the web version
      window.open(webWhatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header com Evelyn */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent-legal/20">
              <User className="h-6 w-6 sm:h-8 md:h-10 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent-legal bg-clip-text text-transparent">
              Assistente Evelyn
            </h1>
          </div>
          <p className="text-foreground/70 text-sm sm:text-base max-w-2xl mx-auto">
            Sua assistente jurídica especializada no WhatsApp. 
            Análises precisas, respostas inteligentes e suporte 24/7.
          </p>
        </div>

        {/* Botão de voltar */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentFunction(null)}
            className="gap-2 hover:bg-card text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Vídeo de Apresentação */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card to-muted/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <Play className="h-5 w-5" />
              Conheça a Evelyn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video max-w-2xl mx-auto rounded-lg overflow-hidden border border-border">
              <iframe 
                src="https://www.youtube.com/embed/HlE9u1c_MPQ?autoplay=0&controls=1&modestbranding=1" 
                className="w-full h-full" 
                title="Apresentação - Assistente Evelyn" 
                frameBorder="0" 
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <p className="text-center mt-4 text-foreground/60 text-sm">
              Conheça todas as funcionalidades da Evelyn
            </p>
          </CardContent>
        </Card>

        {/* Contato Direto */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-card to-muted/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <MessageCircle className="h-6 w-6" />
              Fale Diretamente com a Evelyn
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-foreground/80 mb-4">
              WhatsApp: <span className="font-bold text-primary">({whatsappNumber.slice(0,2)}) {whatsappNumber.slice(2,7)}-{whatsappNumber.slice(7)}</span>
            </p>
            <Button 
              onClick={() => handleWhatsAppRedirect()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg shadow-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Iniciar Conversa
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Prompts Prontos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-primary">
            Prompts Prontos para Usar
          </h2>
          <p className="text-center text-foreground/70 mb-8">
            Clique em "Copiar" e cole no WhatsApp, ou clique em "Enviar" para ir direto ao chat.
            <br />
            <span className="text-primary/80 text-sm font-medium">
              A Evelyn responde apenas mensagens de texto - não envia PDFs ou imagens.
            </span>
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {prompts.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40 group bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
                    {item.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPrompt(item.prompt, item.title)}
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      {copiedPrompt === item.title ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleWhatsAppRedirect(item.prompt)}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Enviar
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Como Funciona */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/50">
          <CardHeader>
            <CardTitle className="text-center text-primary flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Como Funciona?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-primary mb-2">Escolha um Prompt</h3>
                <p className="text-sm text-foreground/60">Selecione uma das opções acima ou crie sua própria pergunta</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-primary mb-2">Copie ou Envie</h3>
                <p className="text-sm text-foreground/60">Copie o texto ou vá direto ao WhatsApp</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-primary mb-2">Receba Orientação</h3>
                <p className="text-sm text-foreground/60">A Evelyn responderá com orientação jurídica especializada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ... keep existing code (remaining sections) */}
      </div>
    </div>
  );
};