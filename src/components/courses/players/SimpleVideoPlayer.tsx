import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Settings, Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeVideoUrl } from '@/utils/videoHelpers';
interface SimpleVideoPlayerProps {
  videoUrl: string;
  title: string;
  subtitle?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onNearEnd?: () => void;
  initialTime?: number;
  autoPlay?: boolean;
  className?: string;
}
export const SimpleVideoPlayer = ({
  videoUrl,
  title,
  subtitle,
  onProgress,
  onEnded,
  onNearEnd,
  initialTime = 0,
  autoPlay = true,
  className = ''
}: SimpleVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoPlayAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  const progressSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [nearEndTriggered, setNearEndTriggered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const MAX_RETRY_ATTEMPTS = 3;

  // Sistema robusto de autoplay com persistência de progresso
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('🎬 Initializing video player for:', title);
    console.log('🔗 Video URL:', normalizeVideoUrl(videoUrl));

    const progressKey = `video_progress_${videoUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Reset states
    setIsLoading(true);
    setHasError(false);
    setPlaying(false);
    autoPlayAttemptedRef.current = false;
    retryCountRef.current = 0;

    const handleLoadedMetadata = () => {
      console.log('📊 Video metadata loaded, duration:', video.duration);
      setDuration(video.duration || 0);
      setIsLoading(false);

      // Aplicar tempo inicial/salvo
      const savedProgress = localStorage.getItem(progressKey);
      const startTime = savedProgress ? parseFloat(savedProgress) : initialTime;
      if (startTime > 0) {
        console.log(`⏰ Resuming from: ${Math.floor(startTime)}s`);
        video.currentTime = startTime;
        setCurrentTime(startTime);
      }

      // Tentar autoplay após carregar metadata
      if (autoPlay && !autoPlayAttemptedRef.current) {
        autoPlayAttemptedRef.current = true;
        console.log('🎯 Attempting autoplay...');
        video.play().then(() => {
          console.log('✅ Autoplay successful');
          setPlaying(true);
        }).catch((error) => {
          console.warn('⚠️ AutoPlay blocked:', error);
          setShowControls(true);
        });
      }
    };

    const handleCanPlay = () => {
      console.log('✅ Video ready to play');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log('🔄 Video loading started');
      setIsLoading(true);
    };

    const handleError = () => {
      console.error('❌ Video load error');
      setIsLoading(false);
      setHasError(true);
    };

    // Configurar volume inicial
    video.volume = volume;
    video.muted = muted;

    // Event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);

    // Force video load
    console.log('🔥 Force loading video...');
    video.load();

    // Cleanup
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl, initialTime, autoPlay, volume, muted, title]);

  // Event listeners principais
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const time = video.currentTime;
      const dur = video.duration || 0;
      setCurrentTime(time);
      onProgress?.(time, dur);

      // Salvar progresso de forma throttled
      const progressKey = `video_progress_${videoUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;
      if (progressSaveTimeoutRef.current) {
        clearTimeout(progressSaveTimeoutRef.current);
      }
      progressSaveTimeoutRef.current = setTimeout(() => {
        if (time > 5) {
          // Só salvar depois de 5 segundos
          localStorage.setItem(progressKey, time.toString());
        }
      }, 2000);

      // Near end detection
      if (dur > 0 && dur - time <= 10 && !nearEndTriggered) {
        setNearEndTriggered(true);
        onNearEnd?.();
      }
    };
    const handleDurationChange = () => {
      const dur = video.duration || 0;
      setDuration(dur);
    };
    const handleEnded = () => {
      setPlaying(false);
      onEnded?.();
    };
    const handlePlay = () => {
      setPlaying(true);
      setIsLoading(false);
    };
    const handlePause = () => {
      setPlaying(false);
    };
    const handleWaiting = () => {
      setIsLoading(true);
    };
    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const networkStateNames = ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'];
      const readyStateNames = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
      console.error('❌ Video error occurred:', {
        networkState: `${video.networkState} (${networkStateNames[video.networkState] || 'UNKNOWN'})`,
        readyState: `${video.readyState} (${readyStateNames[video.readyState] || 'UNKNOWN'})`,
        currentSrc: video.currentSrc,
        videoUrl: videoUrl,
        retryCount: retryCountRef.current
      });
      setIsLoading(false);
      setPlaying(false);
      setHasError(true);

      // Sistema de retry inteligente
      if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current++;
        const retryDelay = retryCountRef.current * 2000; // Aumento progressivo do delay

        console.log(`🔄 Retry attempt ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS} in ${retryDelay}ms`);
        setTimeout(() => {
          if (video && video.error) {
            console.log('🔄 Reloading video...');
            video.load();
            setHasError(false);
            autoPlayAttemptedRef.current = false;
          }
        }, retryDelay);
        toast.error(`Erro no vídeo. Tentativa ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}...`);
      } else {
        console.error('💥 Max retry attempts exceeded');
        toast.error('Não foi possível carregar o vídeo. Verifique sua conexão.');
      }
    };

    // Adicionar listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
    };
  }, [onProgress, onEnded, onNearEnd, nearEndTriggered]);

  // Reset quando URL muda
  useEffect(() => {
    console.log('🔄 Video URL changed, resetting player');
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
    setIsLoading(true);
    setNearEndTriggered(false);
    setHasError(false);
    autoPlayAttemptedRef.current = false;
    retryCountRef.current = 0;

    // Limpar timeout de salvamento de progresso
    if (progressSaveTimeoutRef.current) {
      clearTimeout(progressSaveTimeoutRef.current);
    }
  }, [videoUrl]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (progressSaveTimeoutRef.current) {
        clearTimeout(progressSaveTimeoutRef.current);
      }
    };
  }, []);
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (playing) {
        await video.pause();
        setPlaying(false);
      } else {
        await video.play();
        setPlaying(true);
      }
    } catch (error) {
      console.warn('Play/pause error:', error);
      toast.error('Erro ao reproduzir o vídeo');
    }
  }, [playing]);
  const handleSeek = useCallback((percentage: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const newTime = percentage / 100 * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);
  const skipTime = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    video.currentTime = newTime;
  }, [currentTime, duration]);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  }, []);
  const addBookmark = useCallback(() => {
    const time = Math.floor(currentTime);
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    toast.success(`Marcador adicionado em ${mins}:${secs.toString().padStart(2, '0')}`);
  }, [currentTime]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const progressPercentage = duration > 0 ? currentTime / duration * 100 : 0;
  return <Card className={`overflow-hidden ${className}`}>
      <div ref={containerRef} className="relative bg-black group" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
        <video 
          ref={videoRef} 
          src={normalizeVideoUrl(videoUrl)} 
          className="w-full h-auto max-h-[60vh] bg-black" 
          onClick={togglePlay}
          preload="auto"
          playsInline
          controls={false}
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('🚨 Video element error:', {
              error: e.nativeEvent,
              networkState: videoRef.current?.networkState,
              readyState: videoRef.current?.readyState,
              currentSrc: videoRef.current?.currentSrc
            });
          }}
        />

        {/* Loading overlay */}
        {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
              <p className="text-white text-sm">
                {retryCountRef.current > 0 ? `Tentativa ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}...` : 'Carregando vídeo...'}
              </p>
            </div>
          </div>}

        {/* Error overlay */}
        {hasError && retryCountRef.current >= MAX_RETRY_ATTEMPTS && <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-white text-lg font-semibold">Erro ao carregar vídeo</p>
                <p className="text-white/70 text-sm mt-1">Verifique sua conexão com a internet</p>
              </div>
              <Button variant="outline" onClick={() => {
            retryCountRef.current = 0;
            setHasError(false);
            setIsLoading(true);
            autoPlayAttemptedRef.current = false;
            videoRef.current?.load();
          }} className="border-white/20 text-white hover:bg-white/10">
                Tentar novamente
              </Button>
            </div>
          </div>}

        {/* Controls overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} style={{
        pointerEvents: showControls ? 'auto' : 'none'
      }}>
          {/* Central play button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Button variant="ghost" size="lg" onClick={togglePlay} className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4 border-2 border-white/20">
              {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="relative h-1 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all" onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width * 100;
              handleSeek(Math.max(0, Math.min(100, percentage)));
            }}>
                <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all" style={{
                width: `${progressPercentage}%`
              }} />
              </div>
              <div className="flex justify-between text-xs text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20 p-2">
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <Button variant="ghost" size="sm" onClick={() => skipTime(-10)} className="text-white hover:bg-white/20 p-2">
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={() => skipTime(10)} className="text-white hover:bg-white/20 p-2">
                  <SkipForward className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={() => {
                if (videoRef.current) {
                  const newMuted = !muted;
                  videoRef.current.muted = newMuted;
                  setMuted(newMuted);
                  if (newMuted) {
                    setVolume(0);
                  }
                }
              }} className="text-white hover:bg-white/20 p-2">
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <input type="range" min={0} max={1} step={0.1} value={muted ? 0 : volume} onChange={e => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                setMuted(newVolume === 0);
                if (videoRef.current) {
                  videoRef.current.volume = newVolume;
                  videoRef.current.muted = newVolume === 0;
                }
              }} className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={addBookmark} className="text-white hover:bg-white/20 p-2" title="Adicionar marcador">
                  <BookOpen className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20 p-2" title="Tela cheia">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6 bg-card">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold line-clamp-2 text-foreground">{title}</h3>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Progress value={progressPercentage} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground min-w-fit">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          <div className="flex gap-2">
            
            
          </div>
        </div>
      </CardContent>
    </Card>;
};