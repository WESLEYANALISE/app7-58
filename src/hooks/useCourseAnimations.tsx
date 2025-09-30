import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export const useCourseAnimations = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return {
    ref,
    isInView,
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { duration: 0.5, ease: "easeOut" }
    },
    slideLeft: {
      initial: { opacity: 0, x: -30 },
      animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 },
      transition: { duration: 0.5, ease: "easeOut" }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };
};

export const useStaggerAnimation = (itemCount: number, baseDelay: number = 0.1) => {
  return (index: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.5,
      delay: index * baseDelay
    }
  });
};
