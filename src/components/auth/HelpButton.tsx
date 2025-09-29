import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, Mail, Key, Users, Book } from 'lucide-react';

export const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const faqItems = [
    {
      icon: <Key className="h-5 w-5 text-primary" />,
      title: "Primeiro Acesso",
      description: "Cadastre-se escolhendo seu foco de estudos: Faculdade, Concurso, OAB ou Advogado."
    },
    {
      icon: <Mail className="h-5 w-5 text-primary" />,
      title: "Múltiplos E-mails",
      description: "Você pode acessar com quantos emails quiser! Cada email precisa ser cadastrado individualmente."
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: "Tipos de Perfil",
      description: "Escolha seu perfil para ter acesso personalizado aos conteúdos mais relevantes para seus estudos."
    },
    {
      icon: <Book className="h-5 w-5 text-primary" />,
      title: "Problemas no Login",
      description: "Verifique se o email e senha estão corretos. Certifique-se de ter confirmado seu email no primeiro acesso."
    }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-primary to-accent-legal hover:from-accent-legal hover:to-primary transition-all duration-300 hover:scale-105"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent-legal/20 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">
                Precisa de Ajuda?
              </CardTitle>
              <CardDescription>
                Perguntas frequentes e dicas de acesso
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 max-h-80 overflow-y-auto">
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-3 text-primary">Perguntas Frequentes</h3>
                <div className="space-y-3">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50 transition-colors hover:bg-muted">
                      <div className="flex-shrink-0 mt-0.5">
                        {faq.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">
                          {faq.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {faq.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent-legal/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Suporte Técnico</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Ainda com problemas? Entre em contato - resposta rápida garantida:
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-primary">
                    wn7corporation@gmail.com
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.location.href = 'mailto:wn7corporation@gmail.com?subject=Suporte - Direito Premium';
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    Enviar Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};