import { useEffect, useRef, useState, useCallback, useMemo, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipForward, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LessonActionButtons } from '@/components/Cursos/LessonActionButtons';
import { normalizeVideoUrl, getVideoType } from '@/utils/videoHelpers';
import { useMediaManager } from '@/context/MediaManagerContext';

interface CursosVideoPlayerProps {
  videoUrl: string;
  title: string;
  subtitle?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  onEnded?: () => void;
  onNearEnd?: () => void; // Callback quando faltam 3 segundos
  autoPlay?: boolean;
  lesson?: {
    id: number;
    area: string;
    tema: string;
    assunto: string;
    conteudo?: string;
  };
}

export const CursosVideoPlayer = ({
  videoUrl,
  title,
  subtitle,
  onProgress,
  initialTime = 0,
  onEnded,
  onNearEnd,
  autoPlay = true,
  lesson
}: CursosVideoPlayerProps) => {
  const playerId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { registerVideoPlayer, unregisterPlayer, setCurrentPlaying } = useMediaManager();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNextLessonAlert, setShowNextLessonAlert] = useState(false);
  const [nearEndTriggered, setNearEndTriggered] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-advance countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showNextLessonAlert && autoAdvanceCountdown > 0) {
      interval = setInterval(() => {
        setAutoAdvanceCountdown(prev => {
          if (prev === 1) {
            // Auto advance to next lesson
            onEnded?.();
            setShowNextLessonAlert(false);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showNextLessonAlert, autoAdvanceCountdown, onEnded]);

  // Cleanup e registro do player
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

  // Event listeners com AbortController para cleanup rigoroso
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
      setCurrentTime(time);
      onProgress?.(time, videoDuration);

      // Check if we're within 3 seconds of the end
      if (videoDuration > 0 && videoDuration - time <= 3 && !nearEndTriggered) {
        setNearEndTriggered(true);
        setShowNextLessonAlert(true);
        onNearEnd?.();
        // Mark as 100% complete when 3 seconds remaining
        onProgress?.(videoDuration, videoDuration);
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!showNextLessonAlert) {
        setShowNextLessonAlert(true);
      }
    };

    const handleLoadedMetadata = () => {
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      setIsPlaying(false);
      video.muted = false;
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      setIsLoading(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      setErrorMessage('Não foi possível reproduzir o vídeo');
    };

    const handlePlay = () => {
      setCurrentPlaying(playerId);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    // Adicionar event listeners com signal para cleanup automático
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
  }, [initialTime, onProgress, onEnded, onNearEnd, nearEndTriggered, showNextLessonAlert, playerId, setCurrentPlaying]);

  // Separate autoplay logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    let timeoutId: NodeJS.Timeout;
    
    const attemptAutoplay = async () => {
      try {
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA
          await video.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.warn('Autoplay blocked by browser:', error);
        setIsPlaying(false);
      }
    };

    const handleCanPlayThrough = () => {
      // Use timeout to avoid conflicts with other event handlers
      timeoutId = setTimeout(attemptAutoplay, 100);
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough);
    
    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [videoUrl, autoPlay]);

  // Reset states when video changes
  useEffect(() => {
    setNearEndTriggered(false);
    setShowNextLessonAlert(false);
    setAutoAdvanceCountdown(5);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
  }, [videoUrl]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        setCurrentPlaying(playerId);
        await video.play();
      }
    } catch (error) {
      console.warn('Play/pause error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, playerId, setCurrentPlaying]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleRetryVideo = () => {
    setHasError(false);
    setIsLoading(true);
    setErrorMessage('');
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleOpenInDropbox = () => {
    window.open(normalizeVideoUrl(videoUrl), '_blank');
  };

  const videoType = getVideoType(videoUrl);
  const shouldUseCrossOrigin = videoType !== 'dropbox' && videoType !== 'unknown';

  return (
    <div className="space-y-4">
      <div 
        className="relative bg-black overflow-hidden group w-full"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
       {/* Video Element */}
      <video
        ref={videoRef}
        src={normalizeVideoUrl(videoUrl)}
        className="w-full h-auto bg-black"
        onClick={togglePlay}
        onLoadStart={() => {
          setIsLoading(true);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
        playsInline
        controls={false}
        {...(shouldUseCrossOrigin && { crossOrigin: "anonymous" })}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center p-6">
            <p className="text-white mb-4">{errorMessage}</p>
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
          showControls && !isPlaying ? 'opacity-100' : 'opacity-0'
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
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={togglePlay}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Skip Backward */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={skipBackward}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Skip Forward */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={skipForward}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleMute}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                onMouseDown={() => videoRef.current && (videoRef.current.muted = false)}
                className="w-16 h-1 bg-white/30 rounded-lg appearance-none slider"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Playback Rate */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={changePlaybackRate}
              className="text-white hover:text-white hover:bg-white/20 text-xs font-mono"
            >
              {playbackRate}x
            </Button>

            {/* Fullscreen */}
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
      {!isPlaying && (
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
      {showNextLessonAlert && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <Alert className="mb-4">
              <ChevronRight className="h-4 w-4" />
              <AlertDescription>
                Aula concluída! Avançando para a próxima aula em {autoAdvanceCountdown} segundos...
              </AlertDescription>
            </Alert>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => {
                  setShowNextLessonAlert(false);
                  onEnded?.();
                }}
                className="flex items-center gap-2"
              >
                <ChevronRight className="h-4 w-4" />
                Próxima Aula
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowNextLessonAlert(false);
                  setAutoAdvanceCountdown(5);
                }}
              >
                Ficar na Aula
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Botões de Ação da Aula */}
      {lesson && (
        <LessonActionButtons lesson={lesson} />
      )}
    </div>
  );
};