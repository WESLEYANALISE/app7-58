import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  completed: boolean;
  lastWatched: string;
}

export const useVideoProgress = (videoId: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<VideoProgress>({
    videoId,
    currentTime: 0,
    duration: 0,
    percentage: 0,
    completed: false,
    lastWatched: new Date().toISOString()
  });

  const storageKey = `video_progress_${user?.id}_${videoId}`;

  // Carregar progresso salvo
  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      } catch (error) {
        console.error('Error loading video progress:', error);
      }
    }
  }, [storageKey]);

  // Salvar progresso (debounced)
  const saveProgress = useCallback((currentTime: number, duration: number) => {
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const completed = percentage >= 90; // Considera completo se assistiu 90%

    const newProgress: VideoProgress = {
      videoId,
      currentTime,
      duration,
      percentage,
      completed,
      lastWatched: new Date().toISOString()
    };

    setProgress(newProgress);
    localStorage.setItem(storageKey, JSON.stringify(newProgress));
  }, [videoId, storageKey]);

  // Resetar progresso
  const resetProgress = useCallback(() => {
    const newProgress: VideoProgress = {
      videoId,
      currentTime: 0,
      duration: 0,
      percentage: 0,
      completed: false,
      lastWatched: new Date().toISOString()
    };
    setProgress(newProgress);
    localStorage.setItem(storageKey, JSON.stringify(newProgress));
  }, [videoId, storageKey]);

  return {
    progress,
    saveProgress,
    resetProgress
  };
};

// Hook para calcular progresso de módulo/área
export const useModuleProgress = (courseId: string, moduleId: string) => {
  const { user } = useAuth();
  const [videoProgresses, setVideoProgresses] = useState<VideoProgress[]>([]);

  useEffect(() => {
    // Carregar todos os progressos de vídeos do módulo
    const loadModuleProgress = () => {
      const allKeys = Object.keys(localStorage);
      const moduleKeys = allKeys.filter(key => 
        key.startsWith(`video_progress_${user?.id}`) && 
        key.includes(moduleId)
      );

      const progresses: VideoProgress[] = [];
      moduleKeys.forEach(key => {
        try {
          const progress = JSON.parse(localStorage.getItem(key) || '{}');
          progresses.push(progress);
        } catch (error) {
          console.error('Error loading module progress:', error);
        }
      });

      setVideoProgresses(progresses);
    };

    loadModuleProgress();
  }, [user?.id, moduleId]);

  const calculateModuleProgress = useCallback(() => {
    if (videoProgresses.length === 0) return 0;
    
    const totalPercentage = videoProgresses.reduce((acc, p) => acc + p.percentage, 0);
    return totalPercentage / videoProgresses.length;
  }, [videoProgresses]);

  const completedVideos = videoProgresses.filter(p => p.completed).length;
  const totalVideos = videoProgresses.length;

  return {
    moduleProgress: calculateModuleProgress(),
    completedVideos,
    totalVideos,
    videoProgresses
  };
};
