import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, MoreVertical, Volume2, Headphones, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { useAudioProgress } from '@/context/AudioProgressContext';
import { useNavigation } from '@/context/NavigationContext';
import { AudioAula } from '@/hooks/useAudioaulas';
interface AudioPlayerScreenProps {
  onBack: () => void;
  playlist: AudioAula[];
}
export const AudioPlayerScreen: React.FC<AudioPlayerScreenProps> = ({
  onBack,
  playlist
}) => {
  const {
    setCurrentFunction
  } = useNavigation();
  const {
    currentAudio,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    togglePlayPause,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    currentIndex,
    playAudio
  } = useAudioPlayer();
  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    updateProgress
  } = useAudioProgress();
  const [showVolume, setShowVolume] = useState(false);

  // Atualizar progresso do áudio
  useEffect(() => {
    if (currentAudio && duration > 0) {
      const progress = currentTime / duration;
      updateProgress(currentAudio.id, progress);
    }
  }, [currentTime, duration, currentAudio, updateProgress]);
  if (!currentAudio) {
    return null;
  }
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const progressPercentage = duration > 0 ? currentTime / duration * 100 : 0;
  const hasNext = playlist.length > 0 && currentIndex < playlist.length - 1;
  const hasPrevious = playlist.length > 0 && currentIndex > 0;
  const audioIsFavorite = isFavorite(currentAudio.id);
  const handleBackToHome = () => {
    setCurrentFunction(null);
  };
  const handleToggleFavorite = () => {
    if (audioIsFavorite) {
      removeFromFavorites(currentAudio.id);
    } else {
      addToFavorites(currentAudio.id);
    }
  };
  return <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={handleBackToHome} className="p-2 hover:bg-gray-800 text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm text-gray-400">Reproduzindo de</p>
          <p className="font-medium">{currentAudio.tema || 'Audioaulas'}</p>
        </div>
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800 text-white">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center p-6 space-y-6">
          {/* Capa do Áudio */}
          <div className="relative">
            {currentAudio.imagem_miniatura ? <img src={currentAudio.imagem_miniatura} alt={currentAudio.titulo} className="w-72 h-72 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl" onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }} /> : null}
            <div className={`w-72 h-72 md:w-80 md:h-80 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl ${currentAudio.imagem_miniatura ? 'hidden' : ''}`}>
              <Headphones className="h-24 w-24 text-white/90" />
            </div>
            
            {/* Animação de reprodução */}
            {isPlaying && <>
                <div className="absolute inset-0 bg-red-500/20 rounded-2xl animate-pulse" />
                <div className="absolute -inset-4 border-4 border-red-500/30 rounded-3xl animate-ping" />
                <div className="absolute -inset-8 border-2 border-red-500/20 rounded-4xl animate-pulse" style={{
              animationDelay: '0.5s'
            }} />
              </>}
            
            {/* Ícone de reprodução flutuante */}
            {isPlaying && <div className="absolute top-4 right-4 bg-red-500 rounded-full p-2 animate-bounce">
                <Play className="h-4 w-4 text-white fill-current" />
              </div>}
          </div>

          {/* Informações do Áudio */}
          <div className="text-center max-w-md">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              {currentAudio.titulo}
            </h1>
            <p className="text-lg text-gray-400 mb-2">
              {currentAudio.area}
            </p>
            <p className="text-sm text-gray-500">
              #{currentAudio.sequencia} • {currentAudio.tag}
            </p>
          </div>

          {/* Controles de Reprodução */}
          <div className="w-full max-w-md space-y-6">
            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative overflow-hidden" onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              const newTime = percentage * duration;
              seekTo(newTime);
            }}>
                <div className="h-full bg-white rounded-full transition-all duration-100 relative" style={{
                width: `${progressPercentage}%`
              }} />
                {/* Animação de onda durante reprodução */}
                {isPlaying && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 animate-pulse" />}
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controles Principais */}
            <div className="flex items-center justify-center space-x-6">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white">
                <Shuffle className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" onClick={previousTrack} disabled={!hasPrevious} className="p-3 hover:bg-gray-800 text-white disabled:text-gray-600">
                <SkipBack className="h-6 w-6" />
              </Button>

              <Button variant="default" size="lg" onClick={togglePlayPause} disabled={isLoading} className="p-4 rounded-full bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all">
                {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={nextTrack} disabled={!hasNext} className="p-3 hover:bg-gray-800 text-white disabled:text-gray-600">
                <SkipForward className="h-6 w-6" />
              </Button>

              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white">
                <Repeat className="h-5 w-5" />
              </Button>
            </div>

            {/* Controles Secundários */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleToggleFavorite} className={`p-2 hover:bg-gray-800 transition-colors ${audioIsFavorite ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                <Heart className={`h-5 w-5 ${audioIsFavorite ? 'fill-current' : ''}`} />
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowVolume(!showVolume)} className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white">
                  <Volume2 className="h-4 w-4" />
                </Button>
                
                {showVolume && <div className="w-20">
                    <Slider value={[volume]} onValueChange={values => setVolume(values[0])} max={1} step={0.1} className="cursor-pointer" />
                  </div>}
              </div>
            </div>
          </div>

          {/* Descrição do Áudio */}
          {currentAudio.descricao && <div className="w-full max-w-lg px-0">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Sobre este episódio</h3>
                <p className="text-gray-300 leading-relaxed">
                  {currentAudio.descricao}
                </p>
              </Card>
            </div>}

          {/* Lista de Episódios */}
          <div className="w-full max-w-lg px-4 pb-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Próximos episódios</h3>
            <div className="space-y-3">
              {playlist.map((audio, index) => {
              const isCurrentTrack = audio.id === currentAudio.id;
              return <Card key={audio.id} className={`p-4 cursor-pointer transition-all duration-200 border-0 ${isCurrentTrack ? 'bg-red-500/20 border-red-500/30' : 'bg-gray-800 hover:bg-gray-750'}`} onClick={() => !isCurrentTrack && playAudio(audio, playlist)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isCurrentTrack ? 'bg-red-500' : 'bg-gray-700'}`}>
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate ${isCurrentTrack ? 'text-red-400' : 'text-white'}`}>
                          {audio.titulo}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">
                          #{audio.sequencia} • {audio.area}
                        </p>
                      </div>
                      {isCurrentTrack && isPlaying && <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-red-500 animate-bounce" style={{
                      animationDelay: '0s'
                    }} />
                          <div className="w-1 h-4 bg-red-500 animate-bounce" style={{
                      animationDelay: '0.1s'
                    }} />
                          <div className="w-1 h-4 bg-red-500 animate-bounce" style={{
                      animationDelay: '0.2s'
                    }} />
                        </div>}
                    </div>
                  </Card>;
            })}
            </div>
          </div>
        </div>
      </div>
    </div>;
};