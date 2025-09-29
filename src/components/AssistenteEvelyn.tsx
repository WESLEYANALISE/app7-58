import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, ExternalLink, Check, Play } from "lucide-react";
import { copyWithFeedback } from "@/utils/clipboardUtils";
import { toast } from "sonner";

const AssistenteEvelyn = () => {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const whatsappNumber = "11940432865";
  const videoUrl = "https://youtu.be/HlE9u1c_MPQ";

  const prompts = [
    {
      title: "Análise de Contrato",
      prompt: "Olá Evelyn! Preciso de ajuda para analisar um contrato. Pode me ajudar a identificar cláusulas importantes e possíveis problemas?"
    },
    {
      title: "Orientação Trabalhista",
      prompt: "Oi Evelyn! Tenho uma dúvida sobre direitos trabalhistas. Pode me orientar sobre meus direitos como funcionário?"
    },
    {
      title: "Questões de Família",
      prompt: "Evelyn, preciso de orientação sobre questões de direito de família. Pode me ajudar com informações sobre divórcio e guarda?"
    },
    {
      title: "Direito do Consumidor",
      prompt: "Olá! Tive um problema com uma compra e quero saber meus direitos como consumidor. Pode me orientar?"
    },
    {
      title: "Processo Civil",
      prompt: "Evelyn, preciso entender melhor sobre prazos processuais e procedimentos no processo civil. Pode me explicar?"
    },
    {
      title: "Direito Penal",
      prompt: "Oi Evelyn! Tenho dúvidas sobre procedimentos em direito penal. Pode me esclarecer algumas questões?"
    },
    {
      title: "Orientação Geral",
      prompt: "Olá Evelyn! Preciso de uma orientação jurídica geral. Pode me ajudar a entender melhor minha situação?"
    },
    {
      title: "Documentos Legais",
      prompt: "Evelyn, preciso de ajuda para entender e elaborar alguns documentos legais. Pode me orientar?"
    }
  ];

  const handleCopyPrompt = async (prompt: string, title: string) => {
    await copyWithFeedback(
      prompt,
      () => {
        setCopiedPrompt(title);
        toast.success("Prompt copiado! Agora é só enviar no WhatsApp.");
        setTimeout(() => setCopiedPrompt(null), 2000);
      },
      (error) => {
        toast.error(error);
      }
    );
  };

  const handleWhatsAppRedirect = (prompt?: string) => {
    const message = prompt ? encodeURIComponent(prompt) : "";
    const whatsappUrl = `https://wa.me/5${whatsappNumber}${message ? `?text=${message}` : ""}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleVideoClick = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header com vídeo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-green-500/10">
            <MessageCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Assistente Evelyn
          </h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          Sua assistente jurídica especializada no WhatsApp
        </p>

        {/* Vídeo de apresentação */}
        <Card className="mb-8 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="aspect-video max-w-2xl mx-auto bg-black/5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors border-2 border-dashed border-green-300" onClick={handleVideoClick}>
              <div className="text-center">
                <Play className="h-16 w-16 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">Clique para assistir a apresentação da Evelyn</p>
                <p className="text-sm text-green-600 mt-1">Conheça todas as funcionalidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de contato direto */}
      <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-800">
            <MessageCircle className="h-6 w-6" />
            Fale Diretamente com a Evelyn
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-green-700 mb-4">
            WhatsApp: <span className="font-bold text-green-800">({whatsappNumber.slice(0,2)}) {whatsappNumber.slice(2,7)}-{whatsappNumber.slice(7)}</span>
          </p>
          <Button 
            onClick={() => handleWhatsAppRedirect()}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Iniciar Conversa
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Prompts prontos */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-800">
          Prompts Prontos para Usar
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Clique em "Copiar" e cole no WhatsApp, ou clique em "Enviar" para ir direto ao chat
        </p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {prompts.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-green-100 hover:border-green-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {item.prompt}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPrompt(item.prompt, item.title)}
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
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
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
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

      {/* Informações adicionais */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="text-center text-green-800">
            Como Funciona?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Escolha um Prompt</h3>
              <p className="text-sm text-green-600">Selecione uma das opções acima ou crie sua própria pergunta</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Copie ou Envie</h3>
              <p className="text-sm text-green-600">Copie o texto ou vá direto ao WhatsApp</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Receba Orientação</h3>
              <p className="text-sm text-green-600">A Evelyn responderá com orientação jurídica especializada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistenteEvelyn;