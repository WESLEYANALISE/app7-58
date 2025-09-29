import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Heart, Star } from 'lucide-react';
import { JuriflixItem } from '@/hooks/useJuriflix';

interface JuriflixRowProps {
  title: string;
  items: JuriflixItem[];
  onItemClick: (item: JuriflixItem) => void;
  onToggleFavorite: (itemId: number) => void;
  favorites: number[];
}

export const JuriflixRow = ({ 
  title, 
  items, 
  onItemClick, 
  onToggleFavorite, 
  favorites 
}: JuriflixRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="group relative">
      <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
      
      <div className="relative">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full bg-black/60 hover:bg-black/80 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full bg-black/60 hover:bg-black/80 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={scrollRight}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Items Container */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <Card
              key={item.id}
              className="group/item relative flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 bg-gray-900 border-gray-700 cursor-pointer hover:scale-105 hover:z-20 hover:border-red-500 transition-all duration-300 overflow-hidden"
              onClick={() => onItemClick(item)}
            >
              <div className="relative aspect-[2/3]">
                <img
                  src={item.capa}
                  alt={item.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>

                {/* Rating Badge */}
                      {item.nota && (
                        <div className="absolute top-2 right-2 bg-black/90 rounded px-2 py-1 flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-white font-medium">{item.nota}</span>
                        </div>
                      )}

                {/* Favorite Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 left-2 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.includes(item.id) 
                        ? 'fill-current text-red-500' 
                        : 'text-white'
                    }`} 
                  />
                </Button>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-white line-clamp-2 mb-1">
                  {item.nome}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{item.ano}</span>
                  {item.tipo && (
                    <>
                      <span>•</span>
                      <span>{item.tipo}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded Info on Hover */}
              <div className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-700 p-3 opacity-0 group-hover/item:opacity-100 transition-opacity shadow-xl z-30">
                <p className="text-xs text-gray-300 line-clamp-3 mb-2">
                  {item.sinopse}
                </p>
                {item.plataforma && (
                  <p className="text-xs text-blue-400">
                    📺 {item.plataforma}
                  </p>
                )}
                {item.beneficios && (
                  <p className="text-xs text-green-400 mt-1">
                    💡 {item.beneficios}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};