import { createContext, useContext, useRef, useCallback, ReactNode } from 'react';

interface MediaManagerContextType {
  stopAllMedia: () => void;
  registerVideoPlayer: (id: string, element: HTMLVideoElement | HTMLAudioElement) => void;
  unregisterPlayer: (id: string) => void;
  getCurrentPlaying: () => string | null;
  setCurrentPlaying: (id: string | null) => void;
}

const MediaManagerContext = createContext<MediaManagerContextType | null>(null);

export const useMediaManager = () => {
  const context = useContext(MediaManagerContext);
  if (!context) {
    throw new Error('useMediaManager deve ser usado dentro do MediaManagerProvider');
  }
  return context;
};

export const MediaManagerProvider = ({ children }: { children: ReactNode }) => {
  const playersRef = useRef<Map<string, HTMLVideoElement | HTMLAudioElement>>(new Map());
  const currentPlayingRef = useRef<string | null>(null);

  const stopAllMedia = useCallback(() => {
    playersRef.current.forEach((element, id) => {
      if (element && !element.paused) {
        element.pause();
        element.currentTime = 0;
      }
    });
    currentPlayingRef.current = null;
  }, []);

  const registerVideoPlayer = useCallback((id: string, element: HTMLVideoElement | HTMLAudioElement) => {
    playersRef.current.set(id, element);
    // Não pausar automaticamente outros players no registro
    // Deixar que o setCurrentPlaying gerencie isso de forma controlada
  }, []);

  const setCurrentPlaying = useCallback((id: string | null) => {
    // Só pausar outros players se explicitamente solicitado
    if (id && currentPlayingRef.current && currentPlayingRef.current !== id) {
      const currentPlayer = playersRef.current.get(currentPlayingRef.current);
      if (currentPlayer && !currentPlayer.paused) {
        // Aguardar um tick para evitar conflitos com play() em progresso
        setTimeout(() => {
          if (currentPlayer && !currentPlayer.paused) {
            currentPlayer.pause();
          }
        }, 10);
      }
    }
    currentPlayingRef.current = id;
  }, []);

  const unregisterPlayer = useCallback((id: string) => {
    const element = playersRef.current.get(id);
    if (element && !element.paused) {
      element.pause();
    }
    playersRef.current.delete(id);
    
    if (currentPlayingRef.current === id) {
      currentPlayingRef.current = null;
    }
  }, []);

  const getCurrentPlaying = useCallback(() => {
    return currentPlayingRef.current;
  }, []);

  return (
    <MediaManagerContext.Provider value={{
      stopAllMedia,
      registerVideoPlayer,
      unregisterPlayer,
      getCurrentPlaying,
      setCurrentPlaying
    }}>
      {children}
    </MediaManagerContext.Provider>
  );
};