import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Search, 
  Play, 
  Star, 
  Calendar,
  Monitor,
  Heart,
  Bot
} from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useJuriflix, JuriflixItem } from '@/hooks/useJuriflix';
import { JuriflixHero } from '@/components/JuriflixHero';
import { JuriflixRow } from '@/components/JuriflixRow';
import { JuriflixDetail } from '@/components/JuriflixDetail';
import { FloatingProfessoraButton } from '@/components/FloatingProfessoraButton';

export const Juriflix = () => {
  const { setCurrentFunction } = useNavigation();
  const {
    items,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    types,
    itemsByType,
    featuredItems
  } = useJuriflix();

  const [selectedItem, setSelectedItem] = useState<JuriflixItem | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const handleItemClick = (item: JuriflixItem) => {
    setSelectedItem(item);
  };

  const handleDetailBack = () => {
    setSelectedItem(null);
  };

  const toggleFavorite = (itemId: number) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Se um item está selecionado, mostrar a página de detalhes
  if (selectedItem) {
    return (
      <JuriflixDetail
        item={selectedItem}
        onBack={handleDetailBack}
        onToggleFavorite={() => toggleFavorite(selectedItem.id)}
        isFavorite={favorites.includes(selectedItem.id)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 h-16">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
            <h1 className="ml-4 text-xl font-bold text-red-500">Juriflix</h1>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          <Skeleton className="h-[400px] w-full bg-gray-800" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-48 bg-gray-800" />
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5].map(j => (
                    <Skeleton key={j} className="h-72 w-48 flex-shrink-0 bg-gray-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-white">Erro ao carregar</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between h-14 sm:h-16 px-2 sm:px-4">
          <div className="flex items-center min-w-0">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:bg-gray-800 shrink-0">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-bold text-red-500 truncate">
              Juriflix
            </h1>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-1 sm:gap-2 px-2 sm:px-4 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide">
          {types.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={`whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                selectedType === type 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="pb-24">
        {/* Hero Section */}
        {featuredItems.length > 0 && (
          <JuriflixHero 
            item={featuredItems[0]} 
            onPlay={() => handleItemClick(featuredItems[0])}
            onToggleFavorite={() => toggleFavorite(featuredItems[0].id)}
            isFavorite={favorites.includes(featuredItems[0].id)}
          />
        )}

        {/* Barra de Pesquisa - Mais visível após o hero */}
        <div className="px-2 sm:px-4 py-4 sm:py-6 bg-gray-900/50">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                placeholder="Buscar filmes, séries e documentários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-10 sm:h-12 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Seções por Tipo */}
        <div className="space-y-6 sm:space-y-8 px-2 sm:px-4">
          {searchTerm || selectedType !== 'Todos' ? (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white px-2">
                {searchTerm ? `Resultados para "${searchTerm}"` : selectedType}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3">
                {items.map(item => (
                  <Card 
                    key={item.id}
                    className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden bg-gray-900 border-gray-700 hover:border-red-500"
                    onClick={() => handleItemClick(item)}
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
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      {item.nota && (
                        <div className="absolute top-2 right-2 bg-black/90 rounded px-2 py-1 flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-white font-medium">{item.nota}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-1 sm:p-2">
                      <h3 className="font-medium text-[10px] sm:text-xs line-clamp-2 text-white leading-tight">{item.nome}</h3>
                      <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{item.ano}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Em Destaque */}
              {featuredItems.length > 1 && (
                <JuriflixRow
                  title="Em Destaque"
                  items={featuredItems.slice(1)}
                  onItemClick={handleItemClick}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              )}

              {/* Por Tipo */}
              {Object.entries(itemsByType).map(([type, typeItems]) => (
                typeItems.length > 0 && (
                  <JuriflixRow
                    key={type}
                    title={type}
                    items={typeItems}
                    onItemClick={handleItemClick}
                    onToggleFavorite={toggleFavorite}
                    favorites={favorites}
                  />
                )
              ))}

              {/* Favoritos */}
              {favorites.length > 0 && (
                <JuriflixRow
                  title="Meus Favoritos"
                  items={items.filter(item => favorites.includes(item.id))}
                  onItemClick={handleItemClick}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};