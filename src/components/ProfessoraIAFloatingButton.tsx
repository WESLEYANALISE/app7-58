import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface ProfessoraIAFloatingButtonProps {
  onOpen: () => void;
}
export const ProfessoraIAFloatingButton = ({
  onOpen
}: ProfessoraIAFloatingButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return <AnimatePresence>
      <motion.div className="fixed bottom-6 right-6 z-40" initial={{
      y: 100,
      opacity: 0,
      scale: 0.8
    }} animate={{
      y: 0,
      opacity: 1,
      scale: 1
    }} exit={{
      y: 100,
      opacity: 0,
      scale: 0.8
    }} transition={{
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.3
    }}>
        <motion.div whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}>
          <Button
            onClick={onOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 shadow-lg hover:shadow-xl border-2 border-red-700/50"
            size="lg"
          >
            <Brain className="h-7 w-7 text-red-50" />
          </Button>
        </motion.div>
        
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && <motion.div className="absolute bottom-20 right-0 bg-red-900/95 backdrop-blur-sm text-red-50 px-4 py-3 rounded-xl text-sm whitespace-nowrap border border-red-700/50 shadow-xl shadow-red-900/30" initial={{
          opacity: 0,
          y: 10,
          scale: 0.9
        }} animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }} exit={{
          opacity: 0,
          y: 10,
          scale: 0.9
        }} transition={{
          duration: 0.2
        }}>
              Professora IA de Direito
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-900/95"></div>
            </motion.div>}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>;
};