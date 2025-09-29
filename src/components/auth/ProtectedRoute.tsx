import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { EnhancedAuthScreen } from './EnhancedAuthScreen';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="absolute inset-0 animate-glow rounded-full"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <EnhancedAuthScreen />;
  }

  return <>{children}</>;
};