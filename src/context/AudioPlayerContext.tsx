import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { AudioAula } from '@/hooks/useAudioaulas';

interface AudioPlayerState {
  currentAudio: AudioAula | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  playlist: AudioAula[];
  currentIndex: number;
  isVisible: boolean;
}

interface AudioPlayerContextType extends AudioPlayerState {
  playAudio: (audio: AudioAula, playlist?: AudioAula[]) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer deve ser usado dentro de AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [state, setState] = useState<AudioPlayerState>({
    currentAudio: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
    playlist: [],
    currentIndex: -1,
    isVisible: false,
  });

  const playAudio = (audio: AudioAula, playlist: AudioAula[] = []) => {
    console.log('🎵 Tentando reproduzir áudio:', audio.titulo);
    console.log('🎵 URL do áudio:', audio.url_audio);
    
    if (audioRef.current && audio.url_audio) {
      const newPlaylist = playlist.length > 0 ? playlist : [audio];
      const currentIndex = newPlaylist.findIndex(item => item.id === audio.id);
      
      setState(prev => ({
        ...prev,
        currentAudio: audio,
        playlist: newPlaylist,
        currentIndex: currentIndex !== -1 ? currentIndex : 0,
        isLoading: true,
        isVisible: true,
      }));
      
      // Parar o áudio atual se estiver tocando
      audioRef.current.pause();
      audioRef.current.src = audio.url_audio;
      audioRef.current.load();
      
      console.log('🎵 Áudio carregado, aguardando reprodução...');
    } else {
      console.error('❌ Erro: audioRef não disponível ou URL de áudio inválida');
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (state.isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setState(prev => ({ ...prev, volume }));
    }
  };

  const nextTrack = () => {
    const { playlist, currentIndex } = state;
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextAudio = playlist[currentIndex + 1];
      playAudio(nextAudio, playlist);
    }
  };

  const previousTrack = () => {
    const { playlist, currentIndex } = state;
    if (playlist.length > 0 && currentIndex > 0) {
      const prevAudio = playlist[currentIndex - 1];
      playAudio(prevAudio, playlist);
    }
  };

  const showPlayer = () => {
    setState(prev => ({ ...prev, isVisible: true }));
  };

  const hidePlayer = () => {
    setState(prev => ({ ...prev, isVisible: false }));
  };

  // Event listeners para o elemento audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      console.log('🎵 Dados do áudio carregados, duração:', audio.duration);
      setState(prev => ({ 
        ...prev, 
        duration: audio.duration, 
        isLoading: false 
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ 
        ...prev, 
        currentTime: audio.currentTime 
      }));
    };

    const handlePlay = () => {
      console.log('🎵 Áudio iniciado');
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    };

    const handlePause = () => {
      console.log('🎵 Áudio pausado');
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      console.log('🎵 Áudio finalizado, próxima faixa...');
      nextTrack();
    };

    const handleCanPlay = () => {
      console.log('🎵 Áudio pronto para reprodução');
      if (state.currentAudio) {
        audio.play().then(() => {
          console.log('🎵 Reprodução iniciada com sucesso');
        }).catch(error => {
          console.error('❌ Erro ao iniciar reprodução:', error);
          setState(prev => ({ ...prev, isLoading: false }));
        });
      }
    };

    const handleError = (e: any) => {
      console.error('❌ Erro no áudio:', e);
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [state.currentAudio]);

  const contextValue: AudioPlayerContextType = {
    ...state,
    playAudio,
    pauseAudio,
    resumeAudio,
    togglePlayPause,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    showPlayer,
    hidePlayer,
    audioRef,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </AudioPlayerContext.Provider>
  );
};