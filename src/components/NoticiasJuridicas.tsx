
import { Card, CardContent } from '@/components/ui/card';
import { useFastNoticiasJuridicas } from '@/hooks/useFastNoticiasJuridicas';
import { ExternalLink, Globe, AlertCircle } from 'lucide-react';

export const NoticiasJuridicas = () => {
  const { noticias } = useFastNoticiasJuridicas();

  return (
    <div className="py-12 sm:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 animate-slide-up-legal">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gradient-text-legal animate-legal-text-glow">
            Portais de Notícias Jurídicas
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Acesse os principais portais de notícias jurídicas do Brasil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {noticias.map((noticia, index) => (
            <Card 
              key={`${noticia.portal}-${index}`}
              className="card-legal group cursor-pointer border-border/30 bg-card/60 backdrop-blur-sm hover:bg-card/90 overflow-hidden animate-scale-glow hover:animate-legal-float"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => window.open(noticia.link, '_blank', 'noopener,noreferrer')}
            >
              <CardContent className="p-6 relative">
                {/* Enhanced background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-legal-glow" />
                
                <div className="flex items-center space-x-4 relative z-10">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-legal flex items-center justify-center group-hover:scale-110 transition-all duration-500 card-depth-2 group-hover:card-depth-3 relative animate-legal-shimmer">
                    {noticia.logo ? (
                      <img 
                        src={noticia.logo} 
                        alt={`Logo ${noticia.portal}`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<Globe class="h-6 w-6 text-white" />`;
                        }}
                      />
                    ) : (
                      <Globe className="h-6 w-6 text-white" />
                    )}
                    
                    {/* Hover arrow */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100 card-depth-1">
                      <ExternalLink className="h-2 w-2 text-gray-800" />
                    </div>
                  </div>
                  
                  {/* Portal Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-base lg:text-lg mb-1 text-foreground group-hover:text-primary transition-colors duration-500 group-hover:animate-legal-text-glow">
                      {noticia.portal}
                    </h3>
                    <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-500 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Portal de notícias jurídicas
                    </p>
                  </div>
                </div>

                {/* Interactive border effect */}
                <div className="absolute inset-0 rounded-lg border border-primary/0 group-hover:border-primary/30 transition-all duration-500 animate-legal-border" />
                
                {/* Professional glow effect on hover */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hover-glow-legal animate-legal-hover-glow" />
              </CardContent>
            </Card>
          ))}
        </div>

        {noticias.length === 0 && (
          <div className="text-center py-12 animate-fade-in-legal">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Nenhum portal de notícias encontrado na base de dados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
