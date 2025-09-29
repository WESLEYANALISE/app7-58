import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Maximize, Settings, Bookmark, BookOpen, Download
} from 'lucide-react';
import { normalizeVideoUrl, getVideoType } from '@/utils/videoHelpers';
import { useToast } from '@/hooks/use-toast';
import { useMediaManager } from '@/context/MediaManagerContext';

interface OptimizedCoursePlayerProps {
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

export const OptimizedCoursePlayer = ({
  videoUrl,
  title,
  subtitle,
  onProgress,
  onEnded,
  onNearEnd,
  initialTime = 0,
  autoPlay = false,
  className = ""
}: OptimizedCoursePlayerProps) => {
  const playerId = useId();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { registerVideoPlayer, unregisterPlayer, setCurrentPlaying } = useMediaManager();

  const normalizedUrl = normalizeVideoUrl(videoUrl);
  const videoType = getVideoType(videoUrl);

  // Cleanup e registro do player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    registerVideoPlayer(playerId, video);

    return () => {
      unregisterPlayer(playerId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [playerId, registerVideoPlayer, unregisterPlayer]);

  // Event listeners com cleanup rigoroso
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      
      setCurrentTime(current);
      onProgress?.(current, total);

      // Trigger near end when 90% complete
      if (total > 0 && current / total >= 0.9 && onNearEnd) {
        onNearEnd();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handlePlay = () => {
      setCurrentPlaying(playerId);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate, { signal });
    video.addEventListener('loadedmetadata', handleLoadedMetadata, { signal });
    video.addEventListener('ended', handleEnded, { signal });
    video.addEventListener('play', handlePlay, { signal });
    video.addEventListener('pause', handlePause, { signal });
    video.addEventListener('loadstart', () => setLoading(true), { signal });
    video.addEventListener('canplay', () => setLoading(false), { signal });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [onProgress, onEnded, onNearEnd, playerId, setCurrentPlaying]);

  // Reset states quando vídeo muda
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setLoading(false);
    
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [videoUrl, initialTime]);

  const handlePlayPause = useCallback(async () => {
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

  const handleSeek = useCallback((value: number) => {
    if (!videoRef.current) return;
    const newTime = (value / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeChange = (value: number) => {
    if (!videoRef.current) return;
    const newVolume = value / 100;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const addBookmark = () => {
    toast({
      title: "Marcador adicionado!",
      description: `Posição salva em ${formatTime(currentTime)}`,
    });
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`overflow-hidden bg-black text-white ${className}`}>
      <div ref={containerRef} className="relative group">
        {/* Video Element */}
        <div className="relative aspect-video">
          {videoType === 'youtube' ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoUrl.includes('v=') ? videoUrl.split('v=')[1] : videoUrl.split('/').pop()}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <video
              ref={videoRef}
              src={normalizedUrl}
              className="w-full h-full object-cover"
              autoPlay={autoPlay}
              preload="metadata"
              playsInline
            />
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Controls Overlay */}
          {videoType !== 'youtube' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Progress Bar */}
              <div className="mb-4">
                <div 
                  className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = (x / rect.width) * 100;
                    handleSeek(percentage);
                  }}
                >
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-150"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20 h-10 w-10 p-0"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkip(-10)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkip(10)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-16 h-1 bg-white/30 rounded-lg appearance-none slider"
                    />
                  </div>

                  <span className="text-sm text-white/80">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addBookmark}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <CardContent className="p-6 bg-card text-foreground">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                HD
              </Badge>
            </div>
          </div>

          {/* Progress for entire video */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progresso</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Material
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};