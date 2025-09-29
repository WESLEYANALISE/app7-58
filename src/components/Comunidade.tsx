
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Gift, Bell, BookOpen, Star, MessageCircle, Trophy, Zap, Video, Heart, TrendingUp } from 'lucide-react';

export const Comunidade = () => {
  const benefits = [
    {
      icon: Bell,
      title: "Atualizações em Primeira Mão",
      description: "Seja o primeiro a saber sobre novas funcionalidades, recursos e melhorias da plataforma jurídica."
    },
    {
      icon: BookOpen,
      title: "Recomendações de Livros",
      description: "Receba indicações exclusivas de livros jurídicos atualizados, doutrina e obras especializadas por área do direito."
    },
    {
      icon: Video,
      title: "Conteúdo do TikTok",
      description: "Acompanhe nosso perfil oficial no TikTok com dicas jurídicas, resumos e conteúdo educativo em formato dinâmico."
    },
    {
      icon: Star,
      title: "Recomendações de Filmes",
      description: "Descubra filmes e documentários jurídicos selecionados para complementar seus estudos e cultura jurídica."
    },
    {
      icon: TrendingUp,
      title: "Tendências do Direito",
      description: "Fique por dentro das principais tendências, mudanças legislativas e novidades do mundo jurídico."
    },
    {
      icon: Heart,
      title: "Conteúdo Exclusivo",
      description: "Acesse materiais especiais, lives exclusivas e conteúdo premium desenvolvido pela nossa equipe."
    }
  ];

  const handleJoinCommunity = () => {
    window.open('https://chat.whatsapp.com/DKlKgHsjHZ97OKUDxEpT6w?mode=r_t', '_blank');
  };

  const handleTikTokPage = () => {
    // Aqui você pode colocar o link real do TikTok quando estiver disponível
    window.open('https://www.tiktok.com/@seuapp', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 text-emerald-600 px-6 py-3 rounded-full text-lg font-semibold mb-6 border border-emerald-500/20">
            <Users className="w-6 h-6" />
            <span>Central de Novidades</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 gradient-text-legal">
            Fique Sempre Atualizado
            <br />
            <span className="text-emerald-600">Com as Novidades</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Receba <span className="font-bold text-emerald-600">atualizações exclusivas</span>, 
            recomendações de livros e filmes jurídicos, além de acompanhar nosso conteúdo no TikTok.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text-legal">
            O Que Você Vai Receber
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card 
                  key={index} 
                  className="group p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-emerald-500/30"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-emerald-600 transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button 
            onClick={handleJoinCommunity}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg px-10 py-6 rounded-full shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            Entrar no WhatsApp
          </Button>
          
          <Button 
            onClick={handleTikTokPage}
            variant="outline"
            size="lg"
            className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white font-bold text-lg px-10 py-6 rounded-full transition-all duration-300 hover:scale-105"
          >
            <Video className="w-6 h-6 mr-3" />
            Seguir no TikTok
          </Button>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-transparent to-emerald-400/20 animate-pulse"></div>
          <div className="relative z-10">
            <Trophy className="w-16 h-16 mx-auto mb-6 text-amber-300" />
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Não Perca Nenhuma Novidade!
            </h2>
            
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Junte-se à nossa comunidade e seja sempre o primeiro a saber sobre atualizações, 
              novos recursos e conteúdo exclusivo para profissionais do direito.
            </p>
            
            <p className="text-emerald-200 text-sm">
              🔒 Suas informações são mantidas em total privacidade
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 text-muted-foreground">
          <p className="text-lg">
            Transforme sua experiência jurídica com conteúdo sempre atualizado! 📚✨
          </p>
        </div>
      </div>
    </div>
  );
};
