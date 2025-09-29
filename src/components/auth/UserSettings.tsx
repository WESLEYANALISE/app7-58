import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, Mail, Eye, EyeOff, Save, ArrowLeft, BookOpen } from 'lucide-react';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');

type ProfileType = 'faculdade' | 'concurso' | 'oab' | 'advogado';

interface UserSettingsProps {
  onBack: () => void;
}

export const UserSettings = ({ onBack }: UserSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { toast } = useToast();
  const { user, profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    profileType: '' as ProfileType | ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.nome_completo || '',
        email: profile.email || '',
        phone: profile.telefone || '',
        currentPassword: '',
        newPassword: '',
        profileType: profile.profile_type || ''
      });
    }
  }, [profile]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleUpdateProfile = async () => {
    setLoading(true);

    try {
      // Validar telefone se foi alterado
      if (formData.phone && formData.phone !== profile?.telefone) {
        phoneSchema.parse(formData.phone);
      }

      const updateData: any = {
        nome_completo: formData.name,
        telefone: formData.phone
      };

      const { error } = await updateProfile(updateData);

      if (error) throw error;

      // Atualizar tipo de perfil na tabela user_settings se mudou
      if (formData.profileType && formData.profileType !== profile?.profile_type) {
        await supabase
          .from('user_settings')
          .upsert({
            id: user?.id,
            profile_type: formData.profileType
          });
      }

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
        variant: "default"
      });
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

  const handleChangePassword = async () => {
    try {
      passwordSchema.parse(formData.newPassword);
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
      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: formData.currentPassword
      });

      if (signInError) {
        toast({
          title: "Senha atual incorreta",
          description: "A senha atual está incorreta.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
        variant: "default"
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email não pode ser alterado
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileType">Objetivo de estudo</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'faculdade', label: 'Faculdade', icon: '🎓' },
                  { value: 'concurso', label: 'Concurso', icon: '📋' },
                  { value: 'oab', label: 'OAB', icon: '⚖️' },
                  { value: 'advogado', label: 'Advogado', icon: '👨‍💼' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={formData.profileType === option.value ? "default" : "outline"}
                    className="h-12 text-left flex items-center gap-2"
                    onClick={() => setFormData(prev => ({ ...prev, profileType: option.value as ProfileType }))}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full md:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Digite sua senha atual"
                  className="pr-10"
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

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={loading || !formData.currentPassword || !formData.newPassword}
              className="w-full md:w-auto"
            >
              {loading ? "Alterando..." : "Alterar senha"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};