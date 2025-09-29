import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AudioAula } from '@/hooks/useAudioaulas';

interface AudioProgressState {
  favorites: number[];
  listened: number[];
  completed: number[];
  progress: { [audioId: number]: number };
}

interface AudioProgressContextType extends AudioProgressState {
  addToFavorites: (audioId: number) => void;
  removeFromFavorites: (audioId: number) => void;
  isFavorite: (audioId: number) => boolean;
  markAsListened: (audioId: number) => void;
  markAsCompleted: (audioId: number) => void;
  updateProgress: (audioId: number, progress: number) => void;
  getProgress: (audioId: number) => number;
  isCompleted: (audioId: number) => boolean;
  isListened: (audioId: number) => boolean;
}

const AudioProgressContext = createContext<AudioProgressContextType | null>(null);

export const useAudioProgress = () => {
  const context = useContext(AudioProgressContext);
  if (!context) {
    throw new Error('useAudioProgress deve ser usado dentro de AudioProgressProvider');
  }
  return context;
};

interface AudioProgressProviderProps {
  children: ReactNode;
}

export const AudioProgressProvider: React.FC<AudioProgressProviderProps> = ({ children }) => {
  const [state, setState] = useState<AudioProgressState>({
    favorites: [],
    listened: [],
    completed: [],
    progress: {}
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem('audioProgress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setState(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados de progresso:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que o estado mudar
  useEffect(() => {
    localStorage.setItem('audioProgress', JSON.stringify(state));
  }, [state]);

  const addToFavorites = (audioId: number) => {
    setState(prev => ({
      ...prev,
      favorites: [...prev.favorites.filter(id => id !== audioId), audioId]
    }));
  };

  const removeFromFavorites = (audioId: number) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(id => id !== audioId)
    }));
  };

  const isFavorite = (audioId: number) => {
    return state.favorites.includes(audioId);
  };

  const markAsListened = (audioId: number) => {
    setState(prev => ({
      ...prev,
      listened: [...prev.listened.filter(id => id !== audioId), audioId]
    }));
  };

  const markAsCompleted = (audioId: number) => {
    setState(prev => ({
      ...prev,
      completed: [...prev.completed.filter(id => id !== audioId), audioId],
      listened: [...prev.listened.filter(id => id !== audioId), audioId]
    }));
  };

  const updateProgress = (audioId: number, progress: number) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [audioId]: progress
      }
    }));

    // Auto-marcar como ouvido se passou de 10%
    if (progress > 0.1) {
      markAsListened(audioId);
    }

    // Auto-marcar como completo se passou de 90%
    if (progress > 0.9) {
      markAsCompleted(audioId);
    }
  };

  const getProgress = (audioId: number) => {
    return state.progress[audioId] || 0;
  };

  const isCompleted = (audioId: number) => {
    return state.completed.includes(audioId);
  };

  const isListened = (audioId: number) => {
    return state.listened.includes(audioId);
  };

  const contextValue: AudioProgressContextType = {
    ...state,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    markAsListened,
    markAsCompleted,
    updateProgress,
    getProgress,
    isCompleted,
    isListened,
  };

  return (
    <AudioProgressContext.Provider value={contextValue}>
      {children}
    </AudioProgressContext.Provider>
  );
};