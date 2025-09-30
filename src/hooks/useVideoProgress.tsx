import { useState, useEffect, useCallback } from 'react';

interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  completed: boolean;
  lastWatched: string;
}

export const useVideoProgress = () => {
  const [progress, setProgress] = useState<Record<string, VideoProgress>>({});

  useEffect(() => {
    const stored = localStorage.getItem('course_video_progress');
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading video progress:', e);
      }
    }
  }, []);

  const saveProgress = useCallback((
    videoId: string,
    currentTime: number,
    duration: number
  ) => {
    if (!videoId || !duration) return;

    const percentage = Math.min((currentTime / duration) * 100, 100);
    const completed = percentage >= 90;

    const newProgress: VideoProgress = {
      videoId,
      currentTime,
      duration,
      percentage,
      completed,
      lastWatched: new Date().toISOString()
    };

    setProgress(prev => {
      const updated = { ...prev, [videoId]: newProgress };
      localStorage.setItem('course_video_progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getProgress = useCallback((videoId: string): VideoProgress | null => {
    return progress[videoId] || null;
  }, [progress]);

  const calculateModuleProgress = useCallback((videoIds: string[]): number => {
    if (!videoIds.length) return 0;
    
    const completedCount = videoIds.filter(id => 
      progress[id]?.completed
    ).length;
    
    return (completedCount / videoIds.length) * 100;
  }, [progress]);

  return {
    saveProgress,
    getProgress,
    calculateModuleProgress,
    allProgress: progress
  };
};
