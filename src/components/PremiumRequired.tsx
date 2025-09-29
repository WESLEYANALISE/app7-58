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

interface PremiumRequiredProps {
  functionName: string;
}

export const PremiumRequired = ({ functionName }: PremiumRequiredProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full text-center bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-200 dark:border-amber-800">
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
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                Recurso Premium
              </h2>
              <p className="text-muted-foreground">
                {functionName} está disponível apenas na versão Premium
              </p>
            </div>
            
            {/* Benefits */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Acesso completo à plataforma</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Experiência sem anúncios</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Recursos exclusivos</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="bg-amber-50 dark:bg-amber-950/50 rounded-lg p-4 space-y-2">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                R$ 39,90
              </div>
              <div className="text-sm text-muted-foreground">
                Pagamento único • Acesso vitalício
              </div>
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={handlePremiumUpgrade}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold"
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ser Premium Agora
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Disponível na Google Play Store e App Store
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};