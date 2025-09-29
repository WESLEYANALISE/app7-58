import { Crown, Lock, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logoDireito from '@/assets/logo-direito.png';

const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
};

const handlePremiumUpgrade = () => {
  const device = detectDevice();
  
  if (device === 'android') {
    window.open('https://play.google.com/store/apps/details?id=gpub492f9e6db037057aaa93d7adfa9e3e0', '_blank');
  } else {
    window.open('https://direito-360-prem.vercel.app/', '_blank');
  }
};

interface PremiumModalOverlayProps {
  functionName: string;
}

export const PremiumModalOverlay = ({ functionName }: PremiumModalOverlayProps) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center bg-gradient-to-br from-premium-primary/10 to-premium-accent/10 border-premium-primary dark:border-premium-accent animate-fade-in">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img 
                src={logoDireito} 
                alt="Direito Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-premium-primary dark:text-premium-accent">
                Recurso Premium
              </h2>
              <p className="text-muted-foreground">
                {functionName} está disponível apenas na versão Premium
              </p>
            </div>
            
            {/* Benefits */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4 text-premium-accent" />
                <span className="text-sm">Acesso completo à plataforma</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-premium-accent" />
                <span className="text-sm">Experiência sem anúncios</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-premium-accent" />
                <span className="text-sm">Recursos exclusivos</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="bg-premium-primary/10 dark:bg-premium-accent/10 rounded-lg p-4 space-y-2">
              <div className="text-3xl font-bold text-premium-primary dark:text-premium-accent">
                R$ 39,90
              </div>
              <div className="text-sm text-muted-foreground">
                Pagamento único • Acesso vitalício
              </div>
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={handlePremiumUpgrade}
              className="w-full bg-gradient-to-r from-premium-primary to-premium-accent hover:from-premium-primary/90 hover:to-premium-accent/90 text-white font-semibold animate-premium-glow"
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ser Premium Agora
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Redirecionamento para página de pagamento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};