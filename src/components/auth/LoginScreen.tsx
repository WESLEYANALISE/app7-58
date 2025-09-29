import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email ou telefone obrigatório'),
  password: z.string().min(1, 'Senha obrigatória')
});

interface LoginScreenProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export const LoginScreen = ({ onSuccess, onForgotPassword, onSignUp }: LoginScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const isPhoneNumber = (value: string) => {
    return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      let email = formData.emailOrPhone;

      // Se for telefone, buscar o email correspondente
      if (isPhoneNumber(formData.emailOrPhone)) {
        const { data: profile } = await supabase
          .from('perfis')
          .select('email')
          .eq('telefone', formData.emailOrPhone)
          .single();

        if (!profile) {
          toast({
            title: "Telefone não encontrado",
            description: "Este telefone não está cadastrado.",
            variant: "destructive"
          });
          return;
        }
        email = profile.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      });

      if (error) throw error;

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
        variant: "default"
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Entrar
          </CardTitle>
          <p className="text-muted-foreground">
            Acesse sua conta com email ou telefone
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Email ou Telefone</Label>
              <div className="relative">
                <Input
                  id="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailOrPhone: e.target.value }))}
                  placeholder="seu@email.com ou (XX) XXXXX-XXXX"
                  className="text-base pl-10"
                />
                {isPhoneNumber(formData.emailOrPhone) ? (
                  <Phone className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite sua senha"
                  className="text-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                onClick={onForgotPassword}
                className="text-sm"
              >
                Esqueci minha senha
              </Button>
              <div className="text-sm text-muted-foreground">
                Não tem conta?{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={onSignUp}
                  className="p-0 h-auto text-primary"
                >
                  Cadastre-se
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};