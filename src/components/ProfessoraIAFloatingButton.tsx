import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Brain } from 'lucide-react';

interface ProfessoraIAFloatingButtonProps {
  onOpen: () => void;
}

export const ProfessoraIAFloatingButton = ({
  onOpen
}: ProfessoraIAFloatingButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Load animation from URL
    fetch('https://lottie.host/462be1de-7e6c-4d35-bd11-bf0c61cd91c8/u08MMvLcmY.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => {
        console.error('Failed to load animation:', error);
      });
  }, []);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-6 right-6 z-[9999]" 
        initial={{
          y: 100,
          opacity: 0,
          scale: 0.8
        }} 
        animate={{
          y: 0,
          opacity: 1,
          scale: 1
        }} 
        exit={{
          y: 100,
          opacity: 0,
          scale: 0.8
        }} 
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.3
        }}
      >
        <motion.div 
          whileHover={{
            scale: 1.05
          }} 
          whileTap={{
            scale: 0.95
          }} 
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
        >
          <Button
            onClick={onOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-2xl hover:shadow-red-500/50 transition-all duration-300 border-2 border-white/20 p-2 relative"
            size="lg"
          >
            {animationData ? (
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <Lottie 
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  style={{ width: '120%', height: '120%' }}
                  className="text-white"
                />
              </div>
            ) : (
              <Brain className="h-8 w-8 text-white animate-pulse" />
            )}
          </Button>
        </motion.div>
        
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              className="absolute bottom-20 right-0 bg-red-900/95 backdrop-blur-sm text-red-50 px-4 py-3 rounded-xl text-sm whitespace-nowrap border border-red-700/50 shadow-xl shadow-red-900/30" 
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.9
              }} 
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} 
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.9
              }} 
              transition={{
                duration: 0.2
              }}
            >
              Professora IA de Direito
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-900/95"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};