import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, BookOpen, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX');
const emailSchema = z.string().email('Email inválido');
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');

type ProfileType = 'faculdade' | 'concurso' | 'oab' | 'advogado';

interface StepByStepAuthProps {
  onSuccess: () => void;
}

export const StepByStepAuth = ({ onSuccess }: StepByStepAuthProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    profileType: undefined as ProfileType | undefined
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const validateStep = async (step: number): Promise<boolean> => {
    try {
      switch (step) {
        case 1:
          nameSchema.parse(formData.name);
          return true;
        case 2:
          emailSchema.parse(formData.email);
          const { data } = await supabase.rpc('check_email_exists', { email_input: formData.email });
          if (data) {
            toast({
              title: "Email já cadastrado",
              description: "Este email já está em uso. Tente fazer login.",
              variant: "destructive"
            });
            return false;
          }
          return true;
        case 3:
          phoneSchema.parse(formData.phone);
          return true;
        case 4:
          passwordSchema.parse(formData.password);
          return true;
        case 5:
          return formData.profileType !== undefined;
        default:
          return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === 5) {
      await handleSignUp();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo: formData.name,
            telefone: formData.phone,
            profile_type: formData.profileType
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
        variant: "default"
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Qual é o seu nome?</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite seu nome completo"
                className="text-base"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Qual é o seu email?</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                className="text-base"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Phone className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Qual é o seu telefone?</h3>
            </div>
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <h3 className="text-lg font-semibold">Crie uma senha</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
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
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Qual é o seu objetivo?</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'faculdade', label: 'Faculdade', icon: '🎓' },
                { value: 'concurso', label: 'Concurso', icon: '📋' },
                { value: 'oab', label: 'OAB', icon: '⚖️' },
                { value: 'advogado', label: 'Advogado', icon: '👨‍💼' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={formData.profileType === option.value ? "default" : "outline"}
                  className="h-16 text-left flex-col gap-1"
                  onClick={() => setFormData(prev => ({ ...prev, profileType: option.value as ProfileType }))}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Cadastro
          </CardTitle>
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Etapa {currentStep} de 5
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                "Carregando..."
              ) : currentStep === 5 ? (
                "Finalizar"
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};