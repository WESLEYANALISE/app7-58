import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX');
const codeSchema = z.string().length(6, 'Código deve ter 6 dígitos');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export const ForgotPasswordScreen = ({ onBack }: ForgotPasswordScreenProps) => {
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = async () => {
    try {
      phoneSchema.parse(formData.phone);
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
      // Verificar se o telefone existe
      const { data: profile } = await supabase
        .from('perfis')
        .select('*')
        .eq('telefone', formData.phone)
        .single();

      if (!profile) {
        toast({
          title: "Telefone não encontrado",
          description: "Este telefone não está cadastrado.",
          variant: "destructive"
        });
        return;
      }

      // Gerar e salvar código de recuperação
      const code = generateCode();
      
      const { error } = await supabase
        .from('phone_recovery_codes')
        .insert({
          phone: formData.phone,
          code,
          user_id: profile.id
        });

      if (error) throw error;

      // Em um ambiente real, aqui enviaria SMS/WhatsApp
      // Por enquanto, apenas mostra o código (para desenvolvimento)
      toast({
        title: "Código enviado!",
        description: `Código: ${code} (Em desenvolvimento)`,
        variant: "default"
      });

      setStep('code');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      codeSchema.parse(formData.code);
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
      const { data: recoveryCode } = await supabase
        .from('phone_recovery_codes')
        .select('*')
        .eq('phone', formData.phone)
        .eq('code', formData.code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!recoveryCode) {
        toast({
          title: "Código inválido",
          description: "Código incorreto ou expirado.",
          variant: "destructive"
        });
        return;
      }

      setStep('password');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      passwordSchema.parse(formData.newPassword);
      
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Erro",
          description: "Senhas não coincidem.",
          variant: "destructive"
        });
        return;
      }
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
      // Buscar o usuário pelo telefone
      const { data: profile } = await supabase
        .from('perfis')
        .select('email')
        .eq('telefone', formData.phone)
        .single();

      if (!profile) throw new Error('Usuário não encontrado');

      // Atualizar senha via Supabase Auth Admin
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      // Marcar código como usado
      await supabase
        .from('phone_recovery_codes')
        .update({ used: true })
        .eq('phone', formData.phone)
        .eq('code', formData.code);

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
        variant: "default"
      });

      onBack();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Phone className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Recuperar senha</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Digite seu telefone para receber um código de recuperação
            </p>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                placeholder="(XX) XXXXX-XXXX"
                className="text-base"
              />
            </div>
            <Button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </Button>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Digite o código</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Digite o código de 6 dígitos enviado para seu telefone
            </p>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="123456"
                className="text-base text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            <Button
              onClick={handleVerifyCode}
              disabled={loading || formData.code.length !== 6}
              className="w-full"
            >
              {loading ? "Verificando..." : "Verificar código"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep('phone')}
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <KeyRound className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Nova senha</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Digite sua nova senha
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Digite novamente"
                  className="text-base"
                />
              </div>
            </div>
            <Button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">Recuperar Senha</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};