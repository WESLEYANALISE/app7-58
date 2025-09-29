import { createContext, useContext, useRef, useCallback, ReactNode } from 'react';

interface MediaManagerEnhancedType {
  stopAllMedia: () => void;
  registerPlayer: (id: string, player: any) => void;
  unregisterPlayer: (id: string) => void;
  getCurrentPlaying: () => string | null;
  setCurrentPlaying: (id: string | null) => void;
  pauseCurrentPlayer: () => void;
}

const MediaManagerEnhanced = createContext<MediaManagerEnhancedType | null>(null);

export const useMediaManagerEnhanced = () => {
  const context = useContext(MediaManagerEnhanced);
  if (!context) {
    throw new Error('useMediaManagerEnhanced deve ser usado dentro do MediaManagerEnhancedProvider');
  }
  return context;
};

export const MediaManagerEnhancedProvider = ({ children }: { children: ReactNode }) => {
  const playersRef = useRef<Map<string, any>>(new Map());
  const currentPlayingRef = useRef<string | null>(null);

  const stopAllMedia = useCallback(() => {
    playersRef.current.forEach((player) => {
      try {
        if (player && typeof player.pause === 'function') {
          player.pause();
        }
        if (player && typeof player.seekTo === 'function') {
          player.seekTo(0);
        }
      } catch (error) {
        console.warn('Erro ao parar mídia:', error);
      }
    });
    currentPlayingRef.current = null;
  }, []);

  const pauseCurrentPlayer = useCallback(() => {
    if (currentPlayingRef.current) {
      const currentPlayer = playersRef.current.get(currentPlayingRef.current);
      if (currentPlayer && typeof currentPlayer.pause === 'function') {
        try {
          currentPlayer.pause();
        } catch (error) {
          console.warn('Erro ao pausar player atual:', error);
        }
      }
    }
  }, []);

  const registerPlayer = useCallback((id: string, player: any) => {
    // Para o player atual antes de registrar um novo
    pauseCurrentPlayer();
    
    playersRef.current.set(id, player);
    currentPlayingRef.current = id;
  }, [pauseCurrentPlayer]);

  const unregisterPlayer = useCallback((id: string) => {
    const player = playersRef.current.get(id);
    if (player && typeof player.pause === 'function') {
      try {
        player.pause();
      } catch (error) {
        console.warn('Erro ao desregistrar player:', error);
      }
    }
    playersRef.current.delete(id);
    
    if (currentPlayingRef.current === id) {
      currentPlayingRef.current = null;
    }
  }, []);

  const getCurrentPlaying = useCallback(() => {
    return currentPlayingRef.current;
  }, []);

  const setCurrentPlaying = useCallback((id: string | null) => {
    if (currentPlayingRef.current && currentPlayingRef.current !== id) {
      pauseCurrentPlayer();
    }
    currentPlayingRef.current = id;
  }, [pauseCurrentPlayer]);

  return (
    <MediaManagerEnhanced.Provider value={{
      stopAllMedia,
      registerPlayer,
      unregisterPlayer,
      getCurrentPlaying,
      setCurrentPlaying,
      pauseCurrentPlayer
    }}>
      {children}
    </MediaManagerEnhanced.Provider>
  );
};