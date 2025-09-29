import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Eye, EyeOff, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HelpButton } from './HelpButton';

const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  profileType: z.enum(['faculdade', 'concurso', 'oab', 'advogado'] as const, {
    required_error: 'Selecione seu foco de estudos'
  })
});

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();
  const { toast } = useToast();

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema)
  });

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema)
  });

  const resetPasswordForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName, data.profileType);
      
      if (error) {
        console.error('Erro de cadastro:', error);
        
        // Tratamento mais robusto de erros
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('already registered') || errorMessage.includes('user already registered') || errorMessage.includes('already exists')) {
          toast({
            title: "Usuário já existe",
            description: "Este email já está cadastrado. Tente fazer login.",
            variant: "destructive"
          });
          setActiveTab('signin'); // Muda automaticamente para a aba de login
        } else if (errorMessage.includes('database') || errorMessage.includes('server') || errorMessage.includes('connection')) {
          toast({
            title: "Erro no servidor",
            description: "Problema temporário no servidor. Tente novamente em alguns instantes.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('invalid') && errorMessage.includes('email')) {
          toast({
            title: "Email inválido",
            description: "Por favor, verifique o formato do seu email.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('password') && (errorMessage.includes('weak') || errorMessage.includes('short'))) {
          toast({
            title: "Senha inválida",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          toast({
            title: "Muitas tentativas",
            description: "Aguarde alguns minutos antes de tentar novamente.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Cadastro realizado com ressalvas",
            description: "Sua conta pode ter sido criada. Tente fazer login ou verifique seu email.",
          });
          // Em caso de erro não identificado, tenta mudar para login após um delay
          setTimeout(() => setActiveTab('signin'), 2000);
        }
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        });
        // Reset do formulário e mudança para login
        signUpForm.reset();
        setTimeout(() => setActiveTab('signin'), 1500);
      }
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      toast({
        title: "Cadastro processado",
        description: "Sua conta pode ter sido criada. Tente fazer login.",
      });
      // Mesmo em caso de erro inesperado, tenta mudar para login
      setTimeout(() => setActiveTab('signin'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    try {
      console.log('Iniciando processo de login');
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        console.error('Erro retornado do signIn:', error);
        
        // Tratamento detalhado de diferentes tipos de erro
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('invalid login credentials') || errorMessage.includes('email not confirmed')) {
          // Verificar se é problema de confirmação de email
          if (errorMessage.includes('email not confirmed')) {
            toast({
              title: "Email não confirmado",
              description: "Verifique seu email e clique no link de confirmação, ou entre em contato com o suporte.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Credenciais inválidas",
              description: "Verifique seu email e senha. Se o problema persistir, entre em contato com o suporte.",
              variant: "destructive"
            });
          }
        } else if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
          toast({
            title: "Muitas tentativas",
            description: "Aguarde alguns minutos antes de tentar novamente.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('sincronização')) {
          toast({
            title: "Problema técnico",
            description: error.message || "Entre em contato com o suporte técnico.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message || "Erro desconhecido. Tente novamente.",
            variant: "destructive"
          });
        }
      } else {
        console.log('Login realizado com sucesso');
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
      }
    } catch (error) {
      console.error('Erro inesperado no handleSignIn:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        console.error('Erro ao solicitar reset de senha:', error);
        toast({
          title: "Erro ao solicitar recuperação",
          description: "Verifique o email e tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada e clique no link para redefinir sua senha.",
        });
        resetPasswordForm.reset();
        setActiveTab('signin');
      }
    } catch (error) {
      console.error('Erro inesperado no reset:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const profileTypeOptions = [
    { value: 'faculdade', label: 'Faculdade' },
    { value: 'concurso', label: 'Concurso Público' },
    { value: 'oab', label: 'Exame da OAB' },
    { value: 'advogado', label: 'Sou Advogado' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Layout responsivo: coluna única no mobile, duas colunas no desktop */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        
        {/* Seção esquerda - Logo/Animação (escondida no mobile, visível no desktop) */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-primary/5 via-accent-legal/5 to-primary/5 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative z-10 text-center max-w-md">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-primary/20 via-accent-legal/30 to-primary/20 rounded-full flex items-center justify-center animate-glow">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary to-accent-legal rounded-full flex items-center justify-center animate-pulse-glow">
                    <GraduationCap className="h-24 w-24 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent-legal/10 rounded-full animate-float-enhanced"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-legal bg-clip-text text-transparent mb-4">
              Direito Premium
            </h1>
            <p className="text-lg text-muted-foreground">
              Sua plataforma completa de estudos jurídicos com tecnologia IA
            </p>
          </div>
        </div>

        {/* Seção direita - Formulário */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Logo/Animation Section (visível apenas no mobile) */}
            <div className="flex justify-center mb-8 lg:hidden">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 via-accent-legal/30 to-primary/20 rounded-full flex items-center justify-center animate-glow">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent-legal rounded-full flex items-center justify-center animate-pulse-glow">
                    <GraduationCap className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent-legal/10 rounded-full animate-float-enhanced"></div>
              </div>
            </div>

            <Card className="glass-effect-modern border-border/50 shadow-deep">
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-2xl lg:hidden font-bold bg-gradient-to-r from-primary to-accent-legal bg-clip-text text-transparent">
                  Direito Premium
                </CardTitle>
                <CardTitle className="text-3xl hidden lg:block font-bold bg-gradient-to-r from-primary to-accent-legal bg-clip-text text-transparent">
                  Bem-vindo de volta
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Acesse sua conta para continuar estudando
                </CardDescription>
              </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="signin" className="transition-all">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="transition-all">
                  Cadastrar
                </TabsTrigger>
                <TabsTrigger value="reset" className="transition-all">
                  Recuperar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...signInForm.register('email')}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        {...signInForm.register('password')}
                        className="pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.password.message}
                      </p>
                     )}
                   </div>


                   <Button 
                     type="submit" 
                     className="w-full bg-gradient-to-r from-primary to-accent-legal hover:from-accent-legal hover:to-primary transition-all duration-300"
                     disabled={isLoading}
                   >
                     {isLoading ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Entrando...
                       </>
                     ) : (
                       'Entrar'
                      )}
                    </Button>

                    <div className="text-center mt-4">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setActiveTab('reset')}
                      >
                        Esqueci minha senha
                      </Button>
                    </div>
                 </form>
               </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      {...signUpForm.register('fullName')}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                    {signUpForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...signUpForm.register('email')}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        {...signUpForm.register('password')}
                        className="pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Foco de Estudos
                    </Label>
                    <Select 
                      onValueChange={(value) => signUpForm.setValue('profileType', value as any)}
                    >
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Selecione seu foco" />
                      </SelectTrigger>
                      <SelectContent>
                        {profileTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {signUpForm.formState.errors.profileType && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.profileType.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent-legal hover:from-accent-legal hover:to-primary transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                 </form>
               </TabsContent>

               <TabsContent value="reset" className="space-y-4">
                 <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                   <div className="text-center mb-4">
                     <h3 className="text-lg font-semibold">Recuperar Senha</h3>
                     <p className="text-sm text-muted-foreground">
                       Digite seu email para receber o link de recuperação
                     </p>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="reset-email" className="flex items-center gap-2">
                       <Mail className="h-4 w-4" />
                       Email
                     </Label>
                     <Input
                       id="reset-email"
                       type="email"
                       placeholder="seu@email.com"
                       {...resetPasswordForm.register('email')}
                       className="transition-all focus:ring-2 focus:ring-primary/20"
                     />
                     {resetPasswordForm.formState.errors.email && (
                       <p className="text-sm text-destructive">
                         {resetPasswordForm.formState.errors.email.message}
                       </p>
                     )}
                   </div>

                   <Button 
                     type="submit" 
                     className="w-full bg-gradient-to-r from-primary to-accent-legal hover:from-accent-legal hover:to-primary transition-all duration-300"
                     disabled={isLoading}
                   >
                     {isLoading ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Enviando...
                       </>
                     ) : (
                       'Enviar Link de Recuperação'
                     )}
                   </Button>

                   <div className="text-center mt-4">
                     <Button
                       type="button"
                       variant="link"
                       className="text-sm text-muted-foreground hover:text-primary"
                       onClick={() => setActiveTab('signin')}
                     >
                       Voltar ao Login
                     </Button>
                   </div>
                 </form>
               </TabsContent>
             </Tabs>
          </CardContent>
        </Card>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Ao continuar, você concorda com nossos termos de uso
            </p>
          </div>
        </div>
      </div>

      {/* Botão de ajuda flutuante */}
      <HelpButton />
    </div>
  );
};