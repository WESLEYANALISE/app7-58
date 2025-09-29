import { useState } from 'react';
import { StepByStepAuth } from './StepByStepAuth';
import { LoginScreen } from './LoginScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { UserSettings } from './UserSettings';
import { useAuth } from '@/context/AuthContext';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'settings';

export const EnhancedAuthScreen = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const { user } = useAuth();

  // Se o usuário está logado e quer acessar configurações
  if (user && currentView === 'settings') {
    return <UserSettings onBack={() => setCurrentView('login')} />;
  }

  // Se o usuário não está logado, mostrar telas de auth
  if (!user) {
    switch (currentView) {
      case 'signup':
        return (
          <StepByStepAuth 
            onSuccess={() => setCurrentView('login')} 
          />
        );
      
      case 'forgot-password':
        return (
          <ForgotPasswordScreen 
            onBack={() => setCurrentView('login')} 
          />
        );
      
      case 'login':
      default:
        return (
          <LoginScreen
            onSuccess={() => {}} // O AuthContext já gerencia o redirecionamento
            onForgotPassword={() => setCurrentView('forgot-password')}
            onSignUp={() => setCurrentView('signup')}
          />
        );
    }
  }

  // Se chegou aqui, o usuário está logado mas não quer configurações
  return null;
};

// Hook para acessar configurações
export const useAuthSettings = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  return {
    showSettings,
    openSettings: () => setShowSettings(true),
    closeSettings: () => setShowSettings(false)
  };
};