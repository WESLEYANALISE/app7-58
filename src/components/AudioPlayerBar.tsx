import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  X,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { Card } from '@/components/ui/card';

export const AudioPlayerBar = () => {
  const {
    currentAudio,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    isVisible,
    togglePlayPause,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    hidePlayer,
    playlist,
    currentIndex
  } = useAudioPlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);

  if (!isVisible || !currentAudio) {
    return null;
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  console.log('🎵 AudioPlayerBar - isVisible:', isVisible, 'currentAudio:', currentAudio?.titulo);

  const hasNext = playlist.length > 0 && currentIndex < playlist.length - 1;
  const hasPrevious = playlist.length > 0 && currentIndex > 0;

  const handleCardClick = () => {
    // Aqui você pode adicionar lógica para abrir o player completo se necessário
    console.log('Audio player card clicked');
  };

  return (
    <Card 
      className="fixed bottom-24 left-0 right-0 z-40 bg-background border-t border-border/50 shadow-2xl cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4">
        {/* Barra de progresso */}
        <div className="mb-4">
          <div 
            className="w-full h-1 bg-muted rounded-full cursor-pointer relative overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              const newTime = percentage * duration;
              seekTo(newTime);
            }}
          >
            <div 
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Animação de onda durante reprodução */}
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 animate-pulse" />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles principais */}
        <div className="flex items-center gap-4">
          {/* Informações da música */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              {currentAudio.imagem_miniatura ? (
                <img 
                  src={currentAudio.imagem_miniatura}
                  alt={currentAudio.titulo}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center ${currentAudio.imagem_miniatura ? 'hidden' : ''}`}>
                <Music className="h-6 w-6 text-primary" />
              </div>
              {/* Animação de pulso durante reprodução */}
              {isPlaying && (
                <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">{currentAudio.titulo}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentAudio.tema}</p>
            </div>
          </div>

          {/* Controles centrais */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-accent/80"
              onClick={previousTrack}
              disabled={!hasPrevious}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              className="p-3 rounded-full hover:scale-105 transition-transform"
              onClick={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-accent/80"
              onClick={nextTrack}
              disabled={!hasNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Controles de volume e ações */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-accent/80"
                onClick={handleVolumeToggle}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-accent/80"
              onClick={hidePlayer}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};