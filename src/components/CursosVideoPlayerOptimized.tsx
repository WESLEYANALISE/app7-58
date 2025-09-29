import { useEffect, useRef, useState, useCallback, useMemo, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipForward, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LessonActionButtons } from '@/components/Cursos/LessonActionButtons';
import { normalizeVideoUrl, getVideoType } from '@/utils/videoHelpers';
import { useMediaManager } from '@/context/MediaManagerContext';
import { useDebouncedCallback } from 'use-debounce';

interface CursosVideoPlayerOptimizedProps {
  videoUrl: string;
  title: string;
  subtitle?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  onEnded?: () => void;
  onNearEnd?: () => void;
  autoPlay?: boolean;
  lesson?: {
    id: number;
    area: string;
    tema: string;
    assunto: string;
    conteudo?: string;
  };
}

export const CursosVideoPlayerOptimized = ({
  videoUrl,
  title,
  subtitle,
  onProgress,
  initialTime = 0,
  onEnded,
  onNearEnd,
  autoPlay = true,
  lesson
}: CursosVideoPlayerOptimizedProps) => {
  const playerId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { registerVideoPlayer, unregisterPlayer, setCurrentPlaying } = useMediaManager();
  
  // Estados otimizados
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    showControls: true,
    playbackRate: 1,
    isLoading: true,
    hasError: false,
    errorMessage: '',
    showNextLessonAlert: false,
    nearEndTriggered: false,
    autoAdvanceCountdown: 5
  });

  // Memoização de valores computados
  const progressPercentage = useMemo(() => 
    playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0, 
    [playerState.currentTime, playerState.duration]
  );

  const videoType = useMemo(() => getVideoType(videoUrl), [videoUrl]);
  const shouldUseCrossOrigin = useMemo(() => 
    videoType !== 'dropbox' && videoType !== 'unknown', 
    [videoType]
  );

  // Debounced callbacks para performance
  const debouncedProgress = useDebouncedCallback(
    (currentTime: number, duration: number) => {
      onProgress?.(currentTime, duration);
    },
    100
  );

  // Cleanup rigoroso
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Registra o player no gerenciador global
    registerVideoPlayer(playerId, video);

    return () => {
      unregisterPlayer(playerId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [playerId, registerVideoPlayer, unregisterPlayer]);

  // Event listeners otimizados com AbortController
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cleanup anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      const videoDuration = video.duration;
      
      setPlayerState(prev => ({ ...prev, currentTime: time }));
      debouncedProgress(time, videoDuration);

      // Near end logic
      if (videoDuration > 0 && videoDuration - time <= 3 && !playerState.nearEndTriggered) {
        setPlayerState(prev => ({ 
          ...prev, 
          nearEndTriggered: true,
          showNextLessonAlert: true 
        }));
        onNearEnd?.();
        debouncedProgress(videoDuration, videoDuration);
      }
    };

    const handleDurationChange = () => {
      setPlayerState(prev => ({ ...prev, duration: video.duration }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        showNextLessonAlert: !prev.showNextLessonAlert 
      }));
    };

    const handleLoadedMetadata = () => {
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        isLoading: false 
      }));
      video.muted = false;
    };

    const handleCanPlay = () => {
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      setPlayerState(prev => ({ ...prev, isLoading: false }));
    };

    const handleError = () => {
      setPlayerState(prev => ({ 
        ...prev,
        hasError: true,
        isLoading: false,
        errorMessage: 'Não foi possível reproduzir o vídeo'
      }));
    };

    const handlePlay = () => {
      setCurrentPlaying(playerId);
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    // Adicionar event listeners com signal
    video.addEventListener('timeupdate', handleTimeUpdate, { signal });
    video.addEventListener('durationchange', handleDurationChange, { signal });
    video.addEventListener('ended', handleEnded, { signal });
    video.addEventListener('loadedmetadata', handleLoadedMetadata, { signal });
    video.addEventListener('canplay', handleCanPlay, { signal });
    video.addEventListener('error', handleError, { signal });
    video.addEventListener('play', handlePlay, { signal });
    video.addEventListener('pause', handlePause, { signal });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [initialTime, onProgress, onEnded, onNearEnd, playerId, setCurrentPlaying, debouncedProgress, playerState.nearEndTriggered, playerState.showNextLessonAlert]);

  // Auto-advance countdown
  useEffect(() => {
    if (!playerState.showNextLessonAlert || playerState.autoAdvanceCountdown <= 0) return;

    const interval = setInterval(() => {
      setPlayerState(prev => {
        if (prev.autoAdvanceCountdown === 1) {
          onEnded?.();
          return {
            ...prev,
            showNextLessonAlert: false,
            autoAdvanceCountdown: 5
          };
        }
        return { ...prev, autoAdvanceCountdown: prev.autoAdvanceCountdown - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playerState.showNextLessonAlert, playerState.autoAdvanceCountdown, onEnded]);

  // Autoplay otimizado
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    let timeoutId: NodeJS.Timeout;
    
    const attemptAutoplay = async () => {
      try {
        if (video.readyState >= 3) {
          await video.play();
        }
      } catch (error) {
        console.warn('Autoplay blocked by browser:', error);
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handleCanPlayThrough = () => {
      timeoutId = setTimeout(attemptAutoplay, 100);
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough);
    
    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [videoUrl, autoPlay]);

  // Reset states quando vídeo muda
  useEffect(() => {
    setPlayerState(prev => ({
      ...prev,
      nearEndTriggered: false,
      showNextLessonAlert: false,
      autoAdvanceCountdown: 5,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isLoading: true,
      hasError: false,
      errorMessage: ''
    }));
  }, [videoUrl]);

  // Handlers otimizados com useCallback
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (playerState.isPlaying) {
        video.pause();
      } else {
        setCurrentPlaying(playerId);
        await video.play();
      }
    } catch (error) {
      console.warn('Play/pause error:', error);
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [playerState.isPlaying, playerId, setCurrentPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !playerState.isMuted;
    video.muted = newMuted;
    setPlayerState(prev => ({ ...prev, isMuted: newMuted }));
  }, [playerState.isMuted]);

  const handleVolumeChange = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value / 100;
    video.volume = newVolume;
    setPlayerState(prev => ({ 
      ...prev, 
      volume: newVolume,
      isMuted: newVolume === 0 
    }));
  }, []);

  const handleSeek = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value / 100) * playerState.duration;
    video.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  }, [playerState.duration]);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, playerState.duration);
  }, [playerState.duration]);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setPlayerState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setPlayerState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const changePlaybackRate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playerState.playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    video.playbackRate = nextRate;
    setPlayerState(prev => ({ ...prev, playbackRate: nextRate }));
  }, [playerState.playbackRate]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleRetryVideo = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      hasError: false,
      isLoading: true,
      errorMessage: ''
    }));
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const handleOpenInDropbox = useCallback(() => {
    window.open(normalizeVideoUrl(videoUrl), '_blank');
  }, [videoUrl]);

  return (
    <div className="space-y-4">
      <div 
        className="relative bg-black overflow-hidden group w-full"
        onMouseEnter={() => setPlayerState(prev => ({ ...prev, showControls: true }))}
        onMouseLeave={() => setPlayerState(prev => ({ ...prev, showControls: false }))}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={normalizeVideoUrl(videoUrl)}
          className="w-full h-auto bg-black"
          onClick={togglePlay}
          onLoadStart={() => setPlayerState(prev => ({ ...prev, isLoading: true }))}
          preload="metadata"
          playsInline
          controls={false}
          {...(shouldUseCrossOrigin && { crossOrigin: "anonymous" })}
        />

        {/* Loading Indicator */}
        {playerState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error State */}
        {playerState.hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <p className="text-white mb-4">{playerState.errorMessage}</p>
              <div className="space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handleRetryVideo}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Tentar novamente
                </Button>
                {videoType === 'dropbox' && (
                  <Button 
                    variant="outline" 
                    onClick={handleOpenInDropbox}
                    className="text-white border-white hover:bg-white hover:text-black"
                  >
                    Abrir no Dropbox
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls Overlay - Hidden when playing */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            playerState.showControls && !playerState.isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress 
              value={progressPercentage} 
              className="h-1 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                handleSeek(percentage);
              }}
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>{formatTime(playerState.duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={togglePlay}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {playerState.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={skipBackward}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={skipForward}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {playerState.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playerState.isMuted ? 0 : playerState.volume * 100}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  onMouseDown={() => videoRef.current && (videoRef.current.muted = false)}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none slider"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={changePlaybackRate}
                className="text-white hover:text-white hover:bg-white/20 text-xs font-mono"
              >
                {playerState.playbackRate}x
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Center Play Button (when paused) */}
        {!playerState.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="lg"
              onClick={togglePlay}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4"
            >
              <Play className="h-8 w-8" />
            </Button>
          </div>
        )}

        {/* Next Lesson Alert */}
        {playerState.showNextLessonAlert && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
              <Alert className="mb-4">
                <ChevronRight className="h-4 w-4" />
                <AlertDescription>
                  Aula concluída! Avançando para a próxima aula em {playerState.autoAdvanceCountdown} segundos...
                </AlertDescription>
              </Alert>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    setPlayerState(prev => ({ ...prev, showNextLessonAlert: false }));
                    onEnded?.();
                  }}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  Próxima Aula
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setPlayerState(prev => ({ ...prev, showNextLessonAlert: false }))}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Information */}
      <div className="bg-card rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {subtitle && <p className="text-muted-foreground mb-4">{subtitle}</p>}
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {lesson && <LessonActionButtons lesson={lesson} />}
      </div>
    </div>
  );
};