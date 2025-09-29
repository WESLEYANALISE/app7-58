import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, Search, Home, Clock, List, Check, Heart, Headphones, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAudioaulas, AreaData, AudioAula } from '@/hooks/useAudioaulas';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { useAudioProgress } from '@/context/AudioProgressContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AudioPlayerScreen } from '@/components/AudioPlayerScreen';

export const Audioaulas = () => {
  const { areas, audioaulas, loading, error } = useAudioaulas();
  const { playAudio, currentAudio, isPlaying } = useAudioPlayer();
  const { favorites, listened, completed, isFavorite } = useAudioProgress();
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [selectedTema, setSelectedTema] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showPlayerScreen, setShowPlayerScreen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-lg bg-gray-800" />
            <Skeleton className="h-8 w-48 bg-gray-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 text-center">
        <div className="text-red-400 mb-4">Erro ao carregar audioaulas</div>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const handlePlayAudio = (audio: AudioAula, allAudios: AudioAula[]) => {
    console.log('🎵 Clicou para reproduzir:', audio.titulo);
    playAudio(audio, allAudios);
    setShowPlayerScreen(true);
  };

  const handleBack = () => {
    if (showPlayerScreen) {
      setShowPlayerScreen(false);
    } else if (selectedTema) {
      setSelectedTema(null);
    } else if (selectedArea) {
      setSelectedArea(null);
    }
  };

  const getAreaColor = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-600 to-blue-700',
      'bg-gradient-to-br from-pink-600 to-pink-700', 
      'bg-gradient-to-br from-purple-600 to-purple-700',
      'bg-gradient-to-br from-green-600 to-green-700',
      'bg-gradient-to-br from-orange-600 to-orange-700',
      'bg-gradient-to-br from-indigo-600 to-indigo-700',
    ];
    return colors[index % colors.length];
  };

  // Filtrar áudios baseado na busca e aba ativa
  const getFilteredAudios = () => {
    let filtered = audioaulas;

    // Filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(audio => 
        audio.titulo.toLowerCase().includes(query) ||
        audio.area.toLowerCase().includes(query) ||
        audio.tema.toLowerCase().includes(query) ||
        audio.descricao?.toLowerCase().includes(query)
      );
    }

    // Filtro por aba
    switch (activeTab) {
      case 'favoritos':
        filtered = filtered.filter(audio => isFavorite(audio.id));
        break;
      case 'novos':
        // Últimos 30 dias ou últimos adicionados
        filtered = filtered.slice(0, 10);
        break;
      case 'progresso':
        filtered = filtered.filter(audio => listened.includes(audio.id) && !completed.includes(audio.id));
        break;
      case 'concluidos':
        filtered = filtered.filter(audio => completed.includes(audio.id));
        break;
      default:
        // home - todos os áudios
        break;
    }

    return filtered;
  };

  const filteredAudios = getFilteredAudios();

  // Se está mostrando o player completo
  if (showPlayerScreen && selectedArea && selectedTema) {
    const temasAudios = selectedArea.temas[selectedTema] || [];
    return (
      <AudioPlayerScreen 
        onBack={handleBack}
        playlist={temasAudios}
      />
    );
  }

  // Se tem busca ativa ou aba diferente de home, mostrar resultados filtrados
  if (searchQuery.trim() || activeTab !== 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('home');
                }}
                className="p-2 hover:bg-gray-800 text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">
                {activeTab === 'favoritos' && 'Favoritos'}
                {activeTab === 'novos' && 'Novos Episódios'}
                {activeTab === 'progresso' && 'Em Progresso'}
                {activeTab === 'concluidos' && 'Concluídos'}
                {searchQuery && 'Resultados da Busca'}
                {!searchQuery && activeTab === 'home' && 'Áudio-aulas'}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {filteredAudios.length === 0 ? (
            <div className="text-center py-12">
              <Headphones className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhum áudio encontrado</p>
              <p className="text-gray-500 text-sm">Tente outros termos de busca</p>
            </div>
          ) : (
            filteredAudios.map((audio) => {
              const isCurrentPlaying = currentAudio?.id === audio.id && isPlaying;
              const audioIsFavorite = isFavorite(audio.id);
              const isCompleted = completed.includes(audio.id);
              
              return (
                <Card 
                  key={audio.id}
                  className="bg-gray-800 border-gray-700 p-4 cursor-pointer hover:bg-gray-750 transition-all duration-200"
                  onClick={() => {
                    const areaAudios = audioaulas.filter(a => a.area === audio.area);
                    handlePlayAudio(audio, areaAudios);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {audio.imagem_miniatura ? (
                        <img 
                          src={audio.imagem_miniatura} 
                          alt={audio.titulo}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center ${audio.imagem_miniatura ? 'hidden' : ''}`}>
                        <Headphones className="h-6 w-6 text-white" />
                      </div>
                      
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 truncate">{audio.titulo}</h3>
                      <p className="text-sm text-gray-400 truncate mb-1">{audio.area} • {audio.tema}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>#{audio.sequencia}</span>
                        {audioIsFavorite && <Heart className="h-3 w-3 text-red-500 fill-current" />}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const areaAudios = audioaulas.filter(a => a.area === audio.area);
                        handlePlayAudio(audio, areaAudios);
                      }}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Lista de áreas (tela principal)
  if (!selectedArea) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-800 text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Áudio-aulas</h1>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Logo e Busca */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Direito em Áudio</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar episódios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>
          </div>

          {/* Navegação */}
          <div className="flex justify-between items-center px-2">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'novos', icon: Clock, label: 'Novos' },
              { id: 'progresso', icon: List, label: 'Progresso' },
              { id: 'concluidos', icon: Check, label: 'Concluídos' },
              { id: 'favoritos', icon: Heart, label: 'Favoritos' },
            ].map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1 p-2 h-auto ${
                  activeTab === id ? 'text-red-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>

          {/* Áreas do Direito */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-white">Áreas do Direito</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {areas.map((area, index) => {
                const totalAudios = Object.values(area.temas).reduce((acc, audios) => acc + audios.length, 0);
                
                return (
                  <Card 
                    key={area.area}
                    className={`${getAreaColor(index)} border-0 p-4 cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg`}
                    onClick={() => setSelectedArea(area)}
                  >
                    <div className="text-white">
                      <div className="mb-3">
                        <BookOpen className="h-8 w-8 text-white/90" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1 leading-tight">{area.area}</h4>
                      <p className="text-xs text-white/80">{totalAudios} episódio{totalAudios !== 1 ? 's' : ''}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lista de temas da área selecionada
  if (!selectedTema) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{selectedArea.area}</h1>
                <p className="text-xs text-gray-400">Escolha um tema</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(selectedArea.temas).map(([tema, audios], index) => (
              <Card 
                key={tema}
                className="bg-gray-800 border-gray-700 p-4 cursor-pointer hover:bg-gray-750 transition-all duration-200"
                onClick={() => setSelectedTema(tema)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${getAreaColor(index)} rounded-lg flex items-center justify-center`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{tema}</h3>
                    <p className="text-sm text-gray-400">{audios.length} episódio{audios.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Lista de aulas do tema selecionado
  const temasAudios = selectedArea.temas[selectedTema] || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 hover:bg-gray-800 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{selectedTema}</h1>
              <p className="text-xs text-gray-400">{selectedArea.area}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {temasAudios.map((audio, index) => {
          const isCurrentPlaying = currentAudio?.id === audio.id && isPlaying;
          
          return (
            <Card 
              key={audio.id}
              className="bg-gray-800 border-gray-700 p-4 cursor-pointer hover:bg-gray-750 transition-all duration-200"
              onClick={() => handlePlayAudio(audio, temasAudios)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {audio.imagem_miniatura ? (
                    <img 
                      src={audio.imagem_miniatura} 
                      alt={audio.titulo}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center ${audio.imagem_miniatura ? 'hidden' : ''}`}>
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    {isCurrentPlaying ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 truncate">{audio.titulo}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-1">{audio.descricao}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>#{audio.sequencia}</span>
                    {audio.tag && (
                      <span className="px-2 py-1 bg-gray-700 rounded-full">
                        {audio.tag}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio(audio, temasAudios);
                  }}
                >
                  {isCurrentPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};