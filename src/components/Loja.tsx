
import { ArrowLeft, BookOpen, Copy, Check, Users, Sparkles, Star } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import ProductCarousel from './ProductCarousel';
import { WhatsAppSupport } from './WhatsAppSupport';

export const Loja = () => {
  const { setCurrentFunction } = useNavigation();
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const handleBackToIntro = () => {
    setShowIntro(true);
  };

  const handleEnterStore = async () => {
    setIsLoading(true);
    // Simular carregamento suave
    setTimeout(() => {
      setShowIntro(false);
      setIsLoading(false);
    }, 800);
  };

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText('WN7PR10');
      setCopiedCoupon(true);
      toast({
        title: "Cupom copiado!",
        description: "O código WN7PR10 foi copiado para sua área de transferência."
      });
      setTimeout(() => setCopiedCoupon(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o cupom. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center mx-0 rounded-sm px-[3px]">
          <button
            onClick={showIntro ? handleBack : handleBackToIntro}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {showIntro ? 'Voltar' : 'Voltar à Introdução'}
          </button>
          <div className="flex-1 text-center">
            
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {showIntro ? (
        /* Tela de Introdução Redesenhada */
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* Carrossel de Produtos em Destaque no Topo */}
          <div className="mb-8">
            <ProductCarousel />
          </div>

          {/* Seção Principal com Título e Botão de Destaque */}
          <div className="text-center mb-8">
            <div className="gradient-store w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-store-glow shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-3 gradient-text-legal">
              Explorar Biblioteca
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Biblioteca curada com obras fundamentais da literatura jurídica brasileira e internacional
            </p>

            {/* Botão Principal de Destaque */}
            <button
              onClick={handleEnterStore}
              disabled={isLoading}
              className="btn-store px-8 py-4 rounded-xl text-lg font-bold inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed animate-glow-pulse shadow-2xl transform hover:scale-105 transition-all duration-300 mb-8"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  Explorar Biblioteca
                </>
              )}
            </button>
          </div>

          {/* Categorias de Livros */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center gradient-text-store">Categorias em Destaque</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Direito Constitucional */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <BookOpen className="h-6 w-6 text-white/80" />
                </div>
                <h4 className="text-xl font-bold mb-2">Direito Constitucional</h4>
                <p className="text-white/90 mb-4">Obras fundamentais sobre a Constituição e seus princípios</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  ))}
                  <span className="text-sm text-white/80 ml-1">(128 obras)</span>
                </div>
              </div>

              {/* Direito Civil */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <Users className="h-6 w-6 text-white/80" />
                </div>
                <h4 className="text-xl font-bold mb-2">Direito Civil</h4>
                <p className="text-white/90 mb-4">Clássicos do direito das obrigações, contratos e família</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  ))}
                  <span className="text-sm text-white/80 ml-1">(95 obras)</span>
                </div>
              </div>

              {/* Filosofia do Direito */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <Sparkles className="h-6 w-6 text-white/80" />
                </div>
                <h4 className="text-xl font-bold mb-2">Filosofia do Direito</h4>
                <p className="text-white/90 mb-4">Pensadores clássicos e contemporâneos do direito</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  ))}
                  <span className="text-sm text-white/80 ml-1">(67 obras)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Benefícios da Biblioteca */}
          <div className="grid grid-cols-1 gap-4 mb-8 max-w-md mx-auto">
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-community-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <h4 className="font-semibold mb-2">Obras Clássicas</h4>
              <p className="text-sm text-muted-foreground">Livros fundamentais dos maiores juristas da história</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-premium-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏛️</span>
              </div>
              <h4 className="font-semibold mb-2">Direito Brasileiro</h4>
              <p className="text-sm text-muted-foreground">Coleção completa de autores nacionais renomados</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-store-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌍</span>
              </div>
              <h4 className="font-semibold mb-2">Direito Internacional</h4>
              <p className="text-sm text-muted-foreground">Obras internacionais traduzidas e comentadas</p>
            </div>
          </div>

          {/* Footer com Garantias */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground bg-card/30 rounded-xl p-4 backdrop-blur-sm mb-6">
            <div className="flex items-center gap-2">
              <span className="text-green-500">🔒</span>
              <span>Compra 100% Segura</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📦</span>
              <span>Entrega Rápida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">💯</span>
              <span>Produtos Verificados</span>
            </div>
          </div>

          {/* Seção Acesso Gratuito */}
          <div className="text-center bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-6 border">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 gradient-text-legal">
              Acesso Livre e Gratuito
            </h3>
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
              Nossa biblioteca digital oferece acesso gratuito a uma coleção curada de 
              <strong> obras clássicas do direito</strong>, disponíveis para consulta e estudo.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Acesso Gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">📖</span>
                <span>Biblioteca Digital</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⭐</span>
                <span>Obras Verificadas</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Iframe da Loja */
        <div className="w-full" style={{ height: 'calc(100vh - 56px)' }}>
          <iframe
            src="https://appdireitoestudos.vercel.app/"
            className="w-full h-full border-0"
            title="Loja de Direito"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            loading="lazy"
          />
        </div>
      )}

      {/* Componente de Suporte WhatsApp Flutuante - apenas quando showIntro é true */}
      {showIntro && <WhatsAppSupport />}
    </div>
  );
};
