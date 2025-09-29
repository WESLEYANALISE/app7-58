
import { useState, useEffect } from 'react';
import { getUserIP } from '@/utils/platformDetection';

const RATING_TIMER_KEY = 'direito_rating_timer';
const RATING_SHOWN_KEY = 'direito_rating_shown';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias em milliseconds
const THREE_MINUTES_MS = 3 * 60 * 1000; // 3 minutos em milliseconds

interface RatingData {
  ip: string;
  lastShown: number;
  dismissed: boolean;
}

export const useRatingSystem = () => {
  const [showRating, setShowRating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(THREE_MINUTES_MS);
  const [isActive, setIsActive] = useState(false);

  // Inicializar o timer quando o hook é montado
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const initializeRatingSystem = async () => {
      const userIP = await getUserIP();
      const ratingData = localStorage.getItem(RATING_SHOWN_KEY);
      
      if (ratingData) {
        const data: RatingData = JSON.parse(ratingData);
        const now = Date.now();
        const timeSinceLastShown = now - data.lastShown;
        
        // Se o IP é diferente ou já passou 7 dias
        if (data.ip !== userIP || timeSinceLastShown >= SEVEN_DAYS_MS) {
          setIsActive(true);
          startTimer();
        }
      } else {
        // Primeira vez do usuário
        setIsActive(true);
        startTimer();
      }
    };

    const startTimer = () => {
      const startTime = Date.now();
      
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = THREE_MINUTES_MS - elapsed;
        
        if (remaining <= 0) {
          setTimeRemaining(0);
          setShowRating(true);
          clearInterval(timer);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    };

    initializeRatingSystem();

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const dismissRating = async () => {
    const userIP = await getUserIP();
    const ratingData: RatingData = {
      ip: userIP,
      lastShown: Date.now(),
      dismissed: true
    };
    
    localStorage.setItem(RATING_SHOWN_KEY, JSON.stringify(ratingData));
    setShowRating(false);
    setIsActive(false);
  };

  const rateApp = async () => {
    await dismissRating();
  };

  return {
    showRating,
    timeRemaining,
    isActive,
    dismissRating,
    rateApp
  };
};
