import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, Star, Calendar, Monitor } from 'lucide-react';
import { JuriflixItem } from '@/hooks/useJuriflix';

interface JuriflixHeroProps {
  item: JuriflixItem;
  onPlay: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export const JuriflixHero = ({ item, onPlay, onToggleFavorite, isFavorite }: JuriflixHeroProps) => {
  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${item.capa})`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-8 left-4 right-4 md:left-8 md:right-8 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1">
              {item.tipo}
            </Badge>
            {item.nota && (
              <Badge variant="secondary" className="bg-gray-800 text-white px-3 py-1">
                <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                {item.nota}/10
              </Badge>
            )}
            {item.ano && (
              <Badge variant="outline" className="border-gray-600 text-white px-3 py-1">
                <Calendar className="h-4 w-4 mr-1" />
                {item.ano}
              </Badge>
            )}
            {item.plataforma && (
              <Badge variant="outline" className="border-gray-600 text-white px-3 py-1">
                <Monitor className="h-4 w-4 mr-1" />
                {item.plataforma}
              </Badge>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            {item.nome}
          </h1>
          
          {/* Description */}
          <p className="text-white/90 text-lg md:text-xl leading-relaxed line-clamp-3 max-w-3xl">
            {item.sinopse}
          </p>
          
          {/* Benefits */}
          {item.beneficios && (
            <p className="text-green-400 text-base md:text-lg font-medium">
              💡 {item.beneficios}
            </p>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <Button 
              size="lg" 
              onClick={onPlay}
              className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 text-lg"
            >
              <Play className="h-6 w-6 mr-2 fill-current" />
              Assistir
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={onToggleFavorite}
              className="border-gray-600 text-white hover:bg-gray-800 px-6 py-3 text-lg"
            >
              <Heart className={`h-6 w-6 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              {isFavorite ? 'Favoritado' : 'Favoritar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};