import { useState } from 'react';
import { MapasMentaisEstruturados } from './MapasMentaisEstruturados';
import { MapasMentaisPersonalizados } from './MapasMentaisPersonalizados';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, BookOpen, Sparkles, ArrowLeft, Home } from 'lucide-react';

export const MapasMentais = () => {
  const [currentView, setCurrentView] = useState<'home' | 'estruturados' | 'personalizados'>('home');

  const renderHome = () => (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--red-elegant))] to-[hsl(var(--red-elegant-light))] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Mapas Mentais</h1>
              <p className="text-sm text-muted-foreground">
                Visualize conceitos jurídicos de forma clara
              </p>
            </div>
          </div>
          
          {/* Botão Home */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoHome}
            className="hover:bg-muted p-2 rounded-full"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-6 text-center">
        <h2 className="text-lg font-bold mb-2 text-foreground">
          Escolha Como Criar Seus Mapas
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Mapas prontos ou personalizados com IA
        </p>
      </div>

      {/* Options */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          
          {/* Mapas Estruturados */}
          <Card 
            className="cursor-pointer hover:bg-card/80 transition-all duration-300 border-border bg-card" 
            onClick={() => setCurrentView('estruturados')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-background" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Mapas Estruturados</h3>
                  <p className="text-xs text-muted-foreground">
                    Mapas prontos por área jurídica
                  </p>
                </div>
                <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
              </div>
            </CardContent>
          </Card>

          {/* Mapas Personalizados */}
          <Card 
            className="cursor-pointer hover:bg-card/80 transition-all duration-300 border-border bg-card" 
            onClick={() => setCurrentView('personalizados')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tools-primary to-tools-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-background" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Mapas Personalizados</h3>
                  <p className="text-xs text-muted-foreground">
                    Crie com IA e edite livremente
                  </p>
                </div>
                <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  const handleGoHome = () => {
    try {
      window.location.href = '/';
    } catch {
      // Fallback se não conseguir navegar
      setCurrentView('home');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'estruturados':
        return <MapasMentaisEstruturados onBack={() => setCurrentView('home')} onHome={handleGoHome} />;
      case 'personalizados':
        return <MapasMentaisPersonalizados onBack={() => setCurrentView('home')} onHome={handleGoHome} />;
      default:
        return (
          <div className="min-h-screen bg-background text-foreground">
            {renderHome()}
          </div>
        );
    }
  };

  return renderCurrentView();
};