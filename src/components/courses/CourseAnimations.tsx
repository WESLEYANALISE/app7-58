import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useCourseAnimations } from '@/hooks/useCourseAnimations';

interface CourseAnimationsProps {
  children: ReactNode;
  variant?: 'fadeIn' | 'slideLeft' | 'scale' | 'stagger';
  delay?: number;
  className?: string;
}

export const CourseAnimations = ({ 
  children, 
  variant = 'fadeIn',
  delay = 0,
  className = ''
}: CourseAnimationsProps) => {
  const { elementRef, isVisible } = useCourseAnimations();

  const variants = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    slideLeft: {
      initial: { opacity: 0, x: -60 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 60 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    },
    stagger: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 }
    }
  };

  const selectedVariant = variants[variant];

  return (
    <motion.div
      ref={elementRef}
      initial={selectedVariant.initial}
      animate={isVisible ? selectedVariant.animate : selectedVariant.initial}
      exit={selectedVariant.exit}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
