import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Heart, Share2, Star, Calendar, Monitor, ExternalLink, Youtube, Bot } from 'lucide-react';
import { JuriflixItem } from '@/hooks/useJuriflix';
interface JuriflixDetailProps {
  item: JuriflixItem;
  onBack: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}
export const JuriflixDetail = ({
  item,
  onBack,
  onToggleFavorite,
  isFavorite
}: JuriflixDetailProps) => {
  const handleWatchNow = () => {
    if (item.link) {
      window.open(item.link, '_blank');
    }
  };
  const handleWatchTrailer = () => {
    if (item.trailer) {
      window.open(item.trailer, '_blank');
    }
  };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.nome,
          text: item.sinopse,
          url: item.link || window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback para copiar para o clipboard
      navigator.clipboard.writeText(item.link || window.location.href);
    }
  };
  return <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center h-16 px-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold text-white">Detalhes</h1>
        </div>
      </div>

      <div className="pb-24">
        {/* Hero Image with Trailer Button */}
        <div className="relative aspect-video">
          <img src={item.capa} alt={item.nome} className="w-full h-full object-cover" onError={e => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          
          {/* Trailer Button */}
          {item.trailer && <div className="absolute inset-0 flex items-center justify-center">
              <Button size="lg" onClick={handleWatchTrailer} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white">
                <Youtube className="h-6 w-6 mr-2" />
                Ver Trailer
              </Button>
            </div>}
        </div>

        <div className="px-4 space-y-6 -mt-20 relative z-10">
          {/* Title and Badges */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {item.nome}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1">
                {item.tipo}
              </Badge>
              {item.nota && <Badge variant="secondary" className="bg-gray-800 text-white px-3 py-1">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                  {item.nota}/10
                </Badge>}
              {item.ano && <Badge variant="outline" className="border-gray-600 text-gray-300 px-3 py-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {item.ano}
                </Badge>}
              {item.plataforma && <Badge variant="outline" className="border-gray-600 text-gray-300 px-3 py-1">
                  <Monitor className="h-4 w-4 mr-1" />
                  {item.plataforma}
                </Badge>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {item.link && <Button size="lg" onClick={handleWatchNow} className="bg-red-600 hover:bg-red-700 text-white px-8">
                <Play className="h-5 w-5 mr-2 fill-current" />
                Assistir Agora
              </Button>}
            
            <Button size="lg" variant="outline" onClick={onToggleFavorite} className="border-gray-600 text-white hover:bg-gray-800 px-6">
              <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              {isFavorite ? 'Favoritado' : 'Favoritar'}
            </Button>

            <Button size="lg" variant="outline" onClick={handleShare} className="border-gray-600 text-white hover:bg-gray-800 px-6">
              <Share2 className="h-5 w-5 mr-2" />
              Compartilhar
            </Button>
          </div>

          {/* Synopsis */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">Sinopse</h2>
            <p className="text-gray-300 leading-relaxed text-lg">{item.sinopse}</p>
          </div>

          {/* Benefits */}
          {item.beneficios && <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Por que assistir?</h2>
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <p className="text-green-400 flex items-start text-lg">
                  <span className="mr-2 text-xl">💡</span>
                  {item.beneficios}
                </p>
              </div>
            </div>}

          {/* Platform Info */}
          {item.plataforma && <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Onde assistir</h2>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-6 w-6 text-blue-400" />
                  <span className="text-gray-300 text-lg">{item.plataforma}</span>
                </div>
                {item.link && <Button size="sm" onClick={handleWatchNow} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar
                  </Button>}
              </div>
            </div>}
        </div>
      </div>

      {/* Botão flutuante da Professora IA - Apenas na tela de detalhes */}
      <div className="fixed bottom-20 right-4 z-50">
        
      </div>
    </div>;
};