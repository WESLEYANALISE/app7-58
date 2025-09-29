import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, CheckCircle, Crown, Download, Zap, Shield, Lock, Star, Monitor, Sparkles, ArrowLeft } from 'lucide-react';
import { DesktopPlatformCarousel } from '@/components/DesktopPlatformCarousel';
import { PremiumRequired } from '@/components/PremiumRequired';
import { useNavigation } from '@/context/NavigationContext';
const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Digite um email válido')
});
type FormData = z.infer<typeof formSchema>;
export const PlataformaDesktop = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setCurrentFunction } = useNavigation();
  const {
    toast
  } = useToast();

  // Removendo verificação premium - sempre libera o formulário
  const isPremiumUser = true;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: ''
    }
  });
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const scriptURL = 'https://sheetdb.io/api/v1/29eaz3rsm73qu';
    try {
      console.log('Dados originais do formulário:', data);
      const sheetData = {
        Nome: data.nome,
        email: data.email
      };
      console.log('Dados formatados para SheetDB:', sheetData);
      const response = await fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify([sheetData]),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Resposta da API:', response.status, response.statusText);
      if (response.ok) {
        const result = await response.json();
        console.log('Dados enviados com sucesso:', result);
        setIsSuccess(true);
        setIsDialogOpen(false);
        form.reset();
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você receberá o link de acesso da plataforma desktop no seu email em instantes."
        });
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Tente novamente em alguns instantes."
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (isSuccess) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-muted/30">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <Card className="text-center border-0 bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="gradient-text-legal text-3xl mb-2">
              🎉 Cadastro Realizado com Sucesso!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Perfeito! Seu acesso à plataforma desktop está sendo preparado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card/70 rounded-lg p-6 mb-6 border border-border">
              <h3 className="font-bold text-lg mb-4 text-green-400">📧 Próximos passos:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">1</div>
                  <p className="text-sm text-muted-foreground">Verifique sua caixa de entrada (e spam) nos próximos minutos</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">2</div>
                  <p className="text-sm text-muted-foreground">Clique no link de acesso que você receberá por email</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">3</div>
                  <p className="text-sm text-muted-foreground">Faça o download e comece a usar a plataforma completa!</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50">
                Fazer novo cadastro
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>;
  }

  // Se não for usuário premium, mostrar tela de upgrade
  if (!isPremiumUser) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-muted/30">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 py-[21px]">
        {/* Carrossel de imagens da plataforma */}
        <div className="mb-12">
          <DesktopPlatformCarousel />
        </div>

        {/* Aviso Premium */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 px-6 py-3 rounded-full text-lg font-semibold mb-6">
            <Crown className="w-6 h-6" />
            <span>Recurso Premium Exclusivo</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Acesso à Plataforma Desktop
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Para receber o link de download da plataforma desktop completa, você precisa ser um usuário Premium.
          </p>
        </div>

        {/* PremiumRequired Component */}
        <PremiumRequired functionName="Plataforma Desktop" />
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-muted/30">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 py-6">
        {/* Botão de voltar */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentFunction(null)}
            className="gap-2 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Header minimalista com botão */}
        <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 gradient-text-legal">
          Plataforma Desktop
        </h1>
        
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Versão completa para computador com todas as funcionalidades
        </p>

        {/* Botão principal no topo */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-black shadow-xl hover:shadow-primary/20 transform hover:scale-105 transition-all duration-300 rounded-xl">
              <Download className="w-5 h-5 mr-2" />
              Receber Link de Download
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold gradient-text-legal text-center mb-2">
                Acesso Premium Desktop
              </DialogTitle>
              <p className="text-muted-foreground text-center">
                Preencha seus dados para receber o link por email
              </p>
            </DialogHeader>
            
            <div className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="nome" render={({
                    field
                  }) => <FormItem>
                        <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Nome Completo
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} className="h-12 bg-background/50 backdrop-blur-sm" disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="email" render={({
                    field
                  }) => <FormItem>
                        <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          E-mail para receber o link
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Digite seu melhor e-mail" {...field} className="h-12 bg-background/50 backdrop-blur-sm" disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <Button type="submit" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </> : <>
                        <Download className="w-5 h-5 mr-2" />
                        Receber Link Agora
                      </>}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-primary/5 backdrop-blur-sm rounded-xl border border-primary/20">
                <p className="text-sm text-primary text-center">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Seus dados estão seguros e protegidos
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vantagens compactas */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-400" />
            <span>Download direto</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Acesso instantâneo</span>
          </div>
          <div className="flex items-center gap-2">
            
            
          </div>
        </div>
      </div>

      {/* Carrossel de imagens */}
      <div className="mb-8">
        <DesktopPlatformCarousel />
      </div>

        {/* Informações adicionais minimalistas */}
        <div className="text-center text-muted-foreground">
          
        </div>
      </div>
    </div>;
};