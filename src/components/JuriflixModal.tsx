import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Heart, 
  Share2, 
  Star, 
  Calendar, 
  Monitor,
  ExternalLink,
  Youtube
} from 'lucide-react';
import { JuriflixItem } from '@/hooks/useJuriflix';

interface JuriflixModalProps {
  item: JuriflixItem;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export const JuriflixModal = ({ 
  item, 
  isOpen, 
  onClose, 
  onToggleFavorite, 
  isFavorite 
}: JuriflixModalProps) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="space-y-0 pb-4">
          <div className="relative">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={item.capa}
                alt={item.nome}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {item.trailer && (
                  <Button
                    size="lg"
                    onClick={handleWatchTrailer}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
                  >
                    <Youtube className="h-5 w-5 mr-2" />
                    Ver Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Badges */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold">{item.nome}</h1>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive" className="bg-red-600">
                {item.tipo}
              </Badge>
              {item.nota && (
                <Badge variant="secondary" className="bg-black/60">
                  <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                  {item.nota}
                </Badge>
              )}
              {item.ano && (
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.ano}
                </Badge>
              )}
              {item.plataforma && (
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  <Monitor className="h-3 w-3 mr-1" />
                  {item.plataforma}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {item.link && (
              <Button size="lg" onClick={handleWatchNow} className="bg-red-600 hover:bg-red-700">
                <Play className="h-5 w-5 mr-2 fill-current" />
                Assistir Agora
              </Button>
            )}
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={onToggleFavorite}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              {isFavorite ? 'Favoritado' : 'Favoritar'}
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              onClick={handleShare}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Compartilhar
            </Button>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Sinopse</h2>
            <p className="text-gray-300 leading-relaxed">{item.sinopse}</p>
          </div>

          {/* Benefits */}
          {item.beneficios && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Por que assistir?</h2>
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <p className="text-green-400 flex items-start">
                  <span className="mr-2 text-lg">💡</span>
                  {item.beneficios}
                </p>
              </div>
            </div>
          )}

          {/* Platform Info */}
          {item.plataforma && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Onde assistir</h2>
              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                <Monitor className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">{item.plataforma}</span>
                {item.link && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleWatchNow}
                    className="ml-auto text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Acessar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};