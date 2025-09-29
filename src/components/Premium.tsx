
import { Crown, Check, Smartphone, Apple, Star, Zap, Shield, Infinity, Sparkles, Trophy, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WhatsAppPremiumSupport } from './WhatsAppPremiumSupport';

const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
};

const handlePremiumUpgrade = () => {
  const device = detectDevice();
  
  if (device === 'android') {
    window.open('https://play.google.com/store/apps/details?id=br.com.app.gpu2994564.gpub492f9e6db037057aaa93d7adfa9e3e0', '_blank');
  } else if (device === 'ios') {
    window.open('https://apps.apple.com/us/app/direito-premium/id6451451647', '_blank');
  } else {
    window.open('https://play.google.com/store/apps/details?id=br.com.app.gpu2994564.gpub492f9e6db037057aaa93d7adfa9e3e0', '_blank');
  }
};

export const Premium = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Sem Anúncios',
      description: 'Experiência de estudo completamente livre de interrupções',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Crown,
      title: 'Acesso Total à Plataforma',
      description: 'Links diretos para todas as funcionalidades da plataforma desktop',
      color: 'from-premium-primary to-premium-secondary'
    },
    {
      icon: Zap,
      title: 'Recursos Exclusivos',
      description: 'Ferramentas avançadas de estudo e organização',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Star,
      title: 'Suporte Prioritário',
      description: 'Atendimento especializado e resposta rápida',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Infinity,
      title: 'Acesso Vitalício',
      description: 'Pagamento único para uso permanente',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Gift,
      title: 'Conteúdo Exclusivo',
      description: 'Material premium disponível apenas para assinantes',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  const features = [
    'Acesso completo ao Vade Mecum Digital',
    'Biblioteca jurídica com milhares de livros',
    'Videoaulas com professores renomados',
    'Áudio-aulas para estudo em movimento',
    'Sistema de flashcards inteligentes',
    'Mapas mentais jurídicos',
    'Downloads ilimitados',
    'Sistema de anotações avançado',
    'Assistente IA jurídica',
    'Jurisprudência atualizada',
    'Modelos de petições',
    'Formulários atualizados',
    'Calculadoras jurídicas',
    'Agenda profissional',
    'Contratos digitais',
    'Simulados OAB exclusivos'
  ];

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 space-y-8 min-h-screen bg-gradient-to-br from-background via-background to-premium-primary/5">
      {/* Header estiloso */}
      <div className="text-center space-y-6 pt-8 animate-fade-in-up">
        <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-premium-primary/20 to-premium-secondary/20 text-premium-primary px-6 py-3 rounded-2xl text-lg font-bold mb-6 border border-premium-primary/30 backdrop-blur-sm animate-premium-glow">
          <Crown className="w-6 h-6 animate-bounce" />
          <span>Versão Premium</span>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-premium-primary via-premium-accent to-premium-secondary bg-clip-text text-transparent drop-shadow-2xl">
          Direito Premium
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          🚀 Desbloqueie todo o potencial da sua jornada jurídica com acesso completo 
          à nossa plataforma e experiência sem anúncios.
        </p>
      </div>

      {/* Card de preço redesenhado */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-premium-primary/10 via-premium-secondary/5 to-premium-accent/10 border-2 border-premium-primary/30 shadow-2xl hover:shadow-premium-primary/20 transition-all duration-500 animate-scale-in">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-premium-primary/5 to-premium-secondary/5 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-premium-primary via-premium-accent to-premium-secondary"></div>
        
        <CardContent className="relative pt-10 pb-10 text-center">
          <div className="space-y-6">
            {/* Preço destacado */}
            <div className="space-y-3">
              <div className="relative">
                <div className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-premium-primary to-premium-accent bg-clip-text text-transparent drop-shadow-lg">
                  R$ 29,99
                </div>
                <div className="absolute -top-4 -right-4 animate-bounce">
                  <Trophy className="w-8 h-8 text-premium-accent" />
                </div>
              </div>
              
              <Badge className="bg-gradient-to-r from-premium-primary to-premium-secondary text-white px-4 py-2 text-lg font-bold shadow-lg">
                <Infinity className="w-4 h-4 mr-2" />
                Acesso Vitalício
              </Badge>
            </div>
            
            <p className="text-lg text-muted-foreground font-medium">
              💎 Pagamento único • Sem mensalidades • Para sempre
            </p>
            
            {/* Botão CTA redesenhado */}
            <Button 
              onClick={handlePremiumUpgrade}
              size="lg" 
              className="relative overflow-hidden bg-gradient-to-r from-premium-primary via-premium-accent to-premium-secondary hover:from-premium-secondary hover:via-premium-primary hover:to-premium-accent text-white font-black px-12 py-4 text-xl rounded-2xl shadow-2xl hover:shadow-premium-primary/30 transform hover:scale-105 transition-all duration-500 animate-premium-glow"
            >
              {/* Button background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              
              <Crown className="w-6 h-6 mr-3 animate-bounce" />
              <span className="relative z-10">Ser Premium Agora</span>
              <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-muted-foreground mt-6">
              <div className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-green-500" />
                <span>Android</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Apple className="w-5 h-5 text-blue-500" />
                <span>iOS</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios redesenhados */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-premium-primary to-premium-secondary bg-clip-text text-transparent">
          ✨ Vantagens Exclusivas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl hover:shadow-premium-primary/20 transition-all duration-500 hover:scale-105 bg-gradient-to-br from-card/80 to-card/40 border border-premium-primary/20 hover:border-premium-primary/40 overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 relative">
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative flex items-start gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${benefit.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-premium-primary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lista de recursos redesenhada */}
      <Card className="bg-gradient-to-br from-card/80 to-card/40 border border-premium-primary/20">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-premium-primary to-premium-secondary bg-clip-text text-transparent">
            🎯 O que você terá acesso:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-premium-primary/5 transition-colors duration-200"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex-shrink-0">
                  <Check className="w-6 h-6 text-green-500 bg-green-500/20 rounded-full p-1" />
                </div>
                <span className="text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to action final redesenhado */}
      <div className="relative text-center space-y-6 bg-gradient-to-r from-premium-primary/20 via-premium-accent/10 to-premium-secondary/20 rounded-3xl p-12 border border-premium-primary/30 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-premium-primary/10 via-transparent to-premium-secondary/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-premium-primary via-premium-accent to-premium-secondary"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-premium-accent animate-spin" />
            <h3 className="text-3xl font-black bg-gradient-to-r from-premium-primary to-premium-secondary bg-clip-text text-transparent">
              Transforme seus estudos hoje mesmo!
            </h3>
            <Sparkles className="w-8 h-8 text-premium-accent animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a <span className="font-bold text-premium-primary">milhares de estudantes</span> e 
            profissionais que já escolheram o Premium
          </p>
          
          <Button 
            onClick={handlePremiumUpgrade}
            size="lg" 
            className="relative overflow-hidden bg-gradient-to-r from-premium-primary via-premium-accent to-premium-secondary hover:from-premium-secondary hover:via-premium-primary hover:to-premium-accent text-white font-black px-12 py-4 text-xl rounded-2xl shadow-2xl hover:shadow-premium-primary/30 transform hover:scale-105 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <Crown className="w-6 h-6 mr-3 animate-bounce" />
            <span className="relative z-10">Começar Agora - R$ 29,99</span>
          </Button>
          
          <p className="text-premium-primary/80 text-lg font-medium mt-4">
            💰 Investimento único • 🎓 Conhecimento para toda vida
          </p>
        </div>
      </div>
      </div>
      
      {/* Componente de Suporte WhatsApp Premium */}
      <WhatsAppPremiumSupport />
    </>
  );
};
