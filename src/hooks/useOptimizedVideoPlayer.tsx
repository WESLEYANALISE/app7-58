import { useState, useCallback, useRef, useEffect } from 'react';

interface VideoState {
  playing: boolean;
  played: number;
  playedSeconds: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  buffered: number;
  seeking: boolean;
  ended: boolean;
}

interface UseOptimizedVideoPlayerProps {
  onProgress?: (played: number, playedSeconds: number, duration: number) => void;
  onEnded?: () => void;
  onNearEnd?: () => void;
  initialTime?: number;
  autoPlay?: boolean;
}

export const useOptimizedVideoPlayer = ({
  onProgress,
  onEnded,
  onNearEnd,
  initialTime = 0,
  autoPlay = false
}: UseOptimizedVideoPlayerProps = {}) => {
  const [state, setState] = useState<VideoState>({
    playing: autoPlay,
    played: 0,
    playedSeconds: 0,
    duration: 0,
    volume: 0.8,
    muted: false,
    playbackRate: 1,
    buffered: 0,
    seeking: false,
    ended: false
  });

  const nearEndTriggeredRef = useRef(false);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when video changes
  const resetPlayer = useCallback(() => {
    setState(prev => ({
      ...prev,
      playing: autoPlay,
      played: 0,
      playedSeconds: 0,
      duration: 0,
      buffered: 0,
      seeking: false,
      ended: false
    }));
    nearEndTriggeredRef.current = false;
  }, [autoPlay]);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, playing: true, ended: false }));
  }, []);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, playing: false }));
  }, []);

  const handleProgress = useCallback((progressState: any) => {
    if (state.seeking) return;

    setState(prev => ({
      ...prev,
      played: progressState.played,
      playedSeconds: progressState.playedSeconds,
      buffered: progressState.loaded
    }));

    // Throttle progress callbacks
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    
    progressTimeoutRef.current = setTimeout(() => {
      onProgress?.(progressState.played, progressState.playedSeconds, state.duration);
    }, 1000);

    // Near end detection
    if (
      state.duration > 0 && 
      (state.duration - progressState.playedSeconds) <= 10 && 
      !nearEndTriggeredRef.current
    ) {
      nearEndTriggeredRef.current = true;
      onNearEnd?.();
    }
  }, [state.seeking, state.duration, onProgress, onNearEnd]);

  const handleDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, playing: false, ended: true }));
    onEnded?.();
  }, [onEnded]);

  const handleSeekStart = useCallback(() => {
    setState(prev => ({ ...prev, seeking: true }));
  }, []);

  const handleSeekEnd = useCallback(() => {
    setState(prev => ({ ...prev, seeking: false }));
  }, []);

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, playing: !prev.playing }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ 
      ...prev, 
      volume: Math.max(0, Math.min(1, volume)),
      muted: volume === 0
    }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const seekTo = useCallback((seconds: number) => {
    setState(prev => ({ 
      ...prev, 
      playedSeconds: seconds,
      played: prev.duration > 0 ? seconds / prev.duration : 0
    }));
  }, []);

  const skipTime = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(state.playedSeconds + seconds, state.duration));
    seekTo(newTime);
  }, [state.playedSeconds, state.duration, seekTo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    togglePlay,
    handlePlay,
    handlePause,
    handleProgress,
    handleDuration,
    handleEnded,
    handleSeekStart,
    handleSeekEnd,
    setVolume,
    toggleMute,
    setPlaybackRate,
    seekTo,
    skipTime,
    resetPlayer,
    
    // Utils
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    getProgressPercentage: () => state.played * 100,
    
    isNearEnd: () => state.duration > 0 && (state.duration - state.playedSeconds) <= 30
  };
};